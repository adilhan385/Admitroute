import type { SupportMessage } from '../types';

const STORAGE_CHAT_KEY = 'admitroute_support_chat_v1';

export const ADMIN_CONTACTS = {
  name: 'Адильхан',
  phone: '+7 775 253 01 10',
  phoneRaw: '77752530110',
  telegram: '@nftkoroi',
  telegramUrl: 'https://t.me/nftkoroi',
  whatsappUrl: 'https://wa.me/77752530110?text=' + encodeURIComponent('Здравствуйте! Хочу оформить подписку AdmitRoute PRO на поступление.'),
  email: 'adilhananuar426@gmail.com'
};

const SEED_MESSAGES: SupportMessage[] = [
  {
    id: 'msg-welcome-01',
    userId: 'system',
    userEmail: 'adilhananuar426@gmail.com',
    userName: 'Адильхан (Администратор AdmitRoute)',
    message: 'Здравствуйте! Для оформления подписки AdmitRoute PRO, снятия лимитов или индивидуального аудита документов напишите мне здесь либо сразу в WhatsApp или Telegram.',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    isRead: true
  }
];

export function getAllMessages(): SupportMessage[] {
  if (typeof window === 'undefined') return SEED_MESSAGES;
  try {
    const raw = localStorage.getItem(STORAGE_CHAT_KEY);
    return raw ? JSON.parse(raw) : SEED_MESSAGES;
  } catch {
    return SEED_MESSAGES;
  }
}

function saveMessages(msgs: SupportMessage[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(msgs));
}

export function getUserMessages(userId: string): SupportMessage[] {
  const all = getAllMessages();
  return all.filter(m => m.userId === userId || m.userId === 'system');
}

export function sendSupportMessage(userId: string, userEmail: string, userName: string, text: string): SupportMessage {
  const all = getAllMessages();
  const newMsg: SupportMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId: userId || 'guest',
    userEmail: userEmail || 'guest@admitroute.kz',
    userName: userName || 'Гость сайта',
    message: text.trim(),
    createdAt: new Date().toISOString(),
    isRead: false
  };

  all.push(newMsg);
  saveMessages(all);
  return newMsg;
}

export function replyToSupportMessage(messageId: string, replyText: string): boolean {
  const all = getAllMessages();
  const target = all.find(m => m.id === messageId);
  if (!target) return false;

  target.reply = replyText.trim();
  target.repliedAt = new Date().toISOString();
  target.isRead = true;
  saveMessages(all);
  return true;
}

export function markAsRead(messageId: string): void {
  const all = getAllMessages();
  const target = all.find(m => m.id === messageId);
  if (target) {
    target.isRead = true;
    saveMessages(all);
  }
}

export function getUnreadCount(): number {
  const all = getAllMessages();
  return all.filter(m => !m.isRead && m.userId !== 'system').length;
}
