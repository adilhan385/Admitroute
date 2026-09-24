import {
  type RequestLike,
  type ResponseLike,
  applyCors,
  getDb,
  sendSanitizedError,
  sendTelegramMessage,
  canSendNotification,
  logNotificationSent
} from '../_security';

const STATE_KEY = 'admitroute_global_state_v1';

function getDaysDifference(targetDateStr: string): number | null {
  if (!targetDateStr) return null;
  const target = new Date(targetDateStr);
  if (isNaN(target.getTime())) return null;

  const now = new Date();
  // Strip time components to compare calendar days
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const targetUtc = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());

  const diffMs = targetUtc - todayUtc;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (applyCors(req, res)) return;

  // Verify CRON authorization: Vercel Cron header or Bearer token
  const authHeader = req.headers?.['authorization'] || req.headers?.['Authorization'];
  const cronHeader = req.headers?.['x-vercel-cron'];
  const expectedSecret = process.env.CRON_SECRET || 'admitroute_cron_secret_key_2026';

  const isAuthorized =
    cronHeader === '1' ||
    (typeof authHeader === 'string' && authHeader === `Bearer ${expectedSecret}`);

  if (!isAuthorized && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: 'Несанкционированный запуск Cron-задачи' });
  }

  try {
    const sql = getDb();
    const rows = await sql`SELECT value FROM app_state WHERE key = ${STATE_KEY};`;
    const state = rows[0]?.value || { users: [] };
    const users: any[] = Array.isArray(state.users) ? state.users : [];

    const now = new Date();
    const isMonday = now.getUTCDay() === 1;
    const url = new URL(req.headers?.['x-forwarded-url'] as string || 'http://localhost/api/cron/deadlines');
    const forceDigest = url.searchParams.get('digest') === 'true';

    let sentCount = 0;
    const logs: string[] = [];

    for (const user of users) {
      if (!user.telegramChatId || user.isBanned) continue;

      const tgSettings = user.telegramSettings || {
        notifyDeadlines: true,
        notifyDigest: true,
        notifyStaleProfile: true,
        notifyAchievements: true
      };

      // 1. Check Roadmap Deadlines (14, 7, 3, 1 days)
      if (tgSettings.notifyDeadlines !== false && Array.isArray(user.roadmap)) {
        for (const step of user.roadmap) {
          if (step.completed) continue;
          const daysLeft = getDaysDifference(step.deadlineDate);
          if (daysLeft === null) continue;

          if ([14, 7, 3, 1].includes(daysLeft)) {
            const notifKey = `deadline_${step.id || step.title}_${daysLeft}d`;
            const allowed = await canSendNotification(sql, user.id, notifKey);
            if (allowed) {
              const urgencyEmoji = daysLeft <= 3 ? '🚨' : daysLeft <= 7 ? '⚠️' : '📅';
              const daysWord = daysLeft === 1 ? '1 день' : daysLeft < 5 ? `${daysLeft} дня` : `${daysLeft} дней`;
              const msg =
                `${urgencyEmoji} <b>Напоминание о дедлайне AdmitRoute</b>\n\n` +
                `📌 <b>${step.title}</b>\n` +
                `⏳ До срока осталось: <b>${daysWord}</b> (${step.deadlineDate})\n` +
                `📝 <i>${step.description || 'Не забудьте подготовить необходимые документы'}</i>\n\n` +
                `👉 <a href="https://admitroute.kz">Перейти к чек-листу в AdmitRoute</a>`;

              const sent = await sendTelegramMessage(user.telegramChatId, msg);
              if (sent) {
                await logNotificationSent(sql, user.id, notifKey, 'telegram');
                sentCount++;
                logs.push(`Sent ${notifKey} to user ${user.id}`);
              }
            }
          }
        }
      }

      // 2. Weekly Deadline Digest (Mondays or forceDigest)
      if ((isMonday || forceDigest) && tgSettings.notifyDigest !== false && Array.isArray(user.roadmap)) {
        const upcomingSteps = user.roadmap.filter((s: any) => {
          if (s.completed) return false;
          const days = getDaysDifference(s.deadlineDate);
          return days !== null && days >= 0 && days <= 14;
        });

        if (upcomingSteps.length > 0) {
          const currentWeekStr = `${now.getFullYear()}-W${Math.ceil(now.getDate() / 7)}`;
          const digestKey = `weekly_digest_${currentWeekStr}`;
          const allowed = await canSendNotification(sql, user.id, digestKey);

          if (allowed) {
            let digestMsg = `📊 <b>Еженедельный дайджест дедлайнов</b>\n` +
              `Привет, ${user.name || 'Абитуриент'}! Вот ключевые задачи на ближайшие 2 недели:\n\n`;

            upcomingSteps.forEach((s: any, idx: number) => {
              const d = getDaysDifference(s.deadlineDate);
              digestMsg += `${idx + 1}. <b>${s.title}</b> — дедлайн: ${s.deadlineDate} (через ${d} дн.)\n`;
            });

            digestMsg += `\n🎯 Держите темп и отмечайте готовые пункты на сайте!`;

            const sent = await sendTelegramMessage(user.telegramChatId, digestMsg);
            if (sent) {
              await logNotificationSent(sql, user.id, digestKey, 'telegram');
              sentCount++;
              logs.push(`Sent weekly digest to user ${user.id}`);
            }
          }
        }
      }

      // 3. Stale Profile Warning (Data not updated in 60+ days)
      if (tgSettings.notifyStaleProfile !== false) {
        const lastUpdated = user.profileLastUpdatedAt ? new Date(user.profileLastUpdatedAt) : new Date(user.createdAt || Date.now());
        const daysSinceUpdate = Math.round((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));

        const hasSelectedPrograms = Array.isArray(user.selectedPrograms) && user.selectedPrograms.length > 0;
        if (daysSinceUpdate >= 60 && hasSelectedPrograms) {
          const staleKey = 'stale_profile_60d';
          const allowed = await canSendNotification(sql, user.id, staleKey);

          if (allowed) {
            const staleMsg =
              `⚠️ <b>Ваш профиль в AdmitRoute не обновлялся более 60 дней</b>\n\n` +
              `Вузы часто корректируют проходные баллы и квоты грантов. Обновите текущие баллы GPA, IELTS или ЕНТ, чтобы шансы поступления и рекомендации оставались точными!\n\n` +
              `👉 <a href="https://admitroute.kz">Обновить профиль</a>`;

            const sent = await sendTelegramMessage(user.telegramChatId, staleMsg);
            if (sent) {
              await logNotificationSent(sql, user.id, staleKey, 'telegram');
              sentCount++;
              logs.push(`Sent stale profile warning to user ${user.id}`);
            }
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      processedUsers: users.length,
      sentNotifications: sentCount,
      timestamp: now.toISOString(),
      logs
    });
  } catch (error) {
    return sendSanitizedError(res, error, 500, 'Ошибка при обработке cron-задачи дедлайнов');
  }
}
