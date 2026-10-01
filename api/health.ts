import { type RequestLike, type ResponseLike, getDb } from './_security.js';

export default async function handler(req: RequestLike, res: ResponseLike) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  if (!process.env.DATABASE_URL) {
    return res.status(503).json({ status: 'database_not_configured' });
  }
  try {
    const sql = getDb();
    await sql`SELECT 1 FROM app_state LIMIT 1;`;
    return res.status(200).json({ status: 'ok' });
  } catch {
    return res.status(503).json({ status: 'database_unavailable' });
  }
}
