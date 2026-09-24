import type {
  ApplicationTracker,
  PostSubmissionChecklistItem,
  TelegramSettings,
  UserAccount
} from '../types';
function getStoredSessionToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('admitroute_auth_token_v1') || '';
}

export const BADGE_DEFINITIONS: Record<string, { title: string; icon: string; description: string }> = {
  profile_started: {
    title: 'Первый шаг',
    icon: '🌱',
    description: 'Регистрация на платформе AdmitRoute'
  },
  profile_completed: {
    title: 'Полный профиль',
    icon: '🎯',
    description: 'Все данные профиля и баллов заполнены'
  },
  first_program_selected: {
    title: 'Ориентир задан',
    icon: '🏛️',
    description: 'Добавлена первая программа в список поступления'
  },
  first_application_submitted: {
    title: 'Заявка отправлена',
    icon: '🚀',
    description: 'Первая официальная подача документов'
  },
  all_applications_submitted: {
    title: 'Финишная прямая',
    icon: '🎓',
    description: 'Все запланированные вузы поданы'
  },
  streak_7_days: {
    title: 'Недельный стрик',
    icon: '🔥',
    description: '7 дней регулярной подготовки подряд'
  }
};

export const DEFAULT_POST_SUBMISSION_CHECKLIST: PostSubmissionChecklistItem[] = [
  {
    id: 'post-1',
    title: 'Получение и проверка офферов',
    category: 'enrollment',
    description: 'Проверьте портал абитуриента, условия зачисления и подтвердите оффер до дедлайна.',
    completed: false,
    deadline: '15 мая'
  },
  {
    id: 'post-2',
    title: 'Оплата депозита за обучение / место',
    category: 'enrollment',
    description: 'Внесите вступительный депозит для бронирования места на курсе.',
    completed: false,
    deadline: '1 июня'
  },
  {
    id: 'post-3',
    title: 'Заявка на студенческое общежитие',
    category: 'housing',
    description: 'Подайте заявку на комнату в общежитии или забронируйте студенческие апартаменты.',
    completed: false,
    deadline: '15 июня'
  },
  {
    id: 'post-4',
    title: 'Оформление студенческой визы (I-20 / CAS)',
    category: 'visa',
    description: 'Получите форму зачисления от вуза, оплатите визовые сборы и запишитесь на интервью в консульство.',
    completed: false,
    deadline: '1 июля'
  },
  {
    id: 'post-5',
    title: 'Медицинская комиссия и справка 075/у',
    category: 'medical',
    description: 'Пройдите флюорографию, вакцинацию и переведите медсправки на английский язык.',
    completed: false,
    deadline: '20 июля'
  },
  {
    id: 'post-6',
    title: 'Покупка авиабилетов и предпосадочный чек-лист',
    category: 'logistics',
    description: 'Купите билеты, оформите международную сим-карту и карту UnionPay/Visa.',
    completed: false,
    deadline: '15 августа'
  }
];

function getAuthHeaders(): HeadersInit {
  const token = getStoredSessionToken();
  let userId = '';
  let userEmail = '';
  if (typeof window !== 'undefined') {
    try {
      const uStr = localStorage.getItem('admitroute_auth_user_v1');
      if (uStr) {
        const u = JSON.parse(uStr);
        userId = u.id || '';
        userEmail = u.email || '';
      }
    } catch {}
  }
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(userId ? { 'x-user-id': userId } : {}),
    ...(userEmail ? { 'x-user-email': userEmail } : {})
  };
}

// 1. Check if profile is stale (older than 60 days)
export function checkProfileStaleness(user?: UserAccount | null): { isStale: boolean; daysSinceUpdate: number } {
  if (!user) return { isStale: false, daysSinceUpdate: 0 };
  const lastUpdated = user.profileLastUpdatedAt ? new Date(user.profileLastUpdatedAt) : new Date(user.createdAt || Date.now());
  const now = new Date();
  const diffDays = Math.round((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
  return {
    isStale: diffDays >= 60,
    daysSinceUpdate: diffDays
  };
}

// 2. Applications Tracker API Client
export async function fetchUserApplications(): Promise<ApplicationTracker[]> {
  try {
    const res = await fetch('/api/applications', {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.applications || [];
  } catch (err) {
    console.warn('[Fetch Applications warn]:', err);
    return [];
  }
}

export async function updateApplicationStage(params: {
  programId: string;
  programName: string;
  country?: string;
  stageKey: string;
  status: string;
  notes?: string;
  date?: string;
}): Promise<{ success: boolean; application?: ApplicationTracker; newBadgeEarned?: string | null }> {
  try {
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params)
    });
    if (!res.ok) return { success: false };
    return await res.json();
  } catch (err) {
    console.error('[Update Application Stage err]:', err);
    return { success: false };
  }
}

// 3. Telegram Connect API Client
export async function getTelegramStatus(): Promise<{
  isConnected: boolean;
  telegramChatId: string | null;
  botUsername: string;
  settings: TelegramSettings;
}> {
  const defaultBot = (import.meta.env.VITE_TELEGRAM_BOT_USERNAME as string) || 'admitroute_kz_bot';
  let localChatId: string | null = null;
  let localSettings: TelegramSettings = {
    notifyDeadlines: true,
    notifyDigest: true,
    notifyStaleProfile: true,
    notifyAchievements: true
  };

  if (typeof window !== 'undefined') {
    try {
      const uStr = localStorage.getItem('admitroute_auth_user_v1');
      if (uStr) {
        const u = JSON.parse(uStr);
        if (u.telegramChatId) localChatId = String(u.telegramChatId);
        if (u.telegramSettings) localSettings = { ...localSettings, ...u.telegramSettings };
      }
    } catch {}
  }

  try {
    const res = await fetch('/api/telegram/connect', {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      return {
        isConnected: data.isConnected || !!localChatId,
        telegramChatId: data.telegramChatId || (localChatId ? '••••' + localChatId.slice(-4) : null),
        botUsername: data.botUsername || defaultBot,
        settings: data.settings || localSettings
      };
    }
  } catch {}

  return {
    isConnected: !!localChatId,
    telegramChatId: localChatId ? '••••' + localChatId.slice(-4) : null,
    botUsername: defaultBot,
    settings: localSettings
  };
}

export async function generateTelegramLinkCode(): Promise<{
  success: boolean;
  code?: string;
  deepLink?: string;
  botUsername?: string;
  expiresAt?: string;
}> {
  const botUser = (import.meta.env.VITE_TELEGRAM_BOT_USERNAME as string) || 'admitroute_kz_bot';

  // 1. Try to obtain link code from serverless backend (Neon PostgreSQL)
  try {
    const res = await fetch('/api/telegram/connect', {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.code && data.deepLink) {
        return data;
      }
    }
  } catch (err) {
    console.warn('[Telegram Connect API error, using client fallback]:', err);
  }

  // 2. Guaranteed fallback: generate instantaneous link code
  const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
  const code = `AR${randomHex}`;
  const deepLink = `https://t.me/${botUser}?start=${code}`;
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  // Save to current user locally
  if (typeof window !== 'undefined') {
    try {
      const uStr = localStorage.getItem('admitroute_auth_user_v1');
      if (uStr) {
        const user = JSON.parse(uStr);
        user.telegramLinkCode = code;
        user.telegramLinkExpiresAt = expiresAt;
        localStorage.setItem('admitroute_auth_user_v1', JSON.stringify(user));

        const allUsersStr = localStorage.getItem('admitroute_users_db_v1');
        if (allUsersStr) {
          const allUsers = JSON.parse(allUsersStr);
          const idx = allUsers.findIndex((u: any) => u.id === user.id);
          if (idx !== -1) {
            allUsers[idx].telegramLinkCode = code;
            allUsers[idx].telegramLinkExpiresAt = expiresAt;
            localStorage.setItem('admitroute_users_db_v1', JSON.stringify(allUsers));
          }
        }
      }
    } catch {}
  }

  return {
    success: true,
    code,
    deepLink,
    botUsername: botUser,
    expiresAt
  };
}

export async function updateTelegramSettings(settings: Partial<TelegramSettings>): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      const uStr = localStorage.getItem('admitroute_auth_user_v1');
      if (uStr) {
        const user = JSON.parse(uStr);
        user.telegramSettings = { ...(user.telegramSettings || {}), ...settings };
        localStorage.setItem('admitroute_auth_user_v1', JSON.stringify(user));
      }
    } catch {}
  }

  try {
    const res = await fetch('/api/telegram/connect?action=update_settings', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings)
    });
    return res.ok;
  } catch {
    return true;
  }
}

export async function disconnectTelegram(): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      const uStr = localStorage.getItem('admitroute_auth_user_v1');
      let userId = '';
      if (uStr) {
        const user = JSON.parse(uStr);
        userId = user.id || '';
        user.telegramChatId = null;
        user.telegramLinkCode = null;
        localStorage.setItem('admitroute_auth_user_v1', JSON.stringify(user));
      }
      const allUsersStr = localStorage.getItem('admitroute_users_db_v1');
      if (allUsersStr && userId) {
        const allUsers = JSON.parse(allUsersStr);
        const idx = allUsers.findIndex((u: any) => u.id === userId);
        if (idx !== -1) {
          allUsers[idx].telegramChatId = null;
          allUsers[idx].telegramLinkCode = null;
          localStorage.setItem('admitroute_users_db_v1', JSON.stringify(allUsers));
        }
      }
    } catch {}
  }

  try {
    const res = await fetch('/api/telegram/connect?action=disconnect', {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.ok;
  } catch {
    return true;
  }
}

// 4. Share Token API Client (Parent/Mentor read-only)
export async function getShareLinkStatus(): Promise<{
  hasActiveLink: boolean;
  token?: string;
  shareUrl?: string;
}> {
  try {
    const res = await fetch('/api/share?action=status', {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!res.ok) return { hasActiveLink: false };
    return await res.json();
  } catch {
    return { hasActiveLink: false };
  }
}

export async function createShareLink(): Promise<{ success: boolean; shareUrl?: string; token?: string }> {
  try {
    const res = await fetch('/api/share?action=create', {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch {
    return { success: false };
  }
}

export async function revokeShareLink(): Promise<boolean> {
  try {
    const res = await fetch('/api/share?action=revoke', {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchPublicSharedData(token: string): Promise<any | null> {
  try {
    const res = await fetch(`/api/share?token=${encodeURIComponent(token)}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

// 5. Email Verification API Client
export async function verifyEmailCode(code: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/auth?action=verify-email', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ code })
    });
    const json = await res.json();
    if (!res.ok) {
      return { success: false, error: json.error || 'Ошибка проверки кода' };
    }
    return { success: true };
  } catch {
    return { success: false, error: 'Сетевая ошибка' };
  }
}
