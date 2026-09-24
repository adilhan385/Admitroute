import { z } from 'zod';
import {
  type RequestLike,
  type ResponseLike,
  applyCors,
  checkRateLimit,
  getClientIp,
  getDb,
  getRequesterSession
} from './_security';

const PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODELS = ['gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash'];
const STATE_KEY = 'admitroute_global_state_v1';

const GeminiRequestSchema = z.object({
  prompt: z.string().min(1, 'Промпт не может быть пустым').max(15000),
  responseMimeType: z.enum(['application/json', 'text/plain']).optional().default('application/json'),
  temperature: z.number().min(0).max(2).optional().default(0.3)
});

function extractJsonBlock(raw: string): string {
  const text = raw.trim();
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.substring(firstBrace, lastBrace + 1).trim();
  }
  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    return text.substring(firstBracket, lastBracket + 1).trim();
  }
  return text;
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (applyCors(req, res)) return;

  const clientIp = getClientIp(req);
  // Rate limit: 20 AI requests per minute per IP
  if (!checkRateLimit(clientIp, 20, 60000)) {
    return res.status(429).json({ error: 'Слишком много запросов к AI. Пожалуйста, подождите минуту.' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const parsed = GeminiRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Некорректный запрос' });
  }

  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    return res.status(503).json({
      error: 'AI сервис временно недоступен (не настроен GEMINI_API_KEY на сервере)',
      code: 'GEMINI_KEY_MISSING'
    });
  }

  const session = getRequesterSession(req);
  const todayStr = new Date().toISOString().slice(0, 10);
  let sql: any = null;
  let globalState: any = null;
  let currentUser: any = null;
  let quotaInfo: any = null;

  // Server-side rolling quota check
  if (session) {
    try {
      sql = getDb();
      const rows = await sql`SELECT value FROM app_state WHERE key = ${STATE_KEY};`;
      globalState = rows[0]?.value || { users: [] };
      currentUser = (globalState.users || []).find((u: any) => u.id === session.userId);

      if (currentUser) {
        const isAdmin = currentUser.role === 'admin' || currentUser.isSuperAdmin;
        const maxDaily = isAdmin ? 100 : (currentUser.subscriptionTier === 'pro' ? 50 : 5);

        currentUser.dailySearches = currentUser.dailySearches || {
          count: 0,
          date: todayStr,
          maxPerDay: maxDaily,
          bonusCount: 0
        };

        // Reset if date changed
        if (currentUser.dailySearches.date !== todayStr) {
          currentUser.dailySearches.count = 0;
          currentUser.dailySearches.date = todayStr;
          currentUser.dailySearches.maxPerDay = maxDaily;
        }

        const totalAllowed = (currentUser.dailySearches.maxPerDay || maxDaily) + (currentUser.dailySearches.bonusCount || 0);

        if (!isAdmin && currentUser.dailySearches.count >= totalAllowed) {
          return res.status(429).json({
            error: `Дневной лимит AI-поисков исчерпан (${currentUser.dailySearches.count}/${totalAllowed}). Лимит обновится в 00:00 UTC. Пригласите друга по реферальной ссылке для получения +5 бонусных поисков!`,
            dailyQuota: {
              remaining: 0,
              max: totalAllowed,
              count: currentUser.dailySearches.count,
              resetsAt: '00:00 UTC'
            }
          });
        }

        quotaInfo = {
          remaining: Math.max(0, totalAllowed - currentUser.dailySearches.count - 1),
          max: totalAllowed,
          count: currentUser.dailySearches.count + 1,
          resetsAt: '00:00 UTC'
        };
      }
    } catch (e) {
      console.warn('[Gemini Quota Check warn]:', e);
    }
  }

  const { prompt, responseMimeType, temperature } = parsed.data;
  const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS];

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType,
            temperature
          }
        })
      });

      if (response.ok) {
        const data = (await response.json()) as any;
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const content = responseMimeType === 'application/json' ? extractJsonBlock(rawText) : rawText.trim();

          // Persist quota decrement and update streak
          if (currentUser && sql && globalState) {
            currentUser.dailySearches.count = (currentUser.dailySearches.count || 0) + 1;
            currentUser.usageStats = currentUser.usageStats || {};
            currentUser.usageStats.searchesCount = (currentUser.usageStats.searchesCount || 0) + 1;

            // Gamification streak update
            if (!currentUser.gamification) {
              currentUser.gamification = { streak: { currentStreak: 1, longestStreak: 1, lastActiveDate: todayStr }, badges: ['profile_started'] };
            } else if (currentUser.gamification.streak?.lastActiveDate !== todayStr) {
              const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
              if (currentUser.gamification.streak.lastActiveDate === yesterday) {
                currentUser.gamification.streak.currentStreak = (currentUser.gamification.streak.currentStreak || 1) + 1;
              } else {
                currentUser.gamification.streak.currentStreak = 1;
              }
              currentUser.gamification.streak.lastActiveDate = todayStr;
              currentUser.gamification.streak.longestStreak = Math.max(
                currentUser.gamification.streak.longestStreak || 1,
                currentUser.gamification.streak.currentStreak
              );
            }

            globalState.updatedAt = new Date().toISOString();
            await sql`
              INSERT INTO app_state (key, value, updated_at)
              VALUES (${STATE_KEY}, ${JSON.stringify(globalState)}::jsonb, NOW())
              ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
            `.catch((e: any) => console.error('[State save error]:', e));
          }

          return res.status(200).json({ content, model, dailyQuota: quotaInfo });
        }
      } else {
        const errJson = (await response.json().catch(() => ({}))) as any;
        console.warn(`[Gemini API ${model}] Status ${response.status}:`, errJson?.error?.message || response.statusText);
        if (response.status === 401 || response.status === 403) {
          break; // Stop if key is invalid/exhausted
        }
      }
    } catch (err) {
      console.warn(`[Gemini API ${model}] Network failure:`, err);
    }
  }

  return res.status(502).json({
    error: 'Не удалось получить ответ от моделей Gemini. Пожалуйста, повторите запрос позже.',
    code: 'ALL_MODELS_FAILED'
  });
}
