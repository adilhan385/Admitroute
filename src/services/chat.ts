import { setSubscriptionTier, getAllUsers, getSiteSettings, SUPER_ADMIN_EMAIL } from './auth';

export interface ChatMessage {
  id: string;
  threadId: string; // userId or guest id
  userEmail: string;
  userName: string;
  senderRole: 'user' | 'admin' | 'system';
  text: string;
  createdAt: string;
  isReadByAdmin: boolean;
  isReadByUser: boolean;
  isPaymentRequest?: boolean;
  isProActivated?: boolean;
}

export interface ChatThreadSummary {
  threadId: string;
  userName: string;
  userEmail: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCountForAdmin: number;
  isPro: boolean;
  hasPaymentRequest: boolean;
}

const STORAGE_CHAT_KEY = 'admitroute_live_chat_threads_v2';

export const ADMIN_CONTACTS = {
  name: 'Адильхан',
  phone: '+7 775 253 01 10',
  phoneRaw: '77752530110',
  telegram: '@nftkoroi',
  telegramUrl: 'https://t.me/nftkoroi',
  whatsappUrl: 'https://wa.me/77752530110?text=' + encodeURIComponent('Здравствуйте! Хочу оформить подписку AdmitRoute PRO на поступление.'),
  email: 'adilhananuar426@gmail.com'
};

const SEED_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-seed-01',
    threadId: 'user-demo-02',
    userEmail: 'student@admitroute.kz',
    userName: 'Алихан (Абитуриент)',
    senderRole: 'user',
    text: 'Здравствуйте! Хочу оформить подписку AdmitRoute PRO для безлимитного поиска вузов Европы и Италии.',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    isReadByAdmin: false,
    isReadByUser: true,
    isPaymentRequest: true
  },
  {
    id: 'msg-seed-02',
    threadId: 'user-demo-02',
    userEmail: 'adilhananuar426@gmail.com',
    userName: 'Адильхан (Основатель AdmitRoute)',
    senderRole: 'admin',
    text: 'Приветствую, Алихан! Отличный выбор. Оплату можно произвести переводом на Kaspi (+7 775 253 01 10). Как оплатите — напишите сюда, и я сразу активирую PRO в этом чате.',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    isReadByAdmin: true,
    isReadByUser: true
  }
];

function notifyChatChange(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('admitroute_chat_update'));
  }
}

export function getAllChatMessages(): ChatMessage[] {
  if (typeof window === 'undefined') return SEED_MESSAGES;
  try {
    const raw = localStorage.getItem(STORAGE_CHAT_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(SEED_MESSAGES));
      return SEED_MESSAGES;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_MESSAGES;
  }
}

function saveAllChatMessages(msgs: ChatMessage[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(msgs));
  notifyChatChange();
}

/**
 * Получить сообщения конкретной переписки
 */
export function getThreadMessages(threadId: string): ChatMessage[] {
  const all = getAllChatMessages();
  const threadMsgs = all.filter(m => m.threadId === threadId);

  // If new thread and empty, inject welcome greeting
  if (threadMsgs.length === 0) {
    const welcomeMsg: ChatMessage = {
      id: `msg-welcome-${threadId}`,
      threadId,
      userEmail: 'adilhananuar426@gmail.com',
      userName: 'Адильхан (Основатель AdmitRoute)',
      senderRole: 'admin',
      text: 'Здравствуйте! Я основатель платформы AdmitRoute. Здесь вы можете задать вопрос по поступлению, запросить подбор вузов или оформить подписку PRO прямо в чате.',
      createdAt: new Date().toISOString(),
      isReadByAdmin: true,
      isReadByUser: true
    };
    all.push(welcomeMsg);
    saveAllChatMessages(all);
    return [welcomeMsg];
  }

  return threadMsgs;
}

/**
 * Отправить сообщение от пользователя
 */
export function sendUserMessage(
  threadId: string,
  userName: string,
  userEmail: string,
  text: string,
  isPaymentRequest: boolean = false
): ChatMessage {
  const settings = getSiteSettings();
  if (threadId === 'guest-session' && !settings.allowGuestChat) {
    throw new Error('Гостевой чат отключен администратором. Пожалуйста, войдите в аккаунт.');
  }

  const all = getAllChatMessages();
  const newMsg: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    threadId,
    userName: userName || 'Гость',
    userEmail: userEmail || 'guest@admitroute.kz',
    senderRole: 'user',
    text: text.trim(),
    createdAt: new Date().toISOString(),
    isReadByAdmin: false,
    isReadByUser: true,
    isPaymentRequest
  };

  all.push(newMsg);
  saveAllChatMessages(all);
  return newMsg;
}

/**
 * Ответ администратора в конкретный тред
 */
export function sendAdminReply(
  threadId: string,
  text: string,
  adminName: string = 'Адильхан (Основатель)',
  adminEmail: string = 'adilhananuar426@gmail.com'
): ChatMessage {
  const all = getAllChatMessages();
  const newMsg: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    threadId,
    userName: adminName,
    userEmail: adminEmail,
    senderRole: 'admin',
    text: text.trim(),
    createdAt: new Date().toISOString(),
    isReadByAdmin: true,
    isReadByUser: false
  };

  all.push(newMsg);
  saveAllChatMessages(all);
  return newMsg;
}

/**
 * Активация подписки PRO прямо из чата админом
 */
export function activateProFromChat(threadId: string, userId?: string): { success: boolean; message: ChatMessage } {
  const allUsers = getAllUsers();

  // Try finding user by userId or threadId or email
  let targetUser = allUsers.find(u => u.id === (userId || threadId));
  if (!targetUser) {
    // Check if thread messages have user email
    const threadMsgs = getThreadMessages(threadId);
    const userMsg = threadMsgs.find(m => m.senderRole === 'user');
    if (userMsg && userMsg.userEmail) {
      targetUser = allUsers.find(u => u.email.toLowerCase() === userMsg.userEmail.toLowerCase());
    }
  }

  if (targetUser) {
    setSubscriptionTier(targetUser.id, 'pro');
  }

  // Post system celebration message to thread
  const all = getAllChatMessages();
  const activationMsg: ChatMessage = {
    id: `msg-pro-${Date.now()}`,
    threadId,
    userName: 'Система AdmitRoute',
    userEmail: 'system@admitroute.kz',
    senderRole: 'system',
    text: `🎉 Администратор Адильхан активировал подписку AdmitRoute PRO${targetUser ? ' для аккаунта ' + targetUser.email : ''}! Теперь вам открыт безлимитный поиск любых университетов мира, расширенный роадмап и AI-генератор эссе.`,
    createdAt: new Date().toISOString(),
    isReadByAdmin: true,
    isReadByUser: false,
    isProActivated: true
  };

  all.push(activationMsg);
  saveAllChatMessages(all);

  return { success: true, message: activationMsg };
}

/**
 * Сводка всех тредов для панели администратора
 */
export function getAllThreadSummaries(): ChatThreadSummary[] {
  const allMsgs = getAllChatMessages();
  const allUsers = getAllUsers();

  const threadsMap: Record<string, ChatMessage[]> = {};
  for (const msg of allMsgs) {
    if (!threadsMap[msg.threadId]) {
      threadsMap[msg.threadId] = [];
    }
    threadsMap[msg.threadId].push(msg);
  }

  // CRITICAL: Ensure ALL registered non-admin users are visible in dialogs list
  for (const u of allUsers) {
    if (u.role === 'admin' || u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      continue;
    }
    if (!threadsMap[u.id]) {
      threadsMap[u.id] = [];
    }
  }

  const summaries: ChatThreadSummary[] = [];

  for (const threadId in threadsMap) {
    const msgs = threadsMap[threadId];
    const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
    const userMsg = msgs.find(m => m.senderRole === 'user') || lastMsg;

    // Check if user is pro
    const userEmailClean = userMsg?.userEmail ? userMsg.userEmail.toLowerCase() : '';
    const matchedUser = allUsers.find(
      u => u.id === threadId || (userEmailClean && u.email.toLowerCase() === userEmailClean)
    );
    const isPro = matchedUser ? matchedUser.subscriptionTier === 'pro' : false;

    const unreadCount = msgs.filter(m => !m.isReadByAdmin && m.senderRole === 'user').length;
    const hasPaymentRequest = msgs.some(m => m.isPaymentRequest);

    summaries.push({
      threadId,
      userName: matchedUser?.name || userMsg?.userName || (threadId === 'guest-session' ? 'Гость сайта' : 'Пользователь'),
      userEmail: matchedUser?.email || userMsg?.userEmail || (threadId === 'guest-session' ? 'guest@admitroute.kz' : ''),
      lastMessage: lastMsg ? lastMsg.text : 'Диалог еще не начат (нажмите, чтобы написать)',
      lastMessageAt: lastMsg ? lastMsg.createdAt : (matchedUser?.createdAt || new Date().toISOString()),
      unreadCountForAdmin: unreadCount,
      isPro,
      hasPaymentRequest
    });
  }

  // Sort by unread first, then by latest message date
  return summaries.sort((a, b) => {
    if (a.unreadCountForAdmin !== b.unreadCountForAdmin) {
      return b.unreadCountForAdmin - a.unreadCountForAdmin;
    }
    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
  });
}

/**
 * Отметить все сообщения треда как прочитанные админом
 */
export function markThreadReadByAdmin(threadId: string): void {
  const all = getAllChatMessages();
  let modified = false;

  for (const m of all) {
    if (m.threadId === threadId && !m.isReadByAdmin) {
      m.isReadByAdmin = true;
      modified = true;
    }
  }

  if (modified) {
    saveAllChatMessages(all);
  }
}

/**
 * Получить общее количество непрочитанных сообщений для админа
 */
export function getTotalUnreadForAdmin(): number {
  const all = getAllChatMessages();
  return all.filter(m => !m.isReadByAdmin && m.senderRole === 'user').length;
}

// Backward compatibility helper
export function getAllMessages(): any[] {
  return getAllChatMessages().map(m => ({
    id: m.id,
    userId: m.threadId,
    userEmail: m.userEmail,
    userName: m.userName,
    message: m.text,
    createdAt: m.createdAt,
    isRead: m.isReadByAdmin
  }));
}

// Backward-compatibility wrappers
export function getUserMessages(userId: string): any[] {
  return getThreadMessages(userId).map(m => ({
    id: m.id,
    userId: m.threadId,
    userEmail: m.userEmail,
    userName: m.userName,
    message: m.text,
    createdAt: m.createdAt,
    isRead: m.isReadByAdmin
  }));
}

export function sendSupportMessage(userId: string, userEmail: string, userName: string, text: string): any {
  const msg = sendUserMessage(userId, userName, userEmail, text, false);
  return {
    id: msg.id,
    userId: msg.threadId,
    userEmail: msg.userEmail,
    userName: msg.userName,
    message: msg.text,
    createdAt: msg.createdAt,
    isRead: false
  };
}
