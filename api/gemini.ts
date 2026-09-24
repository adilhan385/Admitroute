import { z } from 'zod';
import {
  type RequestLike,
  type ResponseLike,
  applyCors,
  checkRateLimit,
  getClientIp,
  sendSanitizedError
} from './_security';

const PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODELS = ['gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash'];

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
          return res.status(200).json({ content, model });
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

  return sendSanitizedError(res, new Error('All Gemini models failed'), 502, 'Не удалось получить ответ от AI-модели');
}
