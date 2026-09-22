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
  CreditCard,
  Crown,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Check,
  GraduationCap,
  Key
} from 'lucide-react';
import {
  getAllUsers,
  toggleBanUser,
  setSubscriptionTier,
  deleteUser,
  getSiteSettings,
  updateSiteSettings,
  toggleAdminRole,
  isSuperAdmin,
  purgeAllFakeUsers,
  SUPER_ADMIN_EMAIL
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
  initialTab?: 'users' | 'messages' | 'settings';
  initialThreadId?: string;
}

const GRADE_LABELS: Record<string, string> = {
  grade_9: '9 класс',
  grade_10: '10 класс',
  grade_11: '11 класс (Выпускной)',
  graduate: 'Выпускник школы / Gap Year',
  gap_year: 'Выпускник школы / Gap Year',
  college: 'Студент колледжа',
  bachelor_grad: 'Выпускник бакалавриата'
};

const FIELD_LABELS: Record<string, string> = {
  cs_it: 'Компьютерные науки и IT / AI',
  engineering: 'Инженерия и Робототехника',
  business_econ: 'Бизнес, Финансы и Экономика',
  medicine_bio: 'Медицина и Биология',
  medicine: 'Медицина и Здравоохранение',
  design_media: 'Дизайн, Архитектура и Медиа',
  social_law: 'Право и Социальные науки',
  law: 'Международное право',
  humanities: 'Гуманитарные науки'
};

const REGION_LABELS: Record<string, string> = {
  kazakhstan: 'Казахстан (НУ, МУИТ, КБТУ, СДУ, КИМЭП)',
  europe: 'Европа (Германия, Италия, Венгрия, Чехия)',
  usa: 'США и Канада (Top-100, Ivy League)',
  usa_canada: 'США и Канада (Top-100, Ivy League)',
  asia: 'Азия (Гонконг, Южная Корея, Сингапур)',
  cis: 'СНГ (Россия, Узбекистан)'
};

const BUDGET_LABELS: Record<string, string> = {
  full_grant: '100% Грант / Стипендия (Need/Merit-based)',
  scholarship_needed: '100% Грант / Стипендия (Need/Merit-based)',
  low_cost: 'До $5,000 в год (частичная оплата)',
  under_5k: 'До $5,000 в год (частичная оплата)',
  mid_cost: 'До $15,000 в год (средний бюджет)',
  under_15k: 'До $15,000 в год (средний бюджет)',
  any: 'Без ограничений (самофинансирование)',
  no_limit: 'Без ограничений (самофинансирование)'
};

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialTab = 'users',
  initialThreadId
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'messages' | 'settings'>(initialTab);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [threadSummaries, setThreadSummaries] = useState<ChatThreadSummary[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(initialThreadId || null);
  const [activeThreadMessages, setActiveThreadMessages] = useState<ChatMessage[]>([]);
  const [adminReplyInput, setAdminReplyInput] = useState('');
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(getSiteSettings());
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [selectedUserForView, setSelectedUserForView] = useState<UserAccount | null>(null);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadData = () => {
    const all = getAllUsers();
    setUsers(all);
    const summaries = getAllThreadSummaries();
    setThreadSummaries(summaries);
    setSiteSettings(getSiteSettings());

    // Keep selected user view in sync if open
    if (selectedUserForView) {
      const refreshed = all.find(u => u.id === selectedUserForView.id);
      if (refreshed) {
        setSelectedUserForView(refreshed);
      }
    }

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
      if (initialTab) {
        setActiveTab(initialTab);
      }
      if (initialThreadId) {
        setSelectedThreadId(initialThreadId);
      }
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialTab, initialThreadId]);

  useEffect(() => {
    const handleLiveSync = () => {
      loadData();
    };

    window.addEventListener('admitroute_chat_update', handleLiveSync);
    window.addEventListener('storage', handleLiveSync);

    return () => {
      window.removeEventListener('admitroute_chat_update', handleLiveSync);
      window.removeEventListener('storage', handleLiveSync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedThreadId, selectedUserForView?.id]);

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
  if (currentUser.role !== 'admin' && currentUser.email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
          <Ban className="mx-auto h-12 w-12 text-rose-600 mb-3" />
          <h3 className="text-lg font-bold text-slate-900">Доступ ограничен</h3>
          <p className="mt-1 text-xs text-slate-600">
            Данный раздел предназначен исключительно для администратора ({SUPER_ADMIN_EMAIL}).
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

  const handleCopy = (text: string, key: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleTogglePasswordVisibility = (userId: string) => {
    setShowPasswordMap(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
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

  const handleToggleAdminRole = (userId: string, currentRole: string, userName: string) => {
    const isTargetAdmin = currentRole === 'admin';
    const confirmMessage = isTargetAdmin
      ? `Отозвать статус администратора у пользователя ${userName}?`
      : `Назначить пользователя ${userName} Администратором сервиса с доступом к админ-панели?`;

    if (window.confirm(confirmMessage)) {
      const res = toggleAdminRole(userId);
      if (res.success) {
        loadData();
        showNotification(res.message);
      } else {
        alert(res.message);
      }
    }
  };

  const handleOpenChatWithUser = (userId: string) => {
    setSelectedThreadId(userId);
    setActiveTab('messages');
    setSelectedUserForView(null);
    setActiveThreadMessages(getThreadMessages(userId));
    markThreadReadByAdmin(userId);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handlePurgeFakeUsers = () => {
    const refreshed = purgeAllFakeUsers();
    setUsers(refreshed);
    loadData();
    showNotification(`База очищена! Реальных пользователей: ${refreshed.length}`);
  };

  const handleSendAdminReply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedThreadId || !adminReplyInput.trim()) return;

    sendAdminReply(
      selectedThreadId,
      adminReplyInput.trim(),
      currentUser.name || 'Адильхан (Основатель)',
      currentUser.email || SUPER_ADMIN_EMAIL
    );
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

  const currentThreadSummary =
    threadSummaries.find(t => t.threadId === selectedThreadId) ||
    (() => {
      const u = users.find(user => user.id === selectedThreadId);
      if (u) {
        return {
          threadId: u.id,
          userName: u.name,
          userEmail: u.email,
          lastMessage: 'Новый диалог',
          lastMessageAt: new Date().toISOString(),
          unreadCountForAdmin: 0,
          isPro: u.subscriptionTier === 'pro',
          hasPaymentRequest: false
        };
      }
      return null;
    })();

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
                Управление пользователями, просмотр анкет, выдача PRO и живой чат поддержки
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
              <div className="flex items-center gap-3">
                <div className="text-xs text-slate-500">
                  Всего: <strong className="font-bold text-slate-800">{users.length}</strong> пользователей (PRO: {totalPro})
                </div>
                <button
                  type="button"
                  onClick={handlePurgeFakeUsers}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-blue-600 transition-colors"
                  title="Очистить базу от всех демо-пользователей и обновить список"
                >
                  <Users className="h-3.5 w-3.5 text-blue-600" />
                  <span>Обновить / Очистить от фейков</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="sticky top-0 border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5">Пользователь</th>
                    <th className="px-4 py-2.5">Академический профиль</th>
                    <th className="px-4 py-2.5">Роль</th>
                    <th className="px-4 py-2.5">Подписка</th>
                    <th className="px-4 py-2.5">Поисков / Расчетов</th>
                    <th className="px-4 py-2.5">Статус</th>
                    <th className="px-4 py-2.5 text-right">Действия админа</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(u => {
                    const isSuperAccount = u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
                    const currentIsSuper = isSuperAdmin(currentUser);
                    const hasProfile = !!u.profile;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-2.5">
                          <button
                            type="button"
                            onClick={() => setSelectedUserForView(u)}
                            className="text-left font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                          >
                            {u.name}
                          </button>
                          <div className="text-[11px] text-slate-500">{u.email}</div>
                        </td>

                        <td className="px-4 py-2.5">
                          {hasProfile ? (
                            <button
                              type="button"
                              onClick={() => setSelectedUserForView(u)}
                              className="text-left group"
                            >
                              <div className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-800 group-hover:bg-blue-100">
                                <GraduationCap className="h-3 w-3 text-blue-600" />
                                <span>{GRADE_LABELS[u.profile!.grade] || u.profile!.grade}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                GPA: {u.profile!.gpa} • {u.profile!.languageScore || 'Языковой тест не указан'}
                              </div>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Анкета не заполнена
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-2.5">
                          {isSuperAccount ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                              <Crown className="h-3 w-3 text-amber-600" />
                              <span>Супер-Админ</span>
                            </span>
                          ) : u.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-purple-100 text-purple-800 px-2 py-0.5 text-[11px] font-semibold">
                              <ShieldCheck className="h-3 w-3 text-purple-600" />
                              <span>Администратор</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 text-slate-700 px-2 py-0.5 text-[11px] font-medium">
                              <span>🎓 Студент</span>
                            </span>
                          )}
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
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* Detailed View Button */}
                            <button
                              type="button"
                              onClick={() => setSelectedUserForView(u)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                              title="Просмотреть профиль, анкету и пароль"
                            >
                              <Eye className="h-3 w-3 text-blue-600" />
                              <span>Просмотр</span>
                            </button>

                            {/* Direct Chat Button (non-admin) */}
                            {!isSuperAccount && (
                              <button
                                type="button"
                                onClick={() => handleOpenChatWithUser(u.id)}
                                className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors shadow-2xs"
                                title="Написать пользователю в чат"
                              >
                                <MessageSquare className="h-3 w-3 text-blue-600" />
                                <span>Чат</span>
                              </button>
                            )}

                            {/* Super admin toggle */}
                            {!isSuperAccount && currentIsSuper && (
                              u.role === 'admin' ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggleAdminRole(u.id, u.role, u.name)}
                                  className="rounded-lg border border-purple-200 bg-purple-50 px-2 py-1 text-[11px] font-semibold text-purple-700 hover:bg-purple-100 transition-colors"
                                  title="Отозвать права администратора"
                                >
                                  Снять админку
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleToggleAdminRole(u.id, u.role, u.name)}
                                  className="rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-800 hover:bg-amber-100 transition-colors shadow-2xs"
                                  title="Выдать права администратора"
                                >
                                  + Админка
                                </button>
                              )
                            )}

                            {/* PRO Toggle */}
                            {!isSuperAccount && (
                              u.subscriptionTier === 'pro' ? (
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
                                  className="rounded-lg bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-blue-700 shadow-2xs"
                                >
                                  + PRO
                                </button>
                              )
                            )}

                            {/* Ban Toggle */}
                            {!isSuperAccount && (
                              <button
                                type="button"
                                onClick={() => handleToggleBan(u.id, u.isBanned)}
                                className={`rounded-lg px-2 py-1 text-[11px] font-medium ${
                                  u.isBanned
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                }`}
                              >
                                {u.isBanned ? 'Разбан' : 'Бан'}
                              </button>
                            )}

                            {/* Delete Button */}
                            {!isSuperAccount && (
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u.id, u.email)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                title="Удалить пользователя"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
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
            <div className="w-80 border-r border-slate-200 bg-slate-50/70 overflow-y-auto flex flex-col">
              <div className="p-3 border-b border-slate-200 bg-white font-semibold text-xs text-slate-800 flex items-center justify-between">
                <span>Диалоги пользователей ({threadSummaries.length})</span>
                {totalUnreadChat > 0 && (
                  <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white">
                    {totalUnreadChat} новых
                  </span>
                )}
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
                        <div className="font-semibold text-xs text-slate-900 truncate max-w-[170px]">
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
                {/* Conversation Header */}
                <div className="flex items-center justify-between border-b border-slate-200 p-3 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs">
                      {currentThreadSummary.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">{currentThreadSummary.userName}</h4>
                        <span className="text-[11px] text-slate-500 font-normal">({currentThreadSummary.userEmail})</span>
                        {currentThreadSummary.isPro ? (
                          <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                            ⭐ PRO
                          </span>
                        ) : (
                          <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                            FREE
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View User Profile Button */}
                    {(() => {
                      const matchedUser = users.find(u => u.id === selectedThreadId || u.email.toLowerCase() === currentThreadSummary.userEmail.toLowerCase());
                      if (matchedUser) {
                        return (
                          <button
                            type="button"
                            onClick={() => setSelectedUserForView(matchedUser)}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                          >
                            <Eye className="h-3.5 w-3.5 text-blue-600" />
                            <span>Анкета абитуриента</span>
                          </button>
                        );
                      }
                      return null;
                    })()}

                    {/* Quick PRO Activation Button */}
                    {!currentThreadSummary.isPro ? (
                      <button
                        type="button"
                        onClick={handleActivateProForSelectedThread}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:from-blue-700 hover:to-indigo-700 transition-all"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>⚡ Выдать PRO</span>
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>PRO активен</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                  {activeThreadMessages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center p-6 text-slate-500">
                      <MessageSquare className="h-10 w-10 text-slate-300 mb-2" />
                      <div className="text-xs font-bold text-slate-700">Переписка еще не начата</div>
                      <p className="text-[11px] text-slate-500 max-w-sm mt-1">
                        Пользователь <strong>{currentThreadSummary.userName}</strong> пока не отправлял сообщений. Напишите ему первым — ответ появится в его чате на сайте.
                      </p>
                    </div>
                  ) : (
                    activeThreadMessages.map(m => {
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
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendAdminReply} className="border-t border-slate-200 p-3 bg-white flex items-center gap-2">
                  <input
                    type="text"
                    value={adminReplyInput}
                    onChange={e => setAdminReplyInput(e.target.value)}
                    placeholder={`Напишите ответ пользователю ${currentThreadSummary.userName}...`}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!adminReplyInput.trim()}
                    className="flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-40 transition-colors shadow-2xs shrink-0"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Отправить</span>
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

        {/* Tab 3: Site Settings & Quotas */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="max-w-2xl space-y-6">
              {/* Guest Access Settings */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                    👤 Гостевой доступ (Guest)
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">Ограничения и права для неавторизованных гостей</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Управляйте лимитами пользователей, которые заходят на сайт без создания аккаунта.
                </p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Лимит AI-поисков для гостя:
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={siteSettings.guestMaxSearches}
                      onChange={e =>
                        setSiteSettings({ ...siteSettings, guestMaxSearches: Number(e.target.value) })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Лимит расчетов роадмапа:
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={siteSettings.guestMaxRecalculations}
                      onChange={e =>
                        setSiteSettings({ ...siteSettings, guestMaxRecalculations: Number(e.target.value) })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="allow-guest-chat"
                    checked={siteSettings.allowGuestChat}
                    onChange={e =>
                      setSiteSettings({ ...siteSettings, allowGuestChat: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="allow-guest-chat" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Разрешить гостям писать в онлайн-чат без регистрации
                  </label>
                </div>
              </div>

              {/* Free Customers Settings */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                    🎓 Зарегистрированные пользователи (Free)
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">Квоты для бесплатного тарифа</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Пользователи с подтвержденным аккаунтом на бесплатном тарифе.
                </p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Лимит поисков программ:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={siteSettings.freeCustomerMaxSearches}
                      onChange={e =>
                        setSiteSettings({ ...siteSettings, freeCustomerMaxSearches: Number(e.target.value) })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Лимит расчетов стратегии:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={siteSettings.freeCustomerMaxRecalculations}
                      onChange={e =>
                        setSiteSettings({ ...siteSettings, freeCustomerMaxRecalculations: Number(e.target.value) })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Global Announcement Banner */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                    📢 Глобальное объявление
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">Верхний информационный баннер для всех посетителей</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Текст отображается в верхней части экрана над шапкой платформы.
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
                  <label htmlFor="banner-toggle" className="text-xs font-semibold text-slate-700 cursor-pointer">
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

              <div className="pt-2 flex items-center justify-between">
                <p className="text-[11px] text-slate-400">
                  Все изменения сохраняются в базу данных платформы и применяются мгновенно.
                </p>
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs transition-colors shrink-0"
                >
                  Сохранить настройки платформы
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* USER DETAILS INSPECTION DOSSIER (Full Inspector inside the Panel) */}
        {/* ========================================================================= */}
        {selectedUserForView && (
          <div className="absolute inset-0 z-40 flex flex-col bg-white overflow-hidden animate-in fade-in duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 font-bold text-base text-white shadow-xs">
                  {selectedUserForView.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-white">{selectedUserForView.name}</h3>
                    {selectedUserForView.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ? (
                      <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                        Супер-Админ
                      </span>
                    ) : selectedUserForView.role === 'admin' ? (
                      <span className="rounded-md bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                        Администратор
                      </span>
                    ) : (
                      <span className="rounded-md bg-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                        Студент
                      </span>
                    )}
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      selectedUserForView.subscriptionTier === 'pro'
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {selectedUserForView.subscriptionTier === 'pro' ? '⭐ PRO' : 'FREE'}
                    </span>
                    {selectedUserForView.isBanned && (
                      <span className="rounded-md bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                        Заблокирован
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>{selectedUserForView.email}</span>
                    <span>•</span>
                    <span>ID: <code className="font-mono text-[11px] text-slate-300">{selectedUserForView.id}</code></span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForView(null)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                title="Вернуться к списку пользователей"
              >
                <span>✕ Назад к списку</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/40">
              {/* Account Security & Stats Box */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <Key className="h-4 w-4 text-blue-600" />
                  <span>Данные аккаунта и безопасность</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                    <div className="text-[11px] text-slate-500 mb-0.5">Email аккаунта</div>
                    <div className="flex items-center justify-between font-medium text-slate-900">
                      <span>{selectedUserForView.email}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedUserForView.email, 'email')}
                        className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                        title="Скопировать email"
                      >
                        {copiedKey === 'email' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                    <div className="text-[11px] text-slate-500 mb-0.5">Пароль учетной записи</div>
                    <div className="flex items-center justify-between font-mono font-medium text-slate-900">
                      <span>
                        {showPasswordMap[selectedUserForView.id]
                          ? selectedUserForView.password || '—'
                          : '••••••••••••'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleTogglePasswordVisibility(selectedUserForView.id)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                          title={showPasswordMap[selectedUserForView.id] ? 'Скрыть пароль' : 'Показать пароль'}
                        >
                          {showPasswordMap[selectedUserForView.id] ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </button>
                        {selectedUserForView.password && (
                          <button
                            type="button"
                            onClick={() => handleCopy(selectedUserForView.password!, 'pwd')}
                            className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                            title="Скопировать пароль"
                          >
                            {copiedKey === 'pwd' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                    <div className="text-[11px] text-slate-500 mb-0.5">Дата регистрации</div>
                    <div className="font-medium text-slate-900">
                      {new Date(selectedUserForView.createdAt).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                    <div className="text-[11px] text-slate-500 mb-0.5">Статистика активности</div>
                    <div className="font-semibold text-slate-800">
                      {selectedUserForView.usageStats?.searchesCount ?? 0} поисков • {selectedUserForView.usageStats?.recalculationsCount ?? 0} расчетов
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Profile Section */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-blue-600" />
                    <span>Академический профиль абитуриента</span>
                  </h4>
                  {selectedUserForView.profile ? (
                    <span className="rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                      ✓ Анкета заполнена
                    </span>
                  ) : (
                    <span className="rounded-md bg-slate-100 text-slate-500 px-2 py-0.5 text-[10px] font-medium">
                      Не заполнена
                    </span>
                  )}
                </div>

                {selectedUserForView.profile ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Класс / Уровень</span>
                        <span className="font-bold text-slate-900 mt-0.5 block">
                          {GRADE_LABELS[selectedUserForView.profile.grade] || selectedUserForView.profile.grade}
                        </span>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Средний балл (GPA)</span>
                        <span className="font-bold text-blue-700 mt-0.5 block text-sm">
                          {selectedUserForView.profile.gpa} / {selectedUserForView.profile.gpaScale || '5.0'}
                        </span>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Год поступления</span>
                        <span className="font-bold text-slate-900 mt-0.5 block">
                          {selectedUserForView.profile.targetYear || '2026'}
                        </span>
                      </div>

                      <div className="col-span-2 sm:col-span-3 rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Направление обучения</span>
                        <span className="font-semibold text-slate-900 mt-0.5 block">
                          {FIELD_LABELS[selectedUserForView.profile.field] || selectedUserForView.profile.field}
                        </span>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Языковой экзамен</span>
                        <span className="font-semibold text-slate-900 mt-0.5 block">
                          {selectedUserForView.profile.hasLanguageTest
                            ? selectedUserForView.profile.languageScore || 'Сдан'
                            : 'Не сдавался'}
                        </span>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Экзамены (ЕНТ / SAT)</span>
                        <span className="font-semibold text-slate-900 mt-0.5 block">
                          {selectedUserForView.profile.satScore
                            ? (selectedUserForView.profile.stateExamScore || selectedUserForView.profile.satScore)
                            : (selectedUserForView.profile.hasStateExam
                                ? selectedUserForView.profile.stateExamScore || 'Сдан'
                                : 'Не сдавался')}
                        </span>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Желаемый регион</span>
                        <span className="font-semibold text-slate-900 mt-0.5 block truncate" title={REGION_LABELS[selectedUserForView.profile.targetRegion]}>
                          {REGION_LABELS[selectedUserForView.profile.targetRegion] || selectedUserForView.profile.targetRegion}
                        </span>
                      </div>

                      <div className="col-span-2 sm:col-span-3 rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Бюджет и финансирование</span>
                        <span className="font-semibold text-slate-900 mt-0.5 block">
                          {BUDGET_LABELS[selectedUserForView.profile.budget] || selectedUserForView.profile.budget}
                        </span>
                      </div>
                    </div>

                    {/* Portfolio / Extracurriculars */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <div className="text-[11px] font-semibold text-slate-700 mb-1">
                        Внеучебные достижения, олимпиады и портфолио:
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed italic bg-white p-2.5 rounded-lg border border-slate-200/60">
                        {selectedUserForView.profile.portfolioText || 'Пользователь не добавил описание внеучебных достижений.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center bg-slate-50">
                    <GraduationCap className="mx-auto h-8 w-8 text-slate-300 mb-1.5" />
                    <div className="text-xs font-bold text-slate-700">Анкета абитуриента еще не заполнена</div>
                    <p className="text-[11px] text-slate-500 max-w-md mx-auto mt-0.5">
                      Пользователь зарегистрировался, но еще не заполнял опросник подбора университетов на главной странице.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-3.5 flex items-center justify-between flex-wrap gap-2 shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                {selectedUserForView.email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase() && (
                  <button
                    type="button"
                    onClick={() => handleOpenChatWithUser(selectedUserForView.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Написать в чат</span>
                  </button>
                )}

                {selectedUserForView.email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase() && (
                  selectedUserForView.subscriptionTier === 'pro' ? (
                    <button
                      type="button"
                      onClick={() => handleSetSubscription(selectedUserForView.id, 'free')}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                    >
                      Снять PRO
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetSubscription(selectedUserForView.id, 'pro')}
                      className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-2 text-xs font-bold text-white shadow-2xs hover:from-amber-600 hover:to-amber-700 transition-all"
                    >
                      ⭐ Выдать PRO
                    </button>
                  )
                )}

                {selectedUserForView.email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase() && (
                  <button
                    type="button"
                    onClick={() => handleToggleBan(selectedUserForView.id, selectedUserForView.isBanned)}
                    className={`rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                      selectedUserForView.isBanned
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    {selectedUserForView.isBanned ? 'Разблокировать' : 'Заблокировать'}
                  </button>
                )}

                {selectedUserForView.email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase() && (
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteUser(selectedUserForView.id, selectedUserForView.email);
                      setSelectedUserForView(null);
                    }}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-colors"
                  >
                    Удалить
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedUserForView(null)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
