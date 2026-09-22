import type { UserAccount, UserRole, SubscriptionTier, SiteSettings, UserProfile } from '../types';

const STORAGE_USERS_KEY = 'admitroute_users_db_v1';
const STORAGE_CURRENT_USER_KEY = 'admitroute_auth_user_v1';
const STORAGE_GUEST_STATS_KEY = 'admitroute_guest_usage_v1';
const STORAGE_SETTINGS_KEY = 'admitroute_site_settings_v1';

export const GUEST_MAX_SEARCHES = 1;
export const GUEST_MAX_RECALCULATIONS = 2;
export const FREE_CUSTOMER_MAX_SEARCHES = 6;
export const FREE_CUSTOMER_MAX_RECALCULATIONS = 12;

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  announcementText: '🔥 Стартовал прием на осенний семестр 2026! Проверьте дедлайны ранней подачи.',
  isAnnouncementActive: true,
  maintenanceMode: false,
  guestMaxSearches: 2,
  guestMaxRecalculations: 3,
  freeCustomerMaxSearches: 8,
  freeCustomerMaxRecalculations: 15,
  allowGuestChat: true
};

export const SUPER_ADMIN_EMAIL = 'adilhananuar426@gmail.com';

export function isSuperAdmin(user?: UserAccount | null): boolean {
  if (!user) return false;
  return user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() || !!user.isSuperAdmin;
}

// Default system users: ONLY the Super-Admin, no fake demo users
const SEED_USERS: UserAccount[] = [
  {
    id: 'user-admin-01',
    email: 'adilhananuar426@gmail.com',
    name: 'Адильхан (Главный Администратор)',
    password: 'Lolkek4ik',
    role: 'admin',
    subscriptionTier: 'pro',
    isSuperAdmin: true,
    isBanned: false,
    createdAt: '2026-09-01T10:00:00Z',
    usageStats: { searchesCount: 42, recalculationsCount: 18 },
    notes: 'Создатель и Главный Супер-Администратор платформы AdmitRoute'
  }
];

const FAKE_DEMO_EMAILS = [
  'student@admitroute.kz',
  'aizada.sat@gmail.com',
  'daniyar.nurgali@mail.kz',
  'madina.k@inbox.ru',
  'timur.b@gmail.com',
  'kamila.yerzhan@gmail.com',
  'yerassyl.m@gmail.com'
];

export function initializeAuthDatabase(): void {
  if (typeof window === 'undefined') return;

  const rawUsers = localStorage.getItem(STORAGE_USERS_KEY);
  if (!rawUsers) {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(SEED_USERS));
  } else {
    try {
      let users: UserAccount[] = JSON.parse(rawUsers);

      // Purge all fake demo accounts so only real registered users and admin remain
      users = users.filter(
        u => !u.id.startsWith('user-demo-') && !FAKE_DEMO_EMAILS.includes(u.email.toLowerCase())
      );

      const adminIndex = users.findIndex(u => u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());
      if (adminIndex === -1) {
        users.unshift(SEED_USERS[0]);
      } else {
        users[adminIndex].role = 'admin';
        users[adminIndex].password = 'Lolkek4ik';
        users[adminIndex].subscriptionTier = 'pro';
        users[adminIndex].isSuperAdmin = true;
        users[adminIndex].isBanned = false;
      }

      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    } catch {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(SEED_USERS));
    }
  }

  const rawSettings = localStorage.getItem(STORAGE_SETTINGS_KEY);
  if (!rawSettings) {
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(DEFAULT_SITE_SETTINGS));
  } else {
    try {
      const parsed = JSON.parse(rawSettings);
      const merged: SiteSettings = { ...DEFAULT_SITE_SETTINGS, ...parsed, allowGuestChat: true };
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(merged));
    } catch {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(DEFAULT_SITE_SETTINGS));
    }
  }
}

if (typeof window !== 'undefined') {
  initializeAuthDatabase();
}

export function getAllUsers(): UserAccount[] {
  if (typeof window === 'undefined') return SEED_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(SEED_USERS));
      return SEED_USERS;
    }
    let users: UserAccount[] = JSON.parse(raw);
    let modified = false;

    // Purge any residual fake demo accounts
    const initialCount = users.length;
    users = users.filter(
      u => !u.id.startsWith('user-demo-') && !FAKE_DEMO_EMAILS.includes(u.email.toLowerCase())
    );
    if (users.length !== initialCount) {
      modified = true;
    }

    // Ensure Super Admin status is maintained
    const adminIndex = users.findIndex(u => u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());
    if (adminIndex === -1) {
      users.unshift(SEED_USERS[0]);
      modified = true;
    } else {
      const admin = users[adminIndex];
      if (admin.role !== 'admin' || !admin.isSuperAdmin || admin.subscriptionTier !== 'pro' || admin.password !== 'Lolkek4ik') {
        admin.role = 'admin';
        admin.isSuperAdmin = true;
        admin.subscriptionTier = 'pro';
        admin.password = 'Lolkek4ik';
        modified = true;
      }
    }

    if (modified) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
      window.dispatchEvent(new Event('admitroute_chat_update'));
      window.dispatchEvent(new Event('storage'));
    }
    return users;
  } catch {
    return SEED_USERS;
  }
}

export function purgeAllFakeUsers(): UserAccount[] {
  if (typeof window === 'undefined') return SEED_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    let users: UserAccount[] = raw ? JSON.parse(raw) : [];

    users = users.filter(
      u => !u.id.startsWith('user-demo-') && !FAKE_DEMO_EMAILS.includes(u.email.toLowerCase())
    );

    const adminIndex = users.findIndex(u => u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());
    if (adminIndex === -1) {
      users.unshift(SEED_USERS[0]);
    } else {
      users[adminIndex].role = 'admin';
      users[adminIndex].password = 'Lolkek4ik';
      users[adminIndex].subscriptionTier = 'pro';
      users[adminIndex].isSuperAdmin = true;
    }

    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    window.dispatchEvent(new Event('admitroute_chat_update'));
    window.dispatchEvent(new Event('storage'));
    return users;
  } catch {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(SEED_USERS));
    return SEED_USERS;
  }
}

function saveUsers(users: UserAccount[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  window.dispatchEvent(new Event('admitroute_chat_update'));
  window.dispatchEvent(new Event('storage'));
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

/**
 * Сохранить академический профиль абитуриента в аккаунт
 */
export function saveUserProfileForUser(userId: string, profile: UserProfile): void {
  const users = getAllUsers();
  const target = users.find(u => u.id === userId);
  if (!target) return;

  target.profile = profile;
  saveUsers(users);

  const current = getCurrentUser();
  if (current && current.id === userId) {
    current.profile = profile;
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(current));
  }
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

/**
 * Назначить или отозвать права администратора (только для Супер-Администратора)
 */
export function toggleAdminRole(targetUserId: string): { success: boolean; message: string; user?: UserAccount } {
  const current = getCurrentUser();
  if (!isSuperAdmin(current)) {
    return { success: false, message: 'Только Главный Супер-Администратор может назначать администраторов!' };
  }

  const users = getAllUsers();
  const target = users.find(u => u.id === targetUserId);
  if (!target) {
    return { success: false, message: 'Пользователь не найден' };
  }

  if (target.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
    return { success: false, message: 'Нельзя изменить права Главного Супер-Администратора!' };
  }

  const newRole: UserRole = target.role === 'admin' ? 'customer' : 'admin';
  target.role = newRole;
  if (newRole === 'admin') {
    target.subscriptionTier = 'pro';
  }

  saveUsers(users);

  // If target is currently logged in, update storage
  if (current && current.id === target.id) {
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(target));
  }

  return {
    success: true,
    user: target,
    message: newRole === 'admin'
      ? `Пользователю ${target.name} (${target.email}) успешно выданы права Администратора!`
      : `Права администратора у пользователя ${target.name} отозваны.`
  };
}

export function deleteUser(userId: string): { success: boolean } {
  const users = getAllUsers();
  const target = users.find(u => u.id === userId);
  if (!target) return { success: false };

  if (target.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
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
  const settings = getSiteSettings();

  if (current) {
    const usage = current.usageStats || { searchesCount: 0, recalculationsCount: 0 };
    if (current.role === 'admin' || current.subscriptionTier === 'pro') {
      return {
        allowed: true,
        remaining: 999999,
        maxLimit: 999999,
        currentCount: action === 'search' ? (usage.searchesCount ?? 0) : (usage.recalculationsCount ?? 0),
        role: current.role,
        isPro: true
      };
    }

    const maxLimit = action === 'search'
      ? (settings.freeCustomerMaxSearches ?? FREE_CUSTOMER_MAX_SEARCHES)
      : (settings.freeCustomerMaxRecalculations ?? FREE_CUSTOMER_MAX_RECALCULATIONS);
    const count = action === 'search' ? (usage.searchesCount ?? 0) : (usage.recalculationsCount ?? 0);
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
  const maxLimit = action === 'search'
    ? (settings.guestMaxSearches ?? GUEST_MAX_SEARCHES)
    : (settings.guestMaxRecalculations ?? GUEST_MAX_RECALCULATIONS);
  const count = action === 'search' ? (stats.searchesCount ?? 0) : (stats.recalculationsCount ?? 0);
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
      if (!found.usageStats) {
        found.usageStats = { searchesCount: 0, recalculationsCount: 0 };
      }
      if (action === 'search') found.usageStats.searchesCount = (found.usageStats.searchesCount ?? 0) + 1;
      else found.usageStats.recalculationsCount = (found.usageStats.recalculationsCount ?? 0) + 1;
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
    return DEFAULT_SITE_SETTINGS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
    return raw ? { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SITE_SETTINGS;
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export function updateSiteSettings(settings: Partial<SiteSettings>): SiteSettings {
  const current = getSiteSettings();
  const updated = { ...current, ...settings };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('admitroute_chat_update'));
  }
  return updated;
}

