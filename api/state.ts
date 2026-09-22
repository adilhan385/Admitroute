type Request = { method?: string; body?: unknown };
type Response = { status: (code: number) => Response; json: (data: unknown) => void; setHeader: (name: string, value: string) => void };
const KEY = 'admitroute:shared-state:v1';
async function redis(command: string, ...args: unknown[]) {
  const url = process.env.STORAGE_URL || process.env.KV_REST_API_URL || process.env.UPSTASH_KV_REST_API_URL;
  const token = process.env.STORAGE_TOKEN || process.env.KV_REST_API_TOKEN || process.env.UPSTASH_KV_REST_API_TOKEN;
  if (!url || !token) throw new Error('Redis storage is not configured');
  const path = args.map(v => encodeURIComponent(typeof v === 'string' ? v : JSON.stringify(v))).join('/');
  const response = await fetch(`${url}/${command}/${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error('Redis request failed');
  return response.json() as Promise<{ result?: unknown }>;
}
async function readState() {
  const result = (await redis('get', KEY)).result;
  if (typeof result === 'string') {
    try { return JSON.parse(result) as Record<string, unknown>; } catch { return {}; }
  }
  return result && typeof result === 'object' ? result as Record<string, unknown> : {};
}
export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') return res.status(200).json({ state: await readState() });
    if (req.method !== 'POST' || !req.body || typeof req.body !== 'object') return res.status(400).json({ error: 'Invalid request' });
    const current = await readState();
    const incoming = req.body as Record<string, unknown>;
    const state = { users: Array.isArray(incoming.users) ? incoming.users : current.users ?? [], messages: Array.isArray(incoming.messages) ? incoming.messages : current.messages ?? [], settings: incoming.settings && typeof incoming.settings === 'object' ? incoming.settings : current.settings ?? {}, updatedAt: new Date().toISOString() };
    await redis('set', KEY, state);
    return res.status(200).json({ state });
  } catch (error) { return res.status(503).json({ error: error instanceof Error ? error.message : 'Storage unavailable' }); }
}
