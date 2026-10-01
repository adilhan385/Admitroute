import crypto from 'node:crypto';
import { z } from 'zod';
import {
  type RequestLike, type ResponseLike, applyCors, checkRateLimit,
  getClientIp, getDb, getRequesterSession
} from './_security.js';
import { ensureSearchUsageTable } from './_searchUsage.js';

const STATE_KEY = 'admitroute_global_state_v1';
const MODEL = 'gemini-3.8-flash';
const SearchSchema = z.object({
  mode: z.enum(['catalogue', 'research']).default('research'),
  query: z.string().trim().min(2).max(160),
  profile: z.object({
    field: z.enum(['cs_it', 'engineering', 'business_econ', 'medicine_bio', 'design_media', 'social_law']),
    gpa: z.number().min(0).max(5),
    gpaScale: z.enum(['4.0', '5.0']).optional(),
    languageScore: z.string().max(80),
    stateExamScore: z.string().max(80),
    satScore: z.string().max(80).optional(),
    budget: z.enum(['full_grant', 'low_cost', 'mid_cost', 'any']),
    targetYear: z.string().max(8)
  })
});

type Quota = { used: number; max: number | null; remaining: number | null; resetsAt: string };

function quotaResponse(used: number, max: number | null): Quota {
  const tomorrow = new Date();
  tomorrow.setUTCHours(24, 0, 0, 0);
  return { used, max, remaining: max === null ? null : Math.max(0, max - used), resetsAt: tomorrow.toISOString() };
}

function parseModelJson(text: string): any {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  return JSON.parse(cleaned);
}

async function researchWithWikipedia(query: string, profile: z.infer<typeof SearchSchema>['profile'], apiKey: string) {
  const headers = { 'Accept': 'application/json', 'User-Agent': 'AdmitRoute/1.0 (https://admitroute.vercel.app)' };
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=8&format=json`;
  const searchResponse = await fetch(searchUrl, { headers, signal: AbortSignal.timeout(12000) });
  if (!searchResponse.ok) throw new Error(`Wikipedia HTTP ${searchResponse.status}`);
  const searchData = await searchResponse.json() as any;
  const words = query.toLowerCase().match(/[\p{L}\p{N}]+/gu)?.filter(word =>
    word.length > 2 && !['university', 'college', 'institute', 'университет', 'институт', 'the'].includes(word)
  ) || [];
  const hit = (searchData.query?.search || []).find((item: any) => {
    const title = String(item.title || '').toLowerCase();
    return /(university|college|institute|университет)/i.test(title) &&
      words.length > 0 && words.every(word => title.includes(word));
  });
  if (!hit) return { found: false, university: null, sources: [] as string[] };

  const title = String(hit.title);
  const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`;
  const propsUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageprops&ppprop=wikibase_item&titles=${encodeURIComponent(title)}&format=json`;
  const [summaryResponse, propsResponse] = await Promise.all([
    fetch(summaryUrl, { headers, signal: AbortSignal.timeout(12000) }),
    fetch(propsUrl, { headers, signal: AbortSignal.timeout(12000) })
  ]);
  if (!summaryResponse.ok || !propsResponse.ok) throw new Error('University source unavailable');
  const summary = await summaryResponse.json() as any;
  const props = await propsResponse.json() as any;
  const qid = Object.values(props.query?.pages || {})
    .map((page: any) => page.pageprops?.wikibase_item)
    .find((value): value is string => typeof value === 'string');
  if (!qid || !/\b(university|college|institute|higher education)\b/i.test(`${summary.description || ''} ${summary.extract || ''}`)) {
    return { found: false, university: null, sources: [] as string[] };
  }
  const claimsResponse = await fetch(
    `https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${encodeURIComponent(qid)}&property=P856&format=json`,
    { headers, signal: AbortSignal.timeout(12000) }
  );
  if (!claimsResponse.ok) throw new Error('Official site source unavailable');
  const claims = await claimsResponse.json() as any;
  const officialSiteUrl = claims.claims?.P856?.[0]?.mainsnak?.datavalue?.value;
  if (typeof officialSiteUrl !== 'string' || !/^https:\/\//.test(officialSiteUrl)) {
    return { found: false, university: null, sources: [] as string[] };
  }

  const prompt = `Ты проверяешь конкретный университет. Запрос: ${JSON.stringify(query)}.
Источник Wikipedia: ${JSON.stringify({ title: summary.title, description: summary.description, extract: String(summary.extract || '').slice(0, 3500) })}.
Официальный сайт из Wikidata: ${officialSiteUrl}.
Профиль: направление ${profile.field}, GPA ${profile.gpa}/${profile.gpaScale || '5.0'}, язык ${profile.languageScore || 'не указан'}, экзамен ${profile.stateExamScore || 'не указан'}, SAT ${profile.satScore || 'не указан'}, бюджет ${profile.budget}, год ${profile.targetYear}.
Если источник не описывает именно запрошенный вуз, ответь found=false. Иначе верни JSON с полями found, name, shortName, city, country, region (kazakhstan/europe/asia/usa), programTitle, acceptanceRate, avgGpa, languageRequirement, examRequirement, tuitionYearKztOrUsd, applicationDeadline, scholarshipAvailability, hasDormitory, whyFits, keyStrengths. Если программа или правила приёма не подтверждены в источнике, пиши null. Не придумывай баллы, цену, дедлайны, гранты, работодателей или шанс зачисления.`;
  const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1, responseMimeType: 'application/json' } }),
    signal: AbortSignal.timeout(30000)
  });
  if (!aiResponse.ok) throw new Error(`Gemini fallback HTTP ${aiResponse.status}`);
  const aiData = await aiResponse.json() as any;
  const raw = aiData.candidates?.[0]?.content?.parts?.map((part: any) => part.text || '').join('') || '';
  const result = parseModelJson(raw);
  if (result.found !== true) return { found: false, university: null, sources: [] as string[] };
  return {
    found: true,
    university: { ...result, name: summary.title, officialSiteUrl },
    sources: [summary.content_urls?.desktop?.page || summaryUrl, officialSiteUrl]
  };
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (applyCors(req, res)) return;
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const session = getRequesterSession(req);
  const secret = process.env.JWT_SECRET || 'admitroute-guest-quota';
  const actorId = session?.userId || `guest:${crypto.createHmac('sha256', secret).update(getClientIp(req)).digest('hex')}`;
  const day = new Date().toISOString().slice(0, 10);

  try {
    const sql = getDb();
    await ensureSearchUsageTable(sql);
    const stateRows = await sql`SELECT value FROM app_state WHERE key = ${STATE_KEY};`;
    const state = stateRows[0]?.value || {};
    const user = session ? (state.users || []).find((u: any) => u.id === session.userId && !u.isBanned) : null;
    const isAdmin = !!user && (user.role === 'admin' || user.isSuperAdmin === true);
    const isPro = !!user && (isAdmin || user.subscriptionTier === 'pro');
    if (!isAdmin && !checkRateLimit(getClientIp(req), 30, 60000)) {
      return res.status(429).json({ error: 'Слишком много запросов. Повторите позже.' });
    }
    const settings = state.settings || {};
    const configuredMax = user ? settings.freeCustomerMaxSearches : settings.guestMaxSearches;
    const baseMax = Math.max(1, Math.min(100, Number(configuredMax) || (user ? 8 : 2)));
    const bonus = user ? Math.max(0, Number(user.dailySearches?.bonusCount) || 0) : 0;
    const max = isPro ? null : baseMax + bonus;
    const usageRows = await sql`SELECT used FROM ai_search_usage WHERE actor_id = ${actorId} AND usage_day = ${day}::date;`;
    const used = Number(usageRows[0]?.used || 0);

    if (req.method === 'GET') {
      return res.status(200).json({ quota: quotaResponse(used, max) });
    }

    const parsed = SearchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Укажите название университета и профиль абитуриента.' });
    }
    if (parsed.data.mode === 'research' && !process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'AI-поиск не настроен на сервере.' });
    }
    if (max !== null && used >= max) {
      return res.status(429).json({ error: 'Лимит AI-поисков на сегодня исчерпан.', quota: quotaResponse(used, max) });
    }

    // Reserve one attempt atomically, so parallel tabs cannot bypass the quota.
    const reserved = await sql`
      INSERT INTO ai_search_usage (actor_id, usage_day, used)
      VALUES (${actorId}, ${day}::date, 1)
      ON CONFLICT (actor_id, usage_day) DO UPDATE
      SET used = ai_search_usage.used + 1
      WHERE ${max === null} OR ai_search_usage.used < ${max ?? 0}
      RETURNING used;
    `;
    if (!reserved.length) {
      const latest = await sql`SELECT used FROM ai_search_usage WHERE actor_id = ${actorId} AND usage_day = ${day}::date;`;
      return res.status(429).json({ error: 'Лимит AI-поисков на сегодня исчерпан.', quota: quotaResponse(Number(latest[0]?.used || 0), max) });
    }
    const newUsed = Number(reserved[0].used);
    const quota = quotaResponse(newUsed, max);

    if (parsed.data.mode === 'catalogue') {
      return res.status(200).json({ quota });
    }

    const { query, profile } = parsed.data;
    const prompt = `Найди информацию о конкретном университете по запросу пользователя: ${JSON.stringify(query)}.
Используй Google Search. Проверь существование учреждения, его официальный сайт и программу бакалавриата по направлению ${profile.field}.
Не подменяй вуз похожим. Если точное учреждение не установлено, ответь found=false.
Профиль: GPA ${profile.gpa}/${profile.gpaScale || '5.0'}, язык ${profile.languageScore || 'не указан'}, экзамен ${profile.stateExamScore || 'не указан'}, SAT ${profile.satScore || 'не указан'}, бюджет ${profile.budget}, год ${profile.targetYear}.
Верни только JSON объект: {"found":boolean,"name":string,"shortName":string,"city":string,"country":string,"region":"kazakhstan"|"europe"|"asia"|"usa","programTitle":string,"officialSiteUrl":string,"acceptanceRate":string|null,"avgGpa":number|null,"languageRequirement":string|null,"examRequirement":string|null,"tuitionYearKztOrUsd":string|null,"applicationDeadline":string|null,"scholarshipAvailability":"100% гранты"|"Частичные стипендии"|"Ограничено"|null,"hasDormitory":boolean|null,"whyFits":string[],"keyStrengths":string[]}.
Не выдумывай процент приема, проходной GPA, цену, дедлайн, стипендию или работодателей. Для неподтвержденных сведений используй null. Не рассчитывай вероятность поступления.`;

    try {
      const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], tools: [{ google_search: {} }], generationConfig: { temperature: 0.1 } }),
        signal: AbortSignal.timeout(30000)
      });
      if (googleResponse.status === 429) {
        const fallback = await researchWithWikipedia(query, profile, process.env.GEMINI_API_KEY!);
        return res.status(200).json({ ...fallback, quota });
      }
      if (!googleResponse.ok) throw new Error(`Gemini HTTP ${googleResponse.status}`);
      const data = await googleResponse.json() as any;
      const candidate = data.candidates?.[0];
      const raw = candidate?.content?.parts?.map((part: any) => part.text || '').join('') || '';
      const result = parseModelJson(raw);
      const sources = (candidate?.groundingMetadata?.groundingChunks || [])
        .map((chunk: any) => chunk.web?.uri)
        .filter((url: unknown): url is string => typeof url === 'string' && url.startsWith('https://'));
      const verified = result?.found === true && typeof result.name === 'string' &&
        typeof result.officialSiteUrl === 'string' && /^https:\/\//.test(result.officialSiteUrl) && sources.length > 0;
      return res.status(200).json({ found: verified, university: verified ? result : null, sources, quota });
    } catch (error) {
      // A failed provider call should not consume a search attempt.
      await sql`UPDATE ai_search_usage SET used = GREATEST(0, used - 1) WHERE actor_id = ${actorId} AND usage_day = ${day}::date;`;
      console.error('[University search failed]', error);
      return res.status(502).json({ error: 'AI-поиск временно недоступен. Попробуйте ещё раз.' });
    }
  } catch (error) {
    console.error('[University search storage failed]', error);
    return res.status(503).json({ error: 'База данных поиска временно недоступна.' });
  }
}
