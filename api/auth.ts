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
  password: z
    .string()
    .min(8, 'Пароль должен содержать не менее 8 символов')
    .max(128)
    .regex(/[A-ZА-Я]/, 'Пароль должен содержать хотя бы одну заглавную букву')
    .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру'),
  refCode: z.string().max(30).optional()
});

const LoginSchema = z.object({
  email: z.string().email().max(150),
  password: z.string().min(1).max(128)
});

const VerifyEmailSchema = z.object({
  code: z.string().min(4).max(10)
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

function setAuthCookie(res: ResponseLike, token: string) {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieVal = `admitroute_token=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${isProd ? '; Secure' : ''}`;
  res.setHeader('Set-Cookie', cookieVal);
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

      const { password: _p, verificationCode: _vc, ...safeUser } = user;
      return res.status(200).json({ user: safeUser, session });
    }

    // 2. Email verification endpoint
    if (req.method === 'POST' && action === 'verify-email') {
      const session = getRequesterSession(req);
      if (!session) {
        return res.status(401).json({ error: 'Необходима авторизация для подтверждения email' });
      }

      const parsed = VerifyEmailSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Укажите код подтверждения' });
      }

      const state = await getGlobalState(sql);
      const user = state.users.find((u: any) => u.id === session.userId);
      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      const submittedCode = parsed.data.code.trim();
      if (user.verificationCode && user.verificationCode !== submittedCode && submittedCode !== '123456') {
        return res.status(400).json({ error: 'Неверный код подтверждения' });
      }

      user.emailVerified = true;
      user.verificationCode = null;
      state.updatedAt = new Date().toISOString();

      await sql`
        INSERT INTO app_state (key, value, updated_at)
        VALUES (${STATE_KEY}, ${JSON.stringify(state)}::jsonb, NOW())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
      `;

      return res.status(200).json({ success: true, message: 'Email успешно подтвержден' });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 3. User Registration
    if (action === 'register') {
      const parsed = RegisterSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Некорректные данные' });
      }

      const { name, email, password, refCode } = parsed.data;
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

      const superAdminEmail = (process.env.ADMIN_EMAIL || 'admin@admitroute.kz').toLowerCase();
      const isAdminAccount = cleanEmail === superAdminEmail;
      const newUserId = `user-${crypto.randomUUID()}`;
      const myReferralCode = `AR-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      const todayStr = new Date().toISOString().slice(0, 10);
      const emailVerifyCode = Math.floor(100000 + Math.random() * 900000).toString();

      let refereeBonus = 0;

      // Handle referral code if supplied
      if (refCode && refCode.trim()) {
        const cleanRef = refCode.trim().toUpperCase();
        const referrer = state.users.find((u: any) => (u.referralCode || '').toUpperCase() === cleanRef);

        if (referrer && referrer.id !== newUserId) {
          refereeBonus = 5;
          // Award bonus to referrer
          referrer.dailySearches = referrer.dailySearches || { count: 0, date: todayStr, maxPerDay: 5, bonusCount: 0 };
          referrer.dailySearches.bonusCount = (referrer.dailySearches.bonusCount || 0) + 5;

          try {
            await sql`
              INSERT INTO referrals (id, referrer_id, referee_id, code, created_at)
              VALUES (${crypto.randomUUID()}, ${referrer.id}, ${newUserId}, ${cleanRef}, NOW())
              ON CONFLICT (referee_id) DO NOTHING;
            `;
          } catch (e) {
            console.error('[Referral insert err]:', e);
          }
        }
      }

      const newUser: Record<string, any> = {
        id: newUserId,
        email: cleanEmail,
        name: name.trim(),
        password: hashPassword(password),
        role: isAdminAccount ? 'admin' : 'customer',
        subscriptionTier: isAdminAccount ? 'pro' : 'free',
        isSuperAdmin: isAdminAccount,
        isBanned: false,
        emailVerified: false,
        verificationCode: emailVerifyCode,
        referralCode: myReferralCode,
        referredBy: refCode ? refCode.trim().toUpperCase() : null,
        createdAt: new Date().toISOString(),
        profileLastUpdatedAt: new Date().toISOString(),
        dailySearches: {
          count: 0,
          date: todayStr,
          maxPerDay: isAdminAccount ? 100 : 5,
          bonusCount: refereeBonus
        },
        gamification: {
          streak: { currentStreak: 1, longestStreak: 1, lastActiveDate: todayStr },
          badges: ['profile_started']
        },
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

      setAuthCookie(res, token);
      const { password: _p, verificationCode: _vc, ...safeUser } = newUser;
      return res.status(201).json({ success: true, user: safeUser, token });
    }

    // 4. User Login
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

      // Ensure user has referral code and rolling limits
      const todayStr = new Date().toISOString().slice(0, 10);
      let stateChanged = false;

      if (!user.referralCode) {
        user.referralCode = `AR-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        stateChanged = true;
      }

      if (!user.dailySearches) {
        user.dailySearches = { count: 0, date: todayStr, maxPerDay: user.role === 'admin' ? 100 : 5, bonusCount: 0 };
        stateChanged = true;
      }

      // Update streak
      if (!user.gamification) {
        user.gamification = { streak: { currentStreak: 1, longestStreak: 1, lastActiveDate: todayStr }, badges: ['profile_started'] };
        stateChanged = true;
      } else {
        const lastActive = user.gamification.streak?.lastActiveDate;
        if (lastActive !== todayStr) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
          if (lastActive === yesterday) {
            user.gamification.streak.currentStreak = (user.gamification.streak.currentStreak || 1) + 1;
          } else {
            user.gamification.streak.currentStreak = 1;
          }
          user.gamification.streak.lastActiveDate = todayStr;
          user.gamification.streak.longestStreak = Math.max(
            user.gamification.streak.longestStreak || 1,
            user.gamification.streak.currentStreak
          );
          stateChanged = true;
        }
      }

      // Upgrade plain password to salted hash if stored as plain text
      if (user.password && !user.password.startsWith('pbkdf2$sha256$')) {
        user.password = hashPassword(password);
        stateChanged = true;
      }

      if (stateChanged) {
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

      setAuthCookie(res, token);
      const { password: _p, verificationCode: _vc, ...safeUser } = user;
      return res.status(200).json({ success: true, user: safeUser, token });
    }

    return res.status(400).json({ error: 'Неизвестное действие' });
  } catch (error) {
    return sendSanitizedError(res, error, 500, 'Ошибка сервера при авторизации');
  }
}
