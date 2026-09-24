import { setSubscriptionTier, getAllUsers, SUPER_ADMIN_EMAIL } from './auth';
import { pushSharedState } from './remoteSync';

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
  email: (import.meta.env.VITE_ADMIN_EMAIL as string) || 'support@admitroute.kz'
};

function notifyChatChange(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('admitroute_chat_update'));
    window.dispatchEvent(new Event('storage'));
  }
}

export function getAllChatMessages(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_CHAT_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify([]));
      return [];
    }
    let msgs: ChatMessage[] = JSON.parse(raw);
    let modified = false;

    // Purge fake seed messages and messages from fake demo users
    const initialCount = msgs.length;
    msgs = msgs.filter(
      m => !m.id.startsWith('msg-seed-') && !m.threadId.startsWith('user-demo-')
    );
    if (msgs.length !== initialCount) {
      modified = true;
    }

    if (modified) {
      localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(msgs));
    }
    return msgs;
  } catch {
    return [];
  }
}

function saveAllChatMessages(msgs: ChatMessage[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(msgs));
  notifyChatChange();
  void pushSharedState();
}

/**
 * Получить сообщения конкретной переписки
 */
export function getThreadMessages(threadId: string): ChatMessage[] {
  const all = getAllChatMessages();
  return all.filter(m => m.threadId === threadId);
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
  const all = getAllChatMessages();
  const newMsg: ChatMessage = {
    id: `msg-${crypto.randomUUID()}`,
    threadId,
    userName: userName || 'Гость сайта',
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
  adminEmail: string = SUPER_ADMIN_EMAIL
): ChatMessage {
  const all = getAllChatMessages();
  const newMsg: ChatMessage = {
    id: `msg-${crypto.randomUUID()}`,
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
