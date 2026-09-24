import { z } from 'zod';
import {
  type RequestLike,
  type ResponseLike,
  applyCors,
  checkRateLimit,
  getClientIp,
  getDb,
  getRequesterSession,
  sendSanitizedError,
  hashPassword
} from './_security';

const STATE_KEY = 'admitroute_global_state_v1';

const UpdateStateSchema = z.object({
  users: z.array(z.record(z.string(), z.any())).optional(),
  messages: z.array(z.record(z.string(), z.any())).optional(),
  settings: z.record(z.string(), z.any()).optional(),
  deletedUserIds: z.array(z.string()).optional()
});

const ALLOWED_USER_FIELDS = new Set([
  'name',
  'profile',
  'usageStats',
  'notes',
  'emailVerified',
  'telegramSettings',
  'selectedPrograms',
  'roadmap',
  'gamification',
  'profileLastUpdatedAt',
  'postSubmissionChecklist'
]);

const ALLOWED_MESSAGE_FIELDS = new Set([
  'id',
  'threadId',
  'userEmail',
  'userName',
  'senderRole',
  'text',
  'createdAt',
  'isReadByAdmin',
  'isReadByUser',
  'isPaymentRequest',
  'isProActivated'
]);

function getSuperAdminTemplate() {
  const email = process.env.ADMIN_EMAIL || 'admin@admitroute.kz';
  const initialPass = process.env.ADMIN_INITIAL_PASSWORD || 'ChangeMeImmediately123!';
  return {
    id: 'user-admin-01',
    email,
    name: 'Главный Администратор AdmitRoute',
    password: hashPassword(initialPass),
    role: 'admin',
    subscriptionTier: 'pro',
    isSuperAdmin: true,
    isBanned: false,
    createdAt: '2026-09-01T10:00:00Z',
    usageStats: { searchesCount: 42, recalculationsCount: 18 },
    notes: 'Главный Администратор платформы AdmitRoute'
  };
}

async function readGlobalState(sql: any) {
  const rows = await sql`SELECT value, updated_at FROM app_state WHERE key = ${STATE_KEY};`;
  const row = rows[0];
  if (row && row.value && typeof row.value === 'object') {
    return {
      users: Array.isArray(row.value.users) ? row.value.users : [getSuperAdminTemplate()],
      messages: Array.isArray(row.value.messages) ? row.value.messages : [],
      settings: row.value.settings || {},
      updatedAt: row.updated_at || new Date().toISOString()
    };
  }
  return {
    users: [getSuperAdminTemplate()],
    messages: [],
    settings: {},
    updatedAt: new Date().toISOString()
  };
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (applyCors(req, res)) return;

  const clientIp = getClientIp(req);
  if (!checkRateLimit(clientIp, 60, 60000)) {
    return res.status(429).json({ error: 'Слишком много запросов. Подождите 1 минуту.' });
  }

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const sql = getDb();
    const session = getRequesterSession(req);
    const isAdmin = session?.role === 'admin' || !!session?.isSuperAdmin;

    // GET: Retrieve state
    if (req.method === 'GET') {
      const state = await readGlobalState(sql);

      // Strip sensitive password hashes from public user roster
      const sanitizedUsers = state.users.map((u: any) => {
        const { password: _p, ...safeUser } = u;
        return safeUser;
      });

      return res.status(200).json({
        state: {
          ...state,
          users: sanitizedUsers
        }
      });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const parsed = UpdateStateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Некорректная структура запроса синхронизации' });
    }

    const incoming = parsed.data;
    const current = await readGlobalState(sql);

    // 1. Process deleted users
    const deletedSet = new Set(incoming.deletedUserIds || []);

    // 2. Intelligent & Secure User Merging
    const userMap = new Map<string, any>();
    for (const u of current.users) {
      if (u && u.id && !deletedSet.has(u.id)) {
        userMap.set(u.id, u);
        if (u.email) userMap.set(u.email.toLowerCase(), u);
      }
    }

    if (Array.isArray(incoming.users)) {
      for (const rawUser of incoming.users) {
        if (!rawUser || !rawUser.id || deletedSet.has(rawUser.id)) continue;
        const emailKey = (rawUser.email || '').toLowerCase();
        const existing = (emailKey ? userMap.get(emailKey) : null) || userMap.get(rawUser.id);

        if (existing) {
          // If requester is not admin, only merge whitelisted fields! Prevent privilege escalation!
          if (!isAdmin) {
            const safeUpdate: Record<string, any> = {};
            for (const key of Object.keys(rawUser)) {
              if (ALLOWED_USER_FIELDS.has(key)) {
                safeUpdate[key] = rawUser[key];
              }
            }
            const merged = { ...existing, ...safeUpdate };
            userMap.set(existing.id, merged);
            if (existing.email) userMap.set(existing.email.toLowerCase(), merged);
          } else {
            // Admin can update roles, bans, tiers, etc.
            const merged = { ...existing, ...rawUser };
            userMap.set(existing.id, merged);
            if (existing.email) userMap.set(existing.email.toLowerCase(), merged);
          }
        } else {
          // New user creation via sync
          const safeNewUser: Record<string, any> = {
            id: rawUser.id,
            email: rawUser.email,
            name: rawUser.name || 'Пользователь',
            role: isAdmin ? (rawUser.role || 'customer') : 'customer', // Non-admin cannot register themselves as admin!
            subscriptionTier: isAdmin ? (rawUser.subscriptionTier || 'free') : 'free',
            isSuperAdmin: false,
            isBanned: false,
            createdAt: rawUser.createdAt || new Date().toISOString(),
            usageStats: rawUser.usageStats || { searchesCount: 0, recalculationsCount: 0 },
            profile: rawUser.profile || undefined
          };
          userMap.set(rawUser.id, safeNewUser);
          if (emailKey) userMap.set(emailKey, safeNewUser);
        }
      }
    }

    const uniqueUsers: any[] = [];
    const seenIds = new Set<string>();
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@admitroute.kz').toLowerCase();

    for (const u of userMap.values()) {
      if (!seenIds.has(u.id) && !deletedSet.has(u.id)) {
        seenIds.add(u.id);
        uniqueUsers.push(u);
      }
    }

    // Always guarantee Super-Admin presence
    const adminIdx = uniqueUsers.findIndex(u => (u.email || '').toLowerCase() === adminEmail);
    if (adminIdx === -1) {
      uniqueUsers.unshift(getSuperAdminTemplate());
    } else {
      uniqueUsers[adminIdx].role = 'admin';
      uniqueUsers[adminIdx].isSuperAdmin = true;
      uniqueUsers[adminIdx].subscriptionTier = 'pro';
    }

    // 3. Message Merging & Sanitization
    const msgMap = new Map<string, any>();
    for (const m of current.messages) {
      if (m && m.id) msgMap.set(m.id, m);
    }

    if (Array.isArray(incoming.messages)) {
      for (const m of incoming.messages) {
        if (!m || !m.id || !m.text || typeof m.text !== 'string') continue;

        // Prevent spoofing senderRole as 'admin' if not authenticated as admin
        const senderRole = (!isAdmin && m.senderRole === 'admin') ? 'user' : (m.senderRole || 'user');

        const cleanMsg: Record<string, any> = {};
        for (const k of Object.keys(m)) {
          if (ALLOWED_MESSAGE_FIELDS.has(k)) {
            cleanMsg[k] = m[k];
          }
        }
        cleanMsg.senderRole = senderRole;

        const existing = msgMap.get(m.id);
        if (existing) {
          msgMap.set(m.id, { ...existing, ...cleanMsg });
        } else {
          msgMap.set(m.id, cleanMsg);
        }
      }
    }

    const uniqueMessages = Array.from(msgMap.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // 4. Settings merging (only admin can change site settings)
    const mergedSettings = isAdmin
      ? { ...current.settings, ...(incoming.settings || {}) }
      : current.settings;

    const nextState = {
      users: uniqueUsers,
      messages: uniqueMessages,
      settings: mergedSettings,
      updatedAt: new Date().toISOString()
    };

    // 5. Parameterized SQL execution via @neondatabase/serverless (No String Concatenation!)
    await sql`
      INSERT INTO app_state (key, value, updated_at)
      VALUES (${STATE_KEY}, ${JSON.stringify(nextState)}::jsonb, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
    `;

    // Strip password hashes from response
    const sanitizedOutputUsers = uniqueUsers.map(({ password: _p, ...u }) => u);

    return res.status(200).json({
      state: {
        ...nextState,
        users: sanitizedOutputUsers
      }
    });
  } catch (error) {
    return sendSanitizedError(res, error, 500, 'Ошибка синхронизации базы данных');
  }
}
