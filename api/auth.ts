import crypto from 'node:crypto';
import { z } from 'zod';
import {
  type RequestLike,
  type ResponseLike,
  applyCors,
  checkRateLimit,
  getClientIp,
  hashPassword,
  verifyPassword,
  signSessionToken,
  getRequesterSession,
  getDb,
  checkPasswordBreach,
  sendSanitizedError
} from './_security';

const RegisterSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа').max(100),
  email: z.string().email('Некорректный адрес электронной почты').max(150),
  password: z.string().min(6, 'Пароль должен содержать не менее 6 символов').max(128)
});

const LoginSchema = z.object({
  email: z.string().email().max(150),
  password: z.string().min(1).max(128)
});

const STATE_KEY = 'admitroute_global_state_v1';

async function getGlobalState(sql: any) {
  const rows = await sql`SELECT value FROM app_state WHERE key = ${STATE_KEY};`;
  const row = rows[0];
  if (row && row.value && typeof row.value === 'object') {
    return {
      users: Array.isArray(row.value.users) ? row.value.users : [],
      messages: Array.isArray(row.value.messages) ? row.value.messages : [],
      settings: row.value.settings || {},
      updatedAt: new Date().toISOString()
    };
  }
  return { users: [], messages: [], settings: {}, updatedAt: new Date().toISOString() };
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (applyCors(req, res)) return;

  const clientIp = getClientIp(req);
  if (!checkRateLimit(clientIp, 30, 60000)) {
    return res.status(429).json({ error: 'Слишком много запросов. Подождите 1 минуту.' });
  }

  const url = new URL(req.headers?.['x-forwarded-url'] as string || 'http://localhost/api/auth');
  const action = (req as any).query?.action || url.searchParams.get('action');

  try {
    const sql = getDb();

    // 1. Session verification endpoint
    if (req.method === 'GET' && action === 'me') {
      const session = getRequesterSession(req);
      if (!session) {
        return res.status(401).json({ error: 'Не авторизован' });
      }

      const state = await getGlobalState(sql);
      const user = state.users.find((u: any) => u.id === session.userId || u.email.toLowerCase() === session.email.toLowerCase());
      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      // Never send password hash to client
      const { password: _p, ...safeUser } = user;
      return res.status(200).json({ user: safeUser, session });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. User Registration
    if (action === 'register') {
      const parsed = RegisterSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Некорректные данные' });
      }

      const { name, email, password } = parsed.data;
      const cleanEmail = email.trim().toLowerCase();

      // Check for password in breach database (HIBP)
      const isBreached = await checkPasswordBreach(password);
      if (isBreached) {
        return res.status(400).json({
          error: 'Этот пароль скомпрометирован и найден в базах утечек паролей. Пожалуйста, используйте более надёжный уникальный пароль.'
        });
      }

      const state = await getGlobalState(sql);
      if (state.users.some((u: any) => (u.email || '').toLowerCase() === cleanEmail)) {
        return res.status(409).json({ error: 'Пользователь с таким email уже зарегистрирован' });
      }

      const superAdminEmail = (process.env.ADMIN_EMAIL || 'adilhananuar426@gmail.com').toLowerCase();
      const isAdminAccount = cleanEmail === superAdminEmail;

      const newUser = {
        id: `user-${crypto.randomUUID()}`,
        email: cleanEmail,
        name: name.trim(),
        password: hashPassword(password),
        role: isAdminAccount ? 'admin' : 'customer',
        subscriptionTier: isAdminAccount ? 'pro' : 'free',
        isSuperAdmin: isAdminAccount,
        isBanned: false,
        emailVerified: false,
        createdAt: new Date().toISOString(),
        usageStats: { searchesCount: 0, recalculationsCount: 0 }
      };

      state.users.push(newUser);
      state.updatedAt = new Date().toISOString();

      await sql`
        INSERT INTO app_state (key, value, updated_at)
        VALUES (${STATE_KEY}, ${JSON.stringify(state)}::jsonb, NOW())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
      `;

      const token = signSessionToken({
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role as any,
        isSuperAdmin: newUser.isSuperAdmin
      });

      const { password: _p, ...safeUser } = newUser;
      return res.status(201).json({ success: true, user: safeUser, token });
    }

    // 3. User Login
    if (action === 'login') {
      const parsed = LoginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Заполните email и пароль' });
      }

      const { email, password } = parsed.data;
      const cleanEmail = email.trim().toLowerCase();

      const state = await getGlobalState(sql);
      const user = state.users.find((u: any) => (u.email || '').toLowerCase() === cleanEmail);

      if (!user) {
        return res.status(401).json({ error: 'Неверный email или пароль' });
      }

      if (user.isBanned) {
        return res.status(403).json({ error: 'Ваш аккаунт заблокирован администратором' });
      }

      // Verify password
      const isMatch = verifyPassword(password, user.password || '');
      if (!isMatch) {
        return res.status(401).json({ error: 'Неверный email или пароль' });
      }

      // Upgrade plain password to salted hash if stored as plain text
      if (user.password && !user.password.startsWith('pbkdf2$sha256$')) {
        user.password = hashPassword(password);
        await sql`
          INSERT INTO app_state (key, value, updated_at)
          VALUES (${STATE_KEY}, ${JSON.stringify(state)}::jsonb, NOW())
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
        `;
      }

      const token = signSessionToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        isSuperAdmin: !!user.isSuperAdmin
      });

      const { password: _p, ...safeUser } = user;
      return res.status(200).json({ success: true, user: safeUser, token });
    }

    return res.status(400).json({ error: 'Неизвестное действие' });
  } catch (error) {
    return sendSanitizedError(res, error, 500, 'Ошибка сервера при авторизации');
  }
}
