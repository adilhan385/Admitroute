type Request = { method?: string; body?: unknown };
type Response = {
  status: (code: number) => Response;
  json: (data: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

const NEON_HOST = 'ep-shy-butterfly-b4s3isp6-pooler.c-6.us-east-2.aws.neon.tech';
const NEON_URL = `https://${NEON_HOST}/sql`;
const NEON_CONN =
  process.env.DATABASE_URL ||
  `postgresql://neondb_owner:npg_f51BdGjPnHkM@${NEON_HOST}/neondb?sslmode=require`;

const SUPER_ADMIN_EMAIL = 'adilhananuar426@gmail.com';
const SEED_ADMIN = {
  id: 'user-admin-01',
  email: 'adilhananuar426@gmail.com',
  name: 'Адильхан (Главный Администратор)',
  password: 'Lolkek4ik',
  role: 'admin',
  subscriptionTier: 'pro',
  isSuperAdmin: true,
  isBanned: false,
  createdAt: '2026-09-01T10:00:00Z',
  usageStats: { searchesCount: 42, recalculationsCount: 18 },
  notes: 'Создатель и Главный Администратор платформы AdmitRoute'
};

const FAKE_DEMO_EMAILS = [
  'student@admitroute.kz',
  'aizada.sat@gmail.com',
  'daniyar.nurgali@mail.kz',
  'madina.k@inbox.ru',
  'timur.b@gmail.com',
  'kamila.yerzhan@gmail.com',
  'yerassyl.m@gmail.com'
];

async function executeNeonSql(sql: string) {
  const res = await fetch(NEON_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Neon-Connection-String': NEON_CONN
    },
    body: JSON.stringify({ query: sql })
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Neon error ${res.status}: ${errText}`);
  }
  return res.json() as Promise<{ rows?: any[] }>;
}

async function readState() {
  const query = "SELECT value, updated_at FROM app_state WHERE key = 'admitroute_global_state_v1';";
  const result = await executeNeonSql(query);
  const row = result.rows?.[0];
  if (row && row.value && typeof row.value === 'object') {
    return {
      users: Array.isArray(row.value.users) ? row.value.users : [SEED_ADMIN],
      messages: Array.isArray(row.value.messages) ? row.value.messages : [],
      settings: row.value.settings || {},
      updatedAt: row.updated_at || new Date().toISOString()
    };
  }
  return { users: [SEED_ADMIN], messages: [], settings: {}, updatedAt: new Date().toISOString() };
}

export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  try {
    if (req.method === 'GET') {
      const state = await readState();
      return res.status(200).json({ state });
    }

    if (req.method !== 'POST' || !req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const current = await readState();
    const incoming = req.body as { users?: any[]; messages?: any[]; settings?: any };

    // 1. Merge users intelligently
    const userMap = new Map<string, any>();
    for (const u of current.users) {
      if (u && u.id) {
        userMap.set(u.id, u);
        if (u.email) userMap.set(u.email.toLowerCase(), u);
      }
    }

    if (Array.isArray(incoming.users)) {
      for (const u of incoming.users) {
        if (!u || !u.id) continue;
        const emailKey = (u.email || '').toLowerCase();
        // Ignore fake demo users
        if (u.id.startsWith('user-demo-') || FAKE_DEMO_EMAILS.includes(emailKey)) {
          continue;
        }
        const existing = (emailKey ? userMap.get(emailKey) : null) || userMap.get(u.id);
        if (existing) {
          const merged = { ...existing, ...u };
          userMap.set(u.id, merged);
          if (emailKey) userMap.set(emailKey, merged);
        } else {
          userMap.set(u.id, u);
          if (emailKey) userMap.set(emailKey, u);
        }
      }
    }

    const uniqueUsers: any[] = [];
    const seenIds = new Set<string>();
    for (const u of userMap.values()) {
      if (!seenIds.has(u.id)) {
        seenIds.add(u.id);
        const email = (u.email || '').toLowerCase();
        if (!u.id.startsWith('user-demo-') && !FAKE_DEMO_EMAILS.includes(email)) {
          uniqueUsers.push(u);
        }
      }
    }

    // Always ensure super admin is present and has admin role
    const adminIdx = uniqueUsers.findIndex(u => (u.email || '').toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());
    if (adminIdx === -1) {
      uniqueUsers.unshift(SEED_ADMIN);
    } else {
      uniqueUsers[adminIdx].role = 'admin';
      uniqueUsers[adminIdx].isSuperAdmin = true;
      uniqueUsers[adminIdx].subscriptionTier = 'pro';
    }

    // 2. Merge messages
    const msgMap = new Map<string, any>();
    for (const m of current.messages) {
      if (m && m.id && !m.id.startsWith('msg-seed-')) msgMap.set(m.id, m);
    }

    if (Array.isArray(incoming.messages)) {
      for (const m of incoming.messages) {
        if (m && m.id && !m.id.startsWith('msg-seed-')) {
          const existing = msgMap.get(m.id);
          if (existing) {
            msgMap.set(m.id, { ...existing, ...m });
          } else {
            msgMap.set(m.id, m);
          }
        }
      }
    }

    const uniqueMessages = Array.from(msgMap.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const mergedSettings = { ...current.settings, ...(incoming.settings || {}) };

    const state = {
      users: uniqueUsers,
      messages: uniqueMessages,
      settings: mergedSettings,
      updatedAt: new Date().toISOString()
    };

    const escapedJson = JSON.stringify(state).replace(/'/g, "''");
    await executeNeonSql(
      `INSERT INTO app_state (key, value, updated_at) VALUES ('admitroute_global_state_v1', '${escapedJson}'::jsonb, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();`
    );

    return res.status(200).json({ state });
  } catch (error) {
    console.error('API state error:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Database error' });
  }
}
