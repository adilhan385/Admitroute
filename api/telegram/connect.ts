import crypto from 'node:crypto';
import {
  type RequestLike,
  type ResponseLike,
  applyCors,
  checkRateLimit,
  getClientIp,
  getDb,
  getRequesterSession,
  sendSanitizedError
} from '../_security';

const STATE_KEY = 'admitroute_global_state_v1';

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (applyCors(req, res)) return;

  const clientIp = getClientIp(req);
  if (!checkRateLimit(clientIp, 30, 60000)) {
    return res.status(429).json({ error: 'Слишком много запросов. Подождите 1 минуту.' });
  }

  const session = getRequesterSession(req);
  const clientUserId = (req.headers?.['x-user-id'] as string) || '';
  const userId = session?.userId || clientUserId;

  if (!userId) {
    return res.status(401).json({ error: 'Необходима авторизация' });
  }

  const sql = getDb();
  const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'admitroute_kz_bot';

  try {
    const stateRows = await sql`SELECT value FROM app_state WHERE key = ${STATE_KEY};`;
    const state = stateRows[0]?.value || { users: [] };
    let user = (state.users || []).find((u: any) => u.id === userId);

    if (!user) {
      user = {
        id: userId,
        telegramSettings: {
          notifyDeadlines: true,
          notifyDigest: true,
          notifyStaleProfile: true,
          notifyAchievements: true
        }
      };
      state.users = Array.isArray(state.users) ? [...state.users, user] : [user];
    }

    // 1. GET: Status of Telegram connection
    if (req.method === 'GET') {
      return res.status(200).json({
        isConnected: !!user.telegramChatId,
        telegramChatId: user.telegramChatId ? '••••' + String(user.telegramChatId).slice(-4) : null,
        botUsername,
        settings: user.telegramSettings || {
          notifyDeadlines: true,
          notifyDigest: true,
          notifyStaleProfile: true,
          notifyAchievements: true
        }
      });
    }

    // 2. POST action=disconnect: unlink Telegram
    const url = new URL(req.headers?.['x-forwarded-url'] as string || 'http://localhost/api/telegram/connect');
    const action = (req as any).query?.action || url.searchParams.get('action');

    if (req.method === 'POST' && action === 'disconnect') {
      user.telegramChatId = null;
      state.updatedAt = new Date().toISOString();

      await sql`
        INSERT INTO app_state (key, value, updated_at)
        VALUES (${STATE_KEY}, ${JSON.stringify(state)}::jsonb, NOW())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
      `;

      return res.status(200).json({ success: true, message: 'Telegram успешно отключен' });
    }

    // 3. POST action=update_settings: update notification toggles
    if (req.method === 'POST' && action === 'update_settings') {
      const { notifyDeadlines, notifyDigest, notifyStaleProfile, notifyAchievements } = (req.body || {}) as any;

      user.telegramSettings = {
        notifyDeadlines: notifyDeadlines !== false,
        notifyDigest: notifyDigest !== false,
        notifyStaleProfile: notifyStaleProfile !== false,
        notifyAchievements: notifyAchievements !== false
      };

      state.updatedAt = new Date().toISOString();
      await sql`
        INSERT INTO app_state (key, value, updated_at)
        VALUES (${STATE_KEY}, ${JSON.stringify(state)}::jsonb, NOW())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
      `;

      return res.status(200).json({ success: true, settings: user.telegramSettings });
    }

    // 4. POST default: Generate one-time 10-minute linking code
    if (req.method === 'POST') {
      // Invalidate existing unused codes for this user
      await sql`
        UPDATE telegram_links
        SET used_at = NOW()
        WHERE user_id = ${userId} AND used_at IS NULL;
      `;

      // Generate clean 8-character uppercase alphanumeric code
      const code = `AR${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      await sql`
        INSERT INTO telegram_links (code, user_id, expires_at, created_at)
        VALUES (${code}, ${userId}, ${expiresAt}::timestamptz, NOW());
      `;

      user.telegramLinkCode = code;
      user.telegramLinkExpiresAt = expiresAt;
      state.updatedAt = new Date().toISOString();
      await sql`
        INSERT INTO app_state (key, value, updated_at)
        VALUES (${STATE_KEY}, ${JSON.stringify(state)}::jsonb, NOW())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
      `;

      const deepLink = `https://t.me/${botUsername}?start=${code}`;

      return res.status(200).json({
        success: true,
        code,
        expiresAt,
        deepLink,
        botUsername
      });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    return sendSanitizedError(res, error, 500, 'Ошибка при подключении Telegram');
  }
}
