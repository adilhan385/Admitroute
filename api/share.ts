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
} from './_security';

const STATE_KEY = 'admitroute_global_state_v1';

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (applyCors(req, res)) return;

  const clientIp = getClientIp(req);
  if (!checkRateLimit(clientIp, 60, 60000)) {
    return res.status(429).json({ error: 'Слишком много запросов. Подождите 1 минуту.' });
  }

  const url = new URL(req.headers?.['x-forwarded-url'] as string || 'http://localhost/api/share');
  const action = (req as any).query?.action || url.searchParams.get('action');
  const token = (req as any).query?.token || url.searchParams.get('token');

  const sql = getDb();

  try {
    // 1. PUBLIC READ-ONLY ACCESS: GET /api/share?token=...
    if (req.method === 'GET' && token) {
      const tokenRows = await sql`
        SELECT token, user_id, is_active, created_at, revoked_at
        FROM share_tokens
        WHERE token = ${token} AND is_active = true
        LIMIT 1;
      `;

      if (tokenRows.length === 0) {
        return res.status(404).json({ error: 'Ссылка для доступа недействительна или была отозвана владельцем.' });
      }

      const targetUserId = tokenRows[0].user_id;

      // Fetch user profile from state
      const stateRows = await sql`SELECT value FROM app_state WHERE key = ${STATE_KEY};`;
      const state = stateRows[0]?.value || { users: [] };
      const user = (state.users || []).find((u: any) => u.id === targetUserId);

      if (!user) {
        return res.status(404).json({ error: 'Данные пользователя не найдены' });
      }

      // Fetch applications tracker for this user
      const appRows = await sql`
        SELECT program_id, program_name, stages, status, updated_at
        FROM application_trackers
        WHERE user_id = ${targetUserId};
      `;

      // Read-only sanitize: strictly exclude chat, private notes, passwords, payment info
      const publicData = {
        studentName: user.name || 'Абитуриент',
        targetYear: user.profile?.targetYear || '2026',
        targetField: user.profile?.field || '',
        overallReadinessScore: user.profile?.diagnosis?.overallReadinessScore || 0,
        selectedPrograms: (user.selectedPrograms || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          shortName: p.shortName,
          country: p.country,
          matchCategory: p.matchCategory,
          admissionChancePercentage: p.admissionChancePercentage
        })),
        roadmap: (user.roadmap || []).map((s: any) => ({
          id: s.id,
          title: s.title,
          deadlineDate: s.deadlineDate,
          completed: s.completed,
          category: s.category
        })),
        applications: appRows.map(r => ({
          programId: r.program_id,
          programName: r.program_name,
          stages: r.stages,
          status: r.status,
          updatedAt: r.updated_at
        })),
        sharedAt: tokenRows[0].created_at
      };

      return res.status(200).json({ success: true, readOnly: true, data: publicData });
    }

    // AUTHENTICATED ACTIONS: create, revoke, status
    const session = getRequesterSession(req);
    if (!session) {
      return res.status(401).json({ error: 'Необходима авторизация' });
    }
    const userId = session.userId;

    // 2. GET /api/share?action=status: get active token
    if (req.method === 'GET' && action === 'status') {
      const activeRows = await sql`
        SELECT token, created_at FROM share_tokens
        WHERE user_id = ${userId} AND is_active = true
        ORDER BY created_at DESC LIMIT 1;
      `;

      if (activeRows.length === 0) {
        return res.status(200).json({ hasActiveLink: false });
      }

      return res.status(200).json({
        hasActiveLink: true,
        token: activeRows[0].token,
        shareUrl: `https://admitroute.kz/?share=${activeRows[0].token}`,
        createdAt: activeRows[0].created_at
      });
    }

    // 3. POST /api/share?action=create: generate new token
    if (req.method === 'POST' && action === 'create') {
      // Revoke any previous active tokens for this user
      await sql`
        UPDATE share_tokens
        SET is_active = false, revoked_at = NOW()
        WHERE user_id = ${userId} AND is_active = true;
      `;

      const newToken = crypto.randomBytes(24).toString('hex');
      await sql`
        INSERT INTO share_tokens (token, user_id, is_active, created_at)
        VALUES (${newToken}, ${userId}, true, NOW());
      `;

      return res.status(201).json({
        success: true,
        token: newToken,
        shareUrl: `https://admitroute.kz/?share=${newToken}`
      });
    }

    // 4. POST /api/share?action=revoke: revoke active token
    if (req.method === 'POST' && action === 'revoke') {
      await sql`
        UPDATE share_tokens
        SET is_active = false, revoked_at = NOW()
        WHERE user_id = ${userId} AND is_active = true;
      `;

      return res.status(200).json({ success: true, message: 'Доступ по ссылке успешно отозван' });
    }

    return res.status(400).json({ error: 'Неверный запрос' });
  } catch (error) {
    return sendSanitizedError(res, error, 500, 'Ошибка сервиса совместного доступа');
  }
}
