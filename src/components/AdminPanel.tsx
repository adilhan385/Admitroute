import { useState, useEffect, useRef } from 'react';
import {
  X,
  Shield,
  Users,
  Ban,
  Trash2,
  MessageSquare,
  Search,
  Settings,
  Send,
  Sparkles,
  CheckCircle2,
  CreditCard
} from 'lucide-react';
import {
  getAllUsers,
  toggleBanUser,
  setSubscriptionTier,
  deleteUser,
  getSiteSettings,
  updateSiteSettings
} from '../services/auth';
import {
  getAllThreadSummaries,
  getThreadMessages,
  sendAdminReply,
  activateProFromChat,
  markThreadReadByAdmin,
  getTotalUnreadForAdmin,
  type ChatThreadSummary,
  type ChatMessage
} from '../services/chat';
import type { UserAccount, SiteSettings, SubscriptionTier } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'messages' | 'settings'>('users');
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [threadSummaries, setThreadSummaries] = useState<ChatThreadSummary[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [activeThreadMessages, setActiveThreadMessages] = useState<ChatMessage[]>([]);
  const [adminReplyInput, setAdminReplyInput] = useState('');
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(getSiteSettings());
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadData = () => {
    setUsers(getAllUsers());
    const summaries = getAllThreadSummaries();
    setThreadSummaries(summaries);
    setSiteSettings(getSiteSettings());

    if (!selectedThreadId && summaries.length > 0) {
      setSelectedThreadId(summaries[0].threadId);
      setActiveThreadMessages(getThreadMessages(summaries[0].threadId));
      markThreadReadByAdmin(summaries[0].threadId);
    } else if (selectedThreadId) {
      setActiveThreadMessages(getThreadMessages(selectedThreadId));
      markThreadReadByAdmin(selectedThreadId);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (selectedThreadId) {
      setActiveThreadMessages(getThreadMessages(selectedThreadId));
      markThreadReadByAdmin(selectedThreadId);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [selectedThreadId]);

  if (!isOpen) return null;

  // Protect admin access
  if (currentUser.role !== 'admin' && currentUser.email.toLowerCase() !== 'adilhananuar426@gmail.com') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
          <Ban className="mx-auto h-12 w-12 text-rose-600 mb-3" />
          <h3 className="text-lg font-bold text-slate-900">Доступ ограничен</h3>
          <p className="mt-1 text-xs text-slate-600">
            Данный раздел предназначен исключительно для администратора (adilhananuar426@gmail.com).
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
          >
            Закрыть
          </button>
        </div>
      </div>
    );
  }

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleToggleBan = (userId: string, currentStatus: boolean) => {
    const res = toggleBanUser(userId);
    if (res.success) {
      loadData();
      showNotification(currentStatus ? 'Пользователь разблокирован' : 'Пользователь заблокирован');
    }
  };

  const handleSetSubscription = (userId: string, tier: SubscriptionTier) => {
    const res = setSubscriptionTier(userId, tier);
    if (res.success) {
      loadData();
      showNotification(tier === 'pro' ? 'Выдана подписка PRO' : 'Подписка изменена на Free');
    }
  };

  const handleDeleteUser = (userId: string, email: string) => {
    if (window.confirm(`Вы уверены, что хотите удалить пользователя ${email}?`)) {
      const res = deleteUser(userId);
      if (res.success) {
        loadData();
        showNotification('Пользователь удален');
      }
    }
  };

  const handleSendAdminReply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedThreadId || !adminReplyInput.trim()) return;

    sendAdminReply(selectedThreadId, adminReplyInput.trim());
    setAdminReplyInput('');
    loadData();
    showNotification('Ответ отправлен пользователю в чат');
  };

  const handleActivateProForSelectedThread = () => {
    if (!selectedThreadId) return;
    const res = activateProFromChat(selectedThreadId);
    if (res.success) {
      loadData();
      showNotification('Подписка PRO успешно активирована для этого пользователя!');
    }
  };

  const handleSaveSettings = () => {
    updateSiteSettings(siteSettings);
    showNotification('Настройки сайта обновлены');
  };

  // Filtered users
  const filteredUsers = users.filter(
    u =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPro = users.filter(u => u.subscriptionTier === 'pro').length;
  const totalBanned = users.filter(u => u.isBanned).length;
  const totalUnreadChat = getTotalUnreadForAdmin();

  const currentThreadSummary = threadSummaries.find(t => t.threadId === selectedThreadId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-3 sm:p-6 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative flex h-[92vh] max-h-[780px] w-full max-w-5xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-3.5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs font-bold">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">Панель администратора AdmitRoute</h3>
                <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Управление пользователями, активация подписок PRO и живой чат поддержки
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-slate-200 bg-slate-50 p-3.5">
          <div className="rounded-xl border border-slate-200 bg-white p-2.5">
            <div className="text-[10px] font-semibold uppercase text-slate-500">Пользователей в базе</div>
            <div className="mt-0.5 text-xl font-bold text-slate-900">{users.length}</div>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-2.5">
            <div className="text-[10px] font-semibold uppercase text-blue-700">Активных PRO</div>
            <div className="mt-0.5 text-xl font-bold text-blue-700">{totalPro}</div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-2.5">
            <div className="text-[10px] font-semibold uppercase text-amber-700">Чаты и заявки</div>
            <div className="mt-0.5 text-xl font-bold text-amber-700">
              {threadSummaries.length} {totalUnreadChat > 0 && <span className="text-xs text-rose-600 font-bold">({totalUnreadChat} новых)</span>}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-2.5">
            <div className="text-[10px] font-semibold uppercase text-slate-500">Заблокировано</div>
            <div className="mt-0.5 text-xl font-bold text-rose-600">{totalBanned}</div>
          </div>
        </div>

        {/* Action Notice Alert */}
        {actionNotice && (
          <div className="bg-emerald-600 px-4 py-1.5 text-center text-xs font-semibold text-white animate-in slide-in-from-top duration-150">
            ✓ {actionNotice}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-semibold transition-all ${
              activeTab === 'users'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>База пользователей ({users.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-semibold transition-all ${
              activeTab === 'messages'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Живой чат и заявки на PRO ({threadSummaries.length})</span>
            {totalUnreadChat > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] text-white font-bold">
                {totalUnreadChat}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-semibold transition-all ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Управление сайтом</span>
          </button>
        </div>

        {/* Tab 1: Users */}
        {activeTab === 'users' && (
          <div className="flex-1 flex flex-col overflow-hidden p-5">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Поиск по email или имени..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                />
              </div>
              <div className="text-xs text-slate-500">
                Найдено пользователей: {filteredUsers.length}
              </div>
            </div>

            <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="sticky top-0 border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5">Пользователь</th>
                    <th className="px-4 py-2.5">Роль</th>
                    <th className="px-4 py-2.5">Подписка</th>
                    <th className="px-4 py-2.5">Поисков / Расчетов</th>
                    <th className="px-4 py-2.5">Статус</th>
                    <th className="px-4 py-2.5 text-right">Действия админа</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(u => {
                    const isAdmin = u.email.toLowerCase() === 'adilhananuar426@gmail.com';

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-2.5">
                          <div className="font-semibold text-slate-900">{u.name}</div>
                          <div className="text-[11px] text-slate-500">{u.email}</div>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                            u.role === 'admin'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {u.role === 'admin' ? '👑 Admin' : '🎓 Customer'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                            u.subscriptionTier === 'pro'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {u.subscriptionTier === 'pro' ? '⭐ PRO' : 'Free'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-[11px] text-slate-600">
                          {u.usageStats?.searchesCount ?? 0} поисков • {u.usageStats?.recalculationsCount ?? 0} расчетов
                        </td>
                        <td className="px-4 py-2.5">
                          {u.isBanned ? (
                            <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                              Заблокирован
                            </span>
                          ) : (
                            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                              Активен
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {isAdmin ? (
                            <span className="text-[11px] font-medium text-slate-400">Главный аккаунт</span>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              {u.subscriptionTier === 'pro' ? (
                                <button
                                  type="button"
                                  onClick={() => handleSetSubscription(u.id, 'free')}
                                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                                >
                                  Снять PRO
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetSubscription(u.id, 'pro')}
                                  className="rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-700 shadow-2xs"
                                >
                                  + Выдать PRO
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleToggleBan(u.id, u.isBanned)}
                                className={`rounded-lg px-2 py-1 text-[11px] font-medium ${
                                  u.isBanned
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                }`}
                              >
                                {u.isBanned ? 'Разбанить' : 'Бан'}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u.id, u.email)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Messages (THREADED MESSENGER) */}
        {activeTab === 'messages' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Thread List */}
            <div className="w-72 border-r border-slate-200 bg-slate-50/70 overflow-y-auto flex flex-col">
              <div className="p-3 border-b border-slate-200 bg-white font-semibold text-xs text-slate-800">
                Диалоги пользователей ({threadSummaries.length})
              </div>
              <div className="divide-y divide-slate-200/60">
                {threadSummaries.map(thread => {
                  const isSelected = thread.threadId === selectedThreadId;

                  return (
                    <button
                      key={thread.threadId}
                      type="button"
                      onClick={() => setSelectedThreadId(thread.threadId)}
                      className={`w-full text-left p-3 transition-colors flex flex-col gap-1 ${
                        isSelected ? 'bg-white border-l-4 border-l-blue-600 shadow-2xs' : 'hover:bg-white/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-xs text-slate-900 truncate">
                          {thread.userName}
                        </div>
                        {thread.unreadCountForAdmin > 0 && (
                          <span className="rounded-full bg-rose-600 px-1.5 py-0.2 text-[9px] font-bold text-white">
                            +{thread.unreadCountForAdmin}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-500 truncate">
                        {thread.userEmail}
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        {thread.isPro ? (
                          <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[9px] font-bold text-blue-700">
                            ⭐ PRO
                          </span>
                        ) : (
                          <span className="rounded bg-slate-200 px-1.5 py-0.2 text-[9px] font-medium text-slate-600">
                            Free
                          </span>
                        )}
                        {thread.hasPaymentRequest && !thread.isPro && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800 flex items-center gap-0.5">
                            <CreditCard className="h-2.5 w-2.5" />
                            <span>Хочет PRO</span>
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-600 truncate mt-1 italic">
                        "{thread.lastMessage}"
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Chat Conversation Area */}
            {selectedThreadId && currentThreadSummary ? (
              <div className="flex-1 flex flex-col overflow-hidden bg-white">
                {/* Conversation Header with Quick PRO Activation Button */}
                <div className="flex items-center justify-between border-b border-slate-200 p-3 bg-slate-50">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{currentThreadSummary.userName}</h4>
                      <span className="text-[11px] text-slate-500 font-normal">({currentThreadSummary.userEmail})</span>
                      {currentThreadSummary.isPro ? (
                        <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                          ⭐ PRO АКТИВЕН
                        </span>
                      ) : (
                        <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          FREE ТАРИФ
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 1-CLICK PRO ACTIVATION BUTTON */}
                  {!currentThreadSummary.isPro ? (
                    <button
                      type="button"
                      onClick={handleActivateProForSelectedThread}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:from-blue-700 hover:to-indigo-700 transition-all"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>⚡ Активировать PRO этому пользователю</span>
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>PRO подписка активирована</span>
                    </div>
                  )}
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                  {activeThreadMessages.map(m => {
                    const isAdmin = m.senderRole === 'admin';
                    const isSystem = m.senderRole === 'system';

                    if (isSystem) {
                      return (
                        <div key={m.id} className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800">
                          <div className="font-bold flex items-center gap-1 mb-0.5">
                            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Системное уведомление</span>
                          </div>
                          <p>{m.text}</p>
                        </div>
                      );
                    }

                    return (
                      <div key={m.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-1 mb-0.5 text-[10px] text-slate-400">
                          <span>{isAdmin ? 'Вы (Администратор)' : m.userName}</span>
                          <span>•</span>
                          <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div
                          className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-2xs ${
                            isAdmin
                              ? 'bg-blue-600 text-white rounded-br-xs'
                              : 'border border-slate-200 bg-white text-slate-800 rounded-bl-xs'
                          }`}
                        >
                          {m.isPaymentRequest && (
                            <div className="mb-1 text-[10px] font-bold text-amber-500 flex items-center gap-1">
                              <CreditCard className="h-3.5 w-3.5" />
                              <span>ЗАЯВКА НА ПОДПИСКУ PRO</span>
                            </div>
                          )}
                          <p>{m.text}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendAdminReply} className="border-t border-slate-200 p-3 bg-white flex items-center gap-2">
                  <input
                    type="text"
                    value={adminReplyInput}
                    onChange={e => setAdminReplyInput(e.target.value)}
                    placeholder="Напишите ответ пользователю в чат..."
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!adminReplyInput.trim()}
                    className="flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-40 transition-colors shadow-2xs"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Отправить ответ</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6 text-slate-400 text-xs">
                Выберите диалог из списка слева для просмотра и ответа
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Site Settings */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="max-w-xl space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Информационный баннер для всех посетителей</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Текст баннера будет отображаться в верхней части сайта.
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="banner-toggle"
                    checked={siteSettings.isAnnouncementActive}
                    onChange={e =>
                      setSiteSettings({ ...siteSettings, isAnnouncementActive: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="banner-toggle" className="text-xs font-semibold text-slate-700">
                    Показывать баннер на сайте
                  </label>
                </div>

                <input
                  type="text"
                  value={siteSettings.announcementText}
                  onChange={e =>
                    setSiteSettings({ ...siteSettings, announcementText: e.target.value })
                  }
                  placeholder="Текст объявления..."
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs"
                >
                  Сохранить настройки
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
