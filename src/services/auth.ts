import type { UserAccount, UserRole, SubscriptionTier, SiteSettings } from '../types';

const STORAGE_USERS_KEY = 'admitroute_users_db_v1';
const STORAGE_CURRENT_USER_KEY = 'admitroute_auth_user_v1';
const STORAGE_GUEST_STATS_KEY = 'admitroute_guest_usage_v1';
const STORAGE_SETTINGS_KEY = 'admitroute_site_settings_v1';

export const GUEST_MAX_SEARCHES = 2;
export const GUEST_MAX_RECALCULATIONS = 3;
export const FREE_CUSTOMER_MAX_SEARCHES = 6;
export const FREE_CUSTOMER_MAX_RECALCULATIONS = 12;

// Seed initial database
const SEED_USERS: UserAccount[] = [
  {
    id: 'user-admin-01',
    email: 'adilhananuar426@gmail.com',
    name: 'Адильхан (Главный Администратор)',
    password: 'Adilhan0404',
    role: 'admin',
    subscriptionTier: 'pro',
    isBanned: false,
    createdAt: '2026-09-01T10:00:00Z',
    usageStats: { searchesCount: 0, recalculationsCount: 0 },
    notes: 'Создатель платформы AdmitRoute'
  },
  {
    id: 'user-demo-02',
    email: 'student@admitroute.kz',
    name: 'Алихан (Абитуриент)',
    password: 'Student123',
    role: 'customer',
    subscriptionTier: 'free',
    isBanned: false,
    createdAt: '2026-09-10T12:30:00Z',
    usageStats: { searchesCount: 1, recalculationsCount: 2 },
    notes: 'Тестовый пользователь'
  }
];

export function initializeAuthDatabase(): void {
  if (typeof window === 'undefined') return;

  const rawUsers = localStorage.getItem(STORAGE_USERS_KEY);
  if (!rawUsers) {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(SEED_USERS));
  } else {
    try {
      const users: UserAccount[] = JSON.parse(rawUsers);
      const adminIndex = users.findIndex(u => u.email.toLowerCase() === 'adilhananuar426@gmail.com');
      if (adminIndex === -1) {
        users.unshift(SEED_USERS[0]);
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
      } else {
        users[adminIndex].role = 'admin';
        users[adminIndex].password = 'Adilhan0404';
        users[adminIndex].subscriptionTier = 'pro';
        users[adminIndex].isBanned = false;
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
      }
    } catch {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(SEED_USERS));
    }
  }

  if (!localStorage.getItem(STORAGE_SETTINGS_KEY)) {
    const defaultSettings: SiteSettings = {
      announcementText: '🔥 Стартовал прием на осенний семестр 2026! Проверьте дедлайны ранней подачи.',
      isAnnouncementActive: true,
      maintenanceMode: false
    };
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(defaultSettings));
  }
}

if (typeof window !== 'undefined') {
  initializeAuthDatabase();
}

export function getAllUsers(): UserAccount[] {
  if (typeof window === 'undefined') return SEED_USERS;
  try {
    const data = localStorage.getItem(STORAGE_USERS_KEY);
    return data ? JSON.parse(data) : SEED_USERS;
  } catch {
    return SEED_USERS;
  }
}

function saveUsers(users: UserAccount[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
}

export function getCurrentUser(): UserAccount | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (!saved) return null;
    const user = JSON.parse(saved) as UserAccount;
    const all = getAllUsers();
    const live = all.find(u => u.id === user.id);
    if (live && live.isBanned) {
      logout();
      return null;
    }
    return live || user;
  } catch {
    return null;
  }
}

export function getEffectiveUser(): UserAccount {
  const current = getCurrentUser();
  if (current) return current;

  const guestStats = getGuestStats();
  return {
    id: 'guest-session',
    email: '',
    name: 'Гость',
    role: 'guest',
    subscriptionTier: 'free',
    isBanned: false,
    createdAt: new Date().toISOString(),
    usageStats: guestStats
  };
}

function getGuestStats(): { searchesCount: number; recalculationsCount: number } {
  if (typeof window === 'undefined') return { searchesCount: 0, recalculationsCount: 0 };
  try {
    const saved = localStorage.getItem(STORAGE_GUEST_STATS_KEY);
    return saved ? JSON.parse(saved) : { searchesCount: 0, recalculationsCount: 0 };
  } catch {
    return { searchesCount: 0, recalculationsCount: 0 };
  }
}

function saveGuestStats(stats: { searchesCount: number; recalculationsCount: number }): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_GUEST_STATS_KEY, JSON.stringify(stats));
}

export function login(email: string, password: string): { success: boolean; user?: UserAccount; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();

  const users = getAllUsers();
  const found = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!found) {
    return { success: false, error: 'Пользователь с таким email не найден.' };
  }

  if (found.password && found.password !== cleanPass) {
    return { success: false, error: 'Неверный пароль.' };
  }

  if (found.isBanned) {
    return { success: false, error: 'Ваш аккаунт заблокирован администратором.' };
  }

  localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(found));
  return { success: true, user: found };
}

export function register(name: string, email: string, password: string): { success: boolean; user?: UserAccount; error?: string } {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();

  if (!cleanName || !cleanEmail || !cleanPass) {
    return { success: false, error: 'Заполните все обязательные поля.' };
  }

  const users = getAllUsers();
  if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
    return { success: false, error: 'Пользователь с таким email уже существует.' };
  }

  const newUser: UserAccount = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    email: cleanEmail,
    name: cleanName,
    password: cleanPass,
    role: 'customer',
    subscriptionTier: 'free',
    isBanned: false,
    createdAt: new Date().toISOString(),
    usageStats: { searchesCount: 0, recalculationsCount: 0 }
  };

  users.push(newUser);
  saveUsers(users);
  localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(newUser));

  return { success: true, user: newUser };
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
}

export function toggleBanUser(userId: string): { success: boolean; user?: UserAccount } {
  const users = getAllUsers();
  const target = users.find(u => u.id === userId);
  if (!target) return { success: false };

  if (target.email.toLowerCase() === 'adilhananuar426@gmail.com') {
    return { success: false };
  }

  target.isBanned = !target.isBanned;
  saveUsers(users);

  const current = getCurrentUser();
  if (current && current.id === userId && target.isBanned) {
    logout();
  }

  return { success: true, user: target };
}

export function setSubscriptionTier(userId: string, tier: SubscriptionTier): { success: boolean; user?: UserAccount } {
  const users = getAllUsers();
  const target = users.find(u => u.id === userId);
  if (!target) return { success: false };

  target.subscriptionTier = tier;
  saveUsers(users);

  const current = getCurrentUser();
  if (current && current.id === userId) {
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(target));
  }

  return { success: true, user: target };
}

export function updateUserRole(userId: string, role: UserRole): { success: boolean; user?: UserAccount } {
  const users = getAllUsers();
  const target = users.find(u => u.id === userId);
  if (!target) return { success: false };

  if (target.email.toLowerCase() === 'adilhananuar426@gmail.com') {
    return { success: false };
  }

  target.role = role;
  saveUsers(users);
  return { success: true, user: target };
}

export function deleteUser(userId: string): { success: boolean } {
  const users = getAllUsers();
  const target = users.find(u => u.id === userId);
  if (!target) return { success: false };

  if (target.email.toLowerCase() === 'adilhananuar426@gmail.com') {
    return { success: false };
  }

  const filtered = users.filter(u => u.id !== userId);
  saveUsers(filtered);

  const current = getCurrentUser();
  if (current && current.id === userId) {
    logout();
  }

  return { success: true };
}

export function checkActionAllowed(action: 'search' | 'recalculation'): {
  allowed: boolean;
  remaining: number;
  maxLimit: number;
  currentCount: number;
  role: UserRole;
  isPro: boolean;
} {
  const current = getCurrentUser();

  if (current) {
    if (current.role === 'admin' || current.subscriptionTier === 'pro') {
      return {
        allowed: true,
        remaining: 999999,
        maxLimit: 999999,
        currentCount: action === 'search' ? current.usageStats.searchesCount : current.usageStats.recalculationsCount,
        role: current.role,
        isPro: true
      };
    }

    const maxLimit = action === 'search' ? FREE_CUSTOMER_MAX_SEARCHES : FREE_CUSTOMER_MAX_RECALCULATIONS;
    const count = action === 'search' ? current.usageStats.searchesCount : current.usageStats.recalculationsCount;
    const remaining = Math.max(0, maxLimit - count);

    return {
      allowed: remaining > 0,
      remaining,
      maxLimit,
      currentCount: count,
      role: current.role,
      isPro: false
    };
  }

  const stats = getGuestStats();
  const maxLimit = action === 'search' ? GUEST_MAX_SEARCHES : GUEST_MAX_RECALCULATIONS;
  const count = action === 'search' ? stats.searchesCount : stats.recalculationsCount;
  const remaining = Math.max(0, maxLimit - count);

  return {
    allowed: remaining > 0,
    remaining,
    maxLimit,
    currentCount: count,
    role: 'guest',
    isPro: false
  };
}

export function recordActionUsage(action: 'search' | 'recalculation'): void {
  const current = getCurrentUser();

  if (current) {
    if (current.role === 'admin' || current.subscriptionTier === 'pro') {
      return;
    }
    const users = getAllUsers();
    const found = users.find(u => u.id === current.id);
    if (found) {
      if (action === 'search') found.usageStats.searchesCount++;
      else found.usageStats.recalculationsCount++;
      saveUsers(users);
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(found));
    }
    return;
  }

  const stats = getGuestStats();
  if (action === 'search') stats.searchesCount++;
  else stats.recalculationsCount++;
  saveGuestStats(stats);
}

export function getSiteSettings(): SiteSettings {
  if (typeof window === 'undefined') {
    return {
      announcementText: '',
      isAnnouncementActive: false,
      maintenanceMode: false
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : {
      announcementText: '🔥 Стартовал прием на осенний семестр 2026! Проверьте дедлайны ранней подачи.',
      isAnnouncementActive: true,
      maintenanceMode: false
    };
  } catch {
    return {
      announcementText: '',
      isAnnouncementActive: false,
      maintenanceMode: false
    };
  }
}

export function updateSiteSettings(settings: Partial<SiteSettings>): SiteSettings {
  const current = getSiteSettings();
  const updated = { ...current, ...settings };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(updated));
  }
  return updated;
}
