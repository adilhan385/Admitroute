import { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Users,
  Ban,
  Trash2,
  MessageSquare,
  Search,
  Settings,
  Send
} from 'lucide-react';
import {
  getAllUsers,
  toggleBanUser,
  setSubscriptionTier,
  deleteUser,
  getSiteSettings,
  updateSiteSettings
} from '../services/auth';
import { getAllMessages, replyToSupportMessage } from '../services/chat';
import type { UserAccount, SupportMessage, SiteSettings, SubscriptionTier } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'messages' | 'settings'>('users');
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(getSiteSettings());
  const [searchQuery, setSearchQuery] = useState('');
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadData = () => {
    setUsers(getAllUsers());
    setMessages(getAllMessages());
    setSiteSettings(getSiteSettings());
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

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

  const handleReplyMessage = (msgId: string) => {
    const text = replyTextMap[msgId];
    if (!text || !text.trim()) return;

    replyToSupportMessage(msgId, text.trim());
    setReplyTextMap(prev => ({ ...prev, [msgId]: '' }));
    loadData();
    showNotification('Ответ отправлен пользователю в чат');
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
  const unreadMessages = messages.filter(m => !m.isRead && m.userId !== 'system').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-3 sm:p-6 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative flex h-[92vh] max-h-[780px] w-full max-w-5xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
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
                Управление пользователями, подписками PRO и входящими сообщениями
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-slate-200 bg-slate-50 p-4">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-[11px] font-semibold uppercase text-slate-500">Всего пользователей</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{users.length}</div>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3">
            <div className="text-[11px] font-semibold uppercase text-blue-700">Подписки PRO</div>
            <div className="mt-1 text-2xl font-bold text-blue-700">{totalPro}</div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
            <div className="text-[11px] font-semibold uppercase text-amber-700">Сообщений в чате</div>
            <div className="mt-1 text-2xl font-bold text-amber-700">
              {messages.length} {unreadMessages > 0 && <span className="text-xs text-rose-600 font-semibold">({unreadMessages} новых)</span>}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-[11px] font-semibold uppercase text-slate-500">Заблокировано</div>
            <div className="mt-1 text-2xl font-bold text-rose-600">{totalBanned}</div>
          </div>
        </div>

        {/* Action Notice Alert */}
        {actionNotice && (
          <div className="bg-emerald-600 px-4 py-2 text-center text-xs font-semibold text-white animate-in slide-in-from-top duration-150">
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
            <span>Заявки и Чат ({messages.length})</span>
            {unreadMessages > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] text-white">
                {unreadMessages}
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
          <div className="flex-1 flex flex-col overflow-hidden p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Поиск по email или имени..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
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
                    <th className="px-4 py-3">Пользователь</th>
                    <th className="px-4 py-3">Роль</th>
                    <th className="px-4 py-3">Подписка</th>
                    <th className="px-4 py-3">Поисков / Расчетов</th>
                    <th className="px-4 py-3">Статус</th>
                    <th className="px-4 py-3 text-right">Действия админа</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(u => {
                    const isAdmin = u.email.toLowerCase() === 'adilhananuar426@gmail.com';

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{u.name}</div>
                          <div className="text-[11px] text-slate-500">{u.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                            u.role === 'admin'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {u.role === 'admin' ? '👑 Admin' : '🎓 Customer'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                            u.subscriptionTier === 'pro'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {u.subscriptionTier === 'pro' ? '⭐ PRO' : 'Free'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-slate-600">
                          {u.usageStats.searchesCount} поисков • {u.usageStats.recalculationsCount} расчетов
                        </td>
                        <td className="px-4 py-3">
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
                        <td className="px-4 py-3 text-right">
                          {isAdmin ? (
                            <span className="text-[11px] font-medium text-slate-400">Главный аккаунт</span>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              {u.subscriptionTier === 'pro' ? (
                                <button
                                  type="button"
                                  onClick={() => handleSetSubscription(u.id, 'free')}
                                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                                  title="Откатить до бесплатного тарифа"
                                >
                                  Снять PRO
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetSubscription(u.id, 'pro')}
                                  className="rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-700 shadow-2xs"
                                  title="Выдать безлимитный доступ PRO"
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
                                title="Удалить пользователя"
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

        {/* Tab 2: Messages */}
        {activeTab === 'messages' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Сообщений пока нет. Когда пользователи напишут в чат поддержки, они появятся здесь.
              </div>
            ) : (
              messages.map(m => (
                <div
                  key={m.id}
                  className={`rounded-2xl border p-4 transition-all ${
                    !m.isRead && m.userId !== 'system'
                      ? 'border-blue-300 bg-blue-50/40'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{m.userName}</span>
                      <span className="text-[11px] text-slate-500">({m.userEmail})</span>
                      {!m.isRead && m.userId !== 'system' && (
                        <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                          Новое
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(m.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-800 border border-slate-100">
                    {m.message}
                  </div>

                  {m.reply ? (
                    <div className="mt-2.5 rounded-xl bg-emerald-50 p-2.5 text-xs text-emerald-800 border border-emerald-100">
                      <span className="font-semibold">Ваш ответ: </span>
                      {m.reply}
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="text"
                        value={replyTextMap[m.id] || ''}
                        onChange={e => setReplyTextMap({ ...replyTextMap, [m.id]: e.target.value })}
                        placeholder="Напишите ответ пользователю..."
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleReplyMessage(m.id)}
                        className="flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-2xs"
                      >
                        <Send className="h-3 w-3" />
                        <span>Ответить</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
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
