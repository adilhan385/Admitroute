import {
  type RequestLike,
  type ResponseLike,
  getDb,
  sendTelegramMessage,
  sendSanitizedError
} from '../_security';

const STATE_KEY = 'admitroute_global_state_v1';

export default async function handler(req: RequestLike, res: ResponseLike) {
  // 1. Verify Telegram Secret Token header
  const secretHeader = req.headers?.['x-telegram-bot-api-secret-token'];
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (expectedSecret && secretHeader !== expectedSecret) {
    console.warn('[Telegram Webhook] Unauthorized attempt with invalid secret token');
    return res.status(403).json({ error: 'Неверный секретный токен вебхука' });
  }

  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, message: 'Telegram Webhook Endpoint' });
  }

  const update = req.body as any;
  if (!update || typeof update !== 'object') {
    return res.status(200).json({ ok: true });
  }

  const message = update.message;
  if (!message || !message.chat || !message.text) {
    return res.status(200).json({ ok: true }); // Acknowledge non-text updates
  }

  const chatId = String(message.chat.id);
  const text = (message.text || '').trim();
  const sql = getDb();

  try {
    const stateRows = await sql`SELECT value FROM app_state WHERE key = ${STATE_KEY};`;
    const state = stateRows[0]?.value || { users: [] };
    const users: any[] = Array.isArray(state.users) ? state.users : [];

    // Case A: /start or /start <LINK_CODE>
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      const linkCode = parts[1]?.trim().toUpperCase();

      if (linkCode) {
        // Find matching code in telegram_links table
        const linkRows = await sql`
          SELECT code, user_id, expires_at, used_at
          FROM telegram_links
          WHERE code = ${linkCode} AND used_at IS NULL AND expires_at > NOW()
          LIMIT 1;
        `;

        if (linkRows.length > 0) {
          const matchedUserId = linkRows[0].user_id;

          // Mark code as used
          await sql`
            UPDATE telegram_links
            SET used_at = NOW(), telegram_chat_id = ${chatId}
            WHERE code = ${linkCode};
          `;

          // Update user in global state
          const targetUser = users.find(u => u.id === matchedUserId);
          if (targetUser) {
            targetUser.telegramChatId = chatId;
            targetUser.telegramSettings = targetUser.telegramSettings || {
              notifyDeadlines: true,
              notifyDigest: true,
              notifyStaleProfile: true,
              notifyAchievements: true
            };

            state.updatedAt = new Date().toISOString();
            await sql`
              INSERT INTO app_state (key, value, updated_at)
              VALUES (${STATE_KEY}, ${JSON.stringify(state)}::jsonb, NOW())
              ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
            `;
          }

          const welcomeMsg =
            `🎉 <b>Поздравляем! Аккаунт AdmitRoute успешно привязан!</b>\n\n` +
            `Теперь бот будет надёжно напоминать вам о самых важных этапах поступления:\n` +
            `• ⏰ <b>Дедлайны:</b> за 14, 7, 3 и 1 день до сдачи тестов и документов\n` +
            `• 📊 <b>Дайджест:</b> сводка ключевых задач каждый понедельник\n` +
            `• ⚠️ <b>Актуальность:</b> мягкие напоминания, если баллы устарели\n` +
            `• 🏆 <b>Достижения:</b> бейджи за выполнение этапов поступления\n\n` +
            `<b>Быстрые команды бота:</b>\n` +
            `/deadlines — список ближайших дедлайнов\n` +
            `/status — текущий прогресс и стрик\n` +
            `/help — справочная информация\n` +
            `/stop — отключить уведомления`;

          await sendTelegramMessage(chatId, welcomeMsg);
          return res.status(200).json({ ok: true });
        } else {
          await sendTelegramMessage(
            chatId,
            `⚠️ <b>Код привязки не найден или его срок действия (10 минут) истёк.</b>\n\n` +
            `Пожалуйста, перейдите в личный кабинет AdmitRoute и нажмите кнопку «Подключить Telegram» заново.`
          );
          return res.status(200).json({ ok: true });
        }
      } else {
        await sendTelegramMessage(
          chatId,
          `👋 <b>Добро пожаловать в бота AdmitRoute!</b>\n\n` +
          `Чтобы привязать этот чат к вашему аккаунту для получения напоминаний о дедлайнах:\n` +
          `1. Откройте <a href="https://admitroute.kz">AdmitRoute</a>\n` +
          `2. В профиле или дорожной карте нажмите кнопку <b>«Подключить Telegram»</b>\n` +
          `3. Нажмите кнопку «Перейти в бота» или пришлите команду вида:\n<code>/start ARXXXX</code>`
        );
        return res.status(200).json({ ok: true });
      }
    }

    // Find linked user for this chat
    const linkedUser = users.find(u => String(u.telegramChatId) === chatId);

    // Case B: /deadlines
    if (text === '/deadlines') {
      if (!linkedUser) {
        await sendTelegramMessage(chatId, `⚠️ Ваш Telegram пока не привязан к аккаунту AdmitRoute. Привяжите его через сайт.`);
        return res.status(200).json({ ok: true });
      }

      const roadmap: any[] = Array.isArray(linkedUser.roadmap) ? linkedUser.roadmap : [];
      const pending = roadmap.filter(s => !s.completed);

      if (pending.length === 0) {
        await sendTelegramMessage(chatId, `🎉 <b>Отличная работа!</b> Все текущие дедлайны дорожной карты выполнены.`);
        return res.status(200).json({ ok: true });
      }

      let deadlineMsg = `📅 <b>Ближайшие дедлайны поступления:</b>\n\n`;
      pending.slice(0, 5).forEach((s, idx) => {
        deadlineMsg += `${idx + 1}. <b>${s.title}</b>\n   ⏳ Срок: ${s.deadlineDate || 'Уточняется'}\n\n`;
      });
      deadlineMsg += `👉 <a href="https://admitroute.kz">Открыть дорожную карту</a>`;

      await sendTelegramMessage(chatId, deadlineMsg);
      return res.status(200).json({ ok: true });
    }

    // Case C: /status
    if (text === '/status') {
      if (!linkedUser) {
        await sendTelegramMessage(chatId, `⚠️ Ваш Telegram пока не привязан к аккаунту AdmitRoute.`);
        return res.status(200).json({ ok: true });
      }

      const roadmap: any[] = Array.isArray(linkedUser.roadmap) ? linkedUser.roadmap : [];
      const completedCount = roadmap.filter(s => s.completed).length;
      const progressPercent = roadmap.length > 0 ? Math.round((completedCount / roadmap.length) * 100) : 0;
      const streak = linkedUser.gamification?.streak?.currentStreak || 1;
      const programsCount = (linkedUser.selectedPrograms || []).length;

      const statusMsg =
        `📊 <b>Ваш статус подготовки в AdmitRoute</b>\n\n` +
        `👤 Имя: <b>${linkedUser.name || 'Абитуриент'}</b>\n` +
        `🎯 Выбрано вузов: <b>${programsCount}</b>\n` +
        `📈 Выполнение Roadmap: <b>${progressPercent}%</b> (${completedCount}/${roadmap.length})\n` +
        `🔥 Стрик активности: <b>${streak} дн. подряд</b>\n\n` +
        `👉 <a href="https://admitroute.kz">Перейти в личный кабинет</a>`;

      await sendTelegramMessage(chatId, statusMsg);
      return res.status(200).json({ ok: true });
    }

    // Case D: /stop
    if (text === '/stop') {
      if (linkedUser) {
        linkedUser.telegramChatId = null;
        state.updatedAt = new Date().toISOString();
        await sql`
          INSERT INTO app_state (key, value, updated_at)
          VALUES (${STATE_KEY}, ${JSON.stringify(state)}::jsonb, NOW())
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
        `;
      }

      await sendTelegramMessage(chatId, `🔕 <b>Уведомления отключены.</b>\nВы в любой момент можете снова подключить Telegram в настройках AdmitRoute.`);
      return res.status(200).json({ ok: true });
    }

    // Case E: /help or unknown
    const helpMsg =
      `ℹ️ <b>Команды бота AdmitRoute:</b>\n\n` +
      `/deadlines — список ваших дедлайнов\n` +
      `/status — ваш прогресс и стрик\n` +
      `/stop — отключить уведомления\n` +
      `/help — это справочное меню\n\n` +
      `🌐 Веб-сайт: <a href="https://admitroute.kz">admitroute.kz</a>`;

    await sendTelegramMessage(chatId, helpMsg);
    return res.status(200).json({ ok: true });
  } catch (error) {
    return sendSanitizedError(res, error, 500, 'Ошибка обработки вебхука Telegram');
  }
}
