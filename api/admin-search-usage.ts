import {
  type RequestLike, type ResponseLike, applyCors, checkRateLimit,
  getClientIp, getDb, getRequesterSession
} from './_security.js';
import { ensureSearchUsageTable } from './_searchUsage.js';

const STATE_KEY = 'admitroute_global_state_v1';

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (applyCors(req, res)) return;
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
  if (!checkRateLimit(getClientIp(req), 60, 60000)) {
    return res.status(429).json({ error: 'Слишком много запросов.' });
  }

  const session = getRequesterSession(req);
  if (!session) return res.status(401).json({ error: 'Требуется вход в аккаунт.' });

  try {
    const sql = getDb();
    const stateRows = await sql`SELECT value FROM app_state WHERE key = ${STATE_KEY};`;
    const user = (stateRows[0]?.value?.users || []).find((item: { id?: string }) => item.id === session.userId);
    if (!user || user.isBanned || (user.role !== 'admin' && !user.isSuperAdmin)) {
      return res.status(403).json({ error: 'Нет доступа к статистике.' });
    }

    await ensureSearchUsageTable(sql);
    const rows = await sql`
      SELECT actor_id AS "userId", SUM(used)::integer AS total,
        COALESCE(SUM(used) FILTER (WHERE usage_day = (NOW() AT TIME ZONE 'UTC')::date), 0)::integer AS today
      FROM ai_search_usage
      WHERE actor_id NOT LIKE 'guest:%'
      GROUP BY actor_id;
    `;
    return res.status(200).json({ usage: rows });
  } catch (error) {
    console.error('[Admin search usage failed]', error);
    return res.status(503).json({ error: 'Статистика поиска временно недоступна.' });
  }
}
