import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Phone,
  ExternalLink,
  Shield,
  CreditCard,
  Minimize2,
  LogIn
} from 'lucide-react';
import {
  getThreadMessages,
  sendUserMessage,
  ADMIN_CONTACTS,
  getTotalUnreadForAdmin
} from '../services/chat';
import type { UserAccount } from '../types';
import type { ChatMessage } from '../services/chat';

interface LiveChatWidgetProps {
  currentUser: UserAccount | null;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  isOpenExternal?: boolean;
  onCloseExternal?: () => void;
  initialTopic?: string;
  onOpenAdmin?: (tab?: 'users' | 'messages' | 'settings') => void;
}

export const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({
  currentUser,
  onOpenAuth,
  isOpenExternal,
  onCloseExternal,
  initialTopic,
  onOpenAdmin
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadCountAdmin, setUnreadCountAdmin] = useState<number>(() => getTotalUnreadForAdmin());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser?.role === 'admin' || !!currentUser?.isSuperAdmin;
  const isGuest = !currentUser || currentUser.role === 'guest';
  const threadId = currentUser ? currentUser.id : 'guest-session';
  const userName = currentUser ? currentUser.name : 'Гость сайта';
  const userEmail = currentUser ? currentUser.email : 'guest@admitroute.kz';
  const isPro = currentUser?.subscriptionTier === 'pro';

  // Synchronize with external triggers
  useEffect(() => {
    if (isOpenExternal !== undefined) {
      setIsOpen(isOpenExternal);
    }
  }, [isOpenExternal]);

  const handleClose = () => {
    setIsOpen(false);
    if (onCloseExternal) onCloseExternal();
  };

  const loadMessages = () => {
    const msgs = getThreadMessages(threadId);
    setMessages(msgs);
  };

  useEffect(() => {
    loadMessages();

    const handleUpdate = () => {
      loadMessages();
      setUnreadCountAdmin(getTotalUnreadForAdmin());
    };

    window.addEventListener('admitroute_chat_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('admitroute_chat_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen, messages]);

  const handleSend = (textToSend?: string, isPayment: boolean = false) => {
    const text = textToSend || inputText;
    if (!text || !text.trim()) return;

    try {
      sendUserMessage(threadId, userName, userEmail, text.trim(), isPayment);
      setInputText('');
      loadMessages();
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      alert(err.message || 'Не удалось отправить сообщение');
    }
  };

  const handleRequestProPurchase = () => {
    const proText = `Здравствуйте, Адильхан! Хочу оформить подписку AdmitRoute PRO (4 990 ₸/мес) на аккаунт ${
      userEmail !== 'guest@admitroute.kz' ? userEmail : '(гость сайта)'
    }. Подскажите номер Kaspi для оплаты, чтобы сразу активировать безлимит.`;
    handleSend(proText, true);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Floating Chat Window */}
      {isOpen && (
        <div className="mb-3 flex h-[540px] w-[92vw] max-w-[390px] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold shadow-xs">
                <span>А</span>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-900 bg-emerald-500" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold leading-tight">Адильхан</span>
                  <span className="rounded bg-blue-500/20 px-1 py-0.2 text-[9px] font-semibold text-blue-300">
                    Основатель
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Онлайн • Подписка PRO и поддержка</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {isAdmin && onOpenAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onOpenAdmin('messages');
                  }}
                  className="mr-1 inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-blue-700 transition-colors shadow-2xs"
                  title="Открыть все диалоги в панели администратора"
                >
                  <MessageSquare className="h-3 w-3" />
                  <span>CRM диалогов</span>
                  {unreadCountAdmin > 0 && (
                    <span className="rounded-full bg-rose-500 px-1 py-0.2 text-[9px] font-bold">
                      {unreadCountAdmin}
                    </span>
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                title="Свернуть"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                title="Закрыть"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Subscription Offer Ribbon */}
          <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 via-indigo-50/70 to-purple-50 p-2.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span className="text-[11px] font-semibold text-slate-800">
                  Тариф PRO: 4 990 ₸ • Безлимитный поиск
                </span>
              </div>
              {!isPro && (
                <button
                  type="button"
                  onClick={handleRequestProPurchase}
                  className="rounded-lg bg-blue-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-2xs hover:bg-blue-700 transition-colors"
                >
                  Купить PRO
                </button>
              )}
            </div>

            {/* Quick Messengers Link */}
            <div className="mt-2 flex items-center gap-1.5 pt-1.5 border-t border-slate-200/60 text-[10px]">
              <span className="text-slate-500">Или напрямую:</span>
              <a
                href={ADMIN_CONTACTS.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline"
              >
                <Phone className="h-3 w-3" />
                <span>WhatsApp (+7 775 253 01 10)</span>
                <ExternalLink className="h-2.5 w-2.5 opacity-60" />
              </a>
              <span className="text-slate-300">•</span>
              <a
                href={ADMIN_CONTACTS.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-sky-700 hover:underline"
              >
                <Send className="h-3 w-3" />
                <span>Telegram</span>
                <ExternalLink className="h-2.5 w-2.5 opacity-60" />
              </a>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 bg-slate-50/60">
            {messages.map(msg => {
              const isUser = msg.senderRole === 'user';
              const isSystem = msg.senderRole === 'system';

              if (isSystem) {
                return (
                  <div key={msg.id} className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800 shadow-2xs">
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Уведомление системы AdmitRoute</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">{msg.text}</p>
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-1 mb-0.5 text-[10px] text-slate-400">
                    {!isUser && <Shield className="h-3 w-3 text-blue-600" />}
                    <span>{isUser ? 'Вы' : msg.userName}</span>
                    <span>•</span>
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-2xs ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-br-xs'
                        : 'border border-slate-200 bg-white text-slate-800 rounded-bl-xs'
                    }`}
                  >
                    {msg.isPaymentRequest && (
                      <div className="mb-1 flex items-center gap-1 font-bold text-[10px] text-amber-300">
                        <CreditCard className="h-3 w-3" />
                        <span>ЗАЯВКА НА ПОДПИСКУ PRO</span>
                      </div>
                    )}
                    <p>{msg.text}</p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form for All Users */}
          <div className="border-t border-slate-200 bg-white">
            {isGuest && (
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-3 py-1.5 text-[10px] text-slate-500">
                <span>Режим гостя • Ответ появится прямо здесь</span>
                {onOpenAuth && (
                  <button
                    type="button"
                    onClick={() => onOpenAuth('login')}
                    className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline"
                  >
                    <LogIn className="h-3 w-3" />
                    <span>Войти в аккаунт</span>
                  </button>
                )}
              </div>
            )}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSend();
              }}
              className="p-2.5"
            >
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Напишите вопрос или оформите PRO..."
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors shrink-0"
                  title="Отправить сообщение"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            if (initialTopic) {
              handleRequestProPurchase();
            }
          }}
          className="group flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all"
        >
          <div className="relative flex h-5 w-5 items-center justify-center">
            <MessageSquare className="h-4 w-4 text-sky-400 group-hover:rotate-6 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <span>{isAdmin ? 'Сообщения клиентов' : 'Чат с админом • Купить PRO'}</span>
          {isAdmin ? (
            unreadCountAdmin > 0 && (
              <span className="rounded-full bg-rose-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
                {unreadCountAdmin}
              </span>
            )
          ) : (
            unreadCount > 0 && (
              <span className="rounded-full bg-rose-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )
          )}
        </button>
      )}
    </div>
  );
};
