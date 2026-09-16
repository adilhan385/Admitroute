import { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, Shield, CheckCircle2, Sparkles, ExternalLink, Phone } from 'lucide-react';
import { ADMIN_CONTACTS, getUserMessages, sendSupportMessage } from '../services/chat';
import { getCurrentUser } from '../services/auth';
import type { SupportMessage } from '../types';

interface SupportChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTopic?: string;
}

export const SupportChatModal: React.FC<SupportChatModalProps> = ({
  isOpen,
  onClose,
  defaultTopic
}) => {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [inputText, setInputText] = useState(defaultTopic ? `Здравствуйте! Хочу оформить подписку ${defaultTopic}.` : '');
  const [isSent, setIsSent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = getCurrentUser();
  const userId = currentUser ? currentUser.id : 'guest-session';
  const userEmail = currentUser ? currentUser.email : 'guest@admitroute.kz';
  const userName = currentUser ? currentUser.name : 'Гость';

  useEffect(() => {
    if (isOpen) {
      const msgs = getUserMessages(userId);
      setMessages(msgs);
      setIsSent(false);
    }
  }, [isOpen, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = sendSupportMessage(userId, userEmail, userName, inputText.trim());
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setIsSent(true);
    setTimeout(() => setIsSent(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative flex h-[90vh] max-h-[620px] w-full max-w-lg flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-slate-900">Чат с основателем и админом</h4>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-500">
                Адильхан • Подписка PRO, аудит документов, партнерство
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Connect Action Bar (WhatsApp & Telegram) */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50/70 via-slate-50 to-emerald-50/50 p-3">
          <div className="text-[11px] font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Для моментального оформления подписки PRO напишите напрямую:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={ADMIN_CONTACTS.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 shadow-2xs hover:bg-emerald-50 transition-colors"
            >
              <Phone className="h-3.5 w-3.5 text-emerald-600" />
              <span>WhatsApp: +7 775 253 01 10</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>

            <a
              href={ADMIN_CONTACTS.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-sky-200 bg-white px-3 py-2 text-xs font-semibold text-sky-700 shadow-2xs hover:bg-sky-50 transition-colors"
            >
              <Send className="h-3.5 w-3.5 text-sky-600" />
              <span>Telegram: @nftkoroi</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          </div>
        </div>

        {/* Chat Message History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {messages.map(msg => {
            const isMe = msg.userId === userId && msg.userId !== 'system';
            const isAdmin = msg.userId === 'system' || msg.userEmail === ADMIN_CONTACTS.email;

            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  {isAdmin && <Shield className="h-3 w-3 text-blue-600" />}
                  <span className="text-[10px] font-semibold text-slate-500">
                    {msg.userName}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'border border-slate-200 bg-white text-slate-800 shadow-2xs rounded-bl-xs'
                  }`}
                >
                  <p>{msg.message}</p>

                  {/* Admin Reply inside thread if any */}
                  {msg.reply && (
                    <div className="mt-2.5 border-t border-slate-100 pt-2 text-[11px] text-emerald-800 bg-emerald-50/80 rounded-lg p-2">
                      <div className="font-semibold flex items-center gap-1 mb-0.5">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        <span>Ответ администратора:</span>
                      </div>
                      <p>{msg.reply}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Success Alert */}
        {isSent && (
          <div className="border-t border-emerald-100 bg-emerald-50 px-4 py-2 text-[11px] text-emerald-700 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            <span>Сообщение отправлено! Администратор ответит здесь или свяжитесь в WhatsApp для мгновенного ответа.</span>
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="border-t border-slate-200 bg-white p-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Напишите сообщение администратору..."
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
            <span>Тариф PRO: 4 990 ₸/мес • Снятие всех ограничений</span>
            <span>Онлайн: Пн–Вс</span>
          </div>
        </form>
      </div>
    </div>
  );
};
