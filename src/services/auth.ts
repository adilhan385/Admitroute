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

// Seed initial database with diverse realistic applicants across Kazakhstan and abroad
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
  },
  {
    id: 'user-demo-02',
    email: 'student@admitroute.kz',
    name: 'Алихан Бауыржанов',
    password: 'Student123',
    role: 'customer',
    subscriptionTier: 'free',
    isBanned: false,
    createdAt: '2026-09-10T12:30:00Z',
    usageStats: { searchesCount: 5, recalculationsCount: 4 },
    notes: '11 класс, НИШ ФМН Алматы. Интересуется CS и грантами в Италии и Европе.',
    profile: {
      name: 'Алихан Бауыржанов',
      grade: 'grade_11',
      field: 'cs_it',
      gpa: 4.8,
      hasLanguageTest: true,
      languageScore: 'IELTS 7.0',
      hasStateExam: true,
      stateExamScore: 'ЕНТ 124 / 140',
      targetRegion: 'europe',
      budget: 'full_grant',
      targetYear: '2026',
      portfolioText: 'Победитель областной олимпиады по информатике, разработал сервис мониторинга дедлайнов для школы, капитан IT-клуба.'
    }
  },
  {
    id: 'user-demo-03',
    email: 'aizada.sat@gmail.com',
    name: 'Айзада Султанова',
    password: 'Aizada2026',
    role: 'customer',
    subscriptionTier: 'pro',
    isBanned: false,
    createdAt: '2026-09-11T14:15:00Z',
    usageStats: { searchesCount: 19, recalculationsCount: 8 },
    notes: 'Выпускница РФМШ Астана. Цели: MIT, Stanford, NUS (США и Азия). Оформила PRO.',
    profile: {
      name: 'Айзада Султанова',
      grade: 'graduate',
      field: 'engineering',
      gpa: 4.95,
      hasLanguageTest: true,
      languageScore: 'IELTS 7.5',
      hasStateExam: true,
      stateExamScore: 'SAT 1490',
      targetRegion: 'usa',
      budget: 'full_grant',
      targetYear: '2026',
      portfolioText: 'Золотая медаль на республиканском конкурсе научных проектов Дарын, разработала прототип биопротеза руки с Arduino, капитан команды по робототехнике WRO.'
    }
  },
  {
    id: 'user-demo-04',
    email: 'daniyar.nurgali@mail.kz',
    name: 'Данияр Нургалиев',
    password: 'Daniyar77',
    role: 'customer',
    subscriptionTier: 'free',
    isBanned: false,
    createdAt: '2026-09-12T09:40:00Z',
    usageStats: { searchesCount: 6, recalculationsCount: 5 },
    notes: '11 класс, БИЛ Шымкент. Поступает на общую медицину (КазНМУ, МУА, Астана).',
    profile: {
      name: 'Данияр Нургалиев',
      grade: 'grade_11',
      field: 'medicine_bio',
      gpa: 4.75,
      hasLanguageTest: true,
      languageScore: 'IELTS 6.5',
      hasStateExam: true,
      stateExamScore: 'ЕНТ 131 / 140',
      targetRegion: 'kazakhstan',
      budget: 'full_grant',
      targetYear: '2026',
      portfolioText: 'Призер олимпиады по биологии и химии, 60 часов волонтерства в городской детской больнице, организатор санпросвет клуба в школе.'
    }
  },
  {
    id: 'user-demo-05',
    email: 'madina.k@inbox.ru',
    name: 'Мадина Кенесова',
    password: 'MadinaPass',
    role: 'customer',
    subscriptionTier: 'pro',
    isBanned: false,
    createdAt: '2026-09-13T16:20:00Z',
    usageStats: { searchesCount: 14, recalculationsCount: 6 },
    notes: '11 класс, Гимназия №159 Алматы. Бизнес и экономика (Bocconi, КИМЭП, Erasmus).',
    profile: {
      name: 'Мадина Кенесова',
      grade: 'grade_11',
      field: 'business_econ',
      gpa: 4.4,
      hasLanguageTest: true,
      languageScore: 'IELTS 6.5',
      hasStateExam: true,
      stateExamScore: 'SAT 1340',
      targetRegion: 'europe',
      budget: 'mid_cost',
      targetYear: '2026',
      portfolioText: 'Победитель школьного бизнес-инкубатора, запустила локальный эко-бренд свечей с выручкой 400 тыс ₸, президент школьного дебатного клуба.'
    }
  },
  {
    id: 'user-demo-06',
    email: 'timur.b@gmail.com',
    name: 'Тимур Болатов',
    password: 'TimurCode',
    role: 'customer',
    subscriptionTier: 'free',
    isBanned: false,
    createdAt: '2026-09-14T11:05:00Z',
    usageStats: { searchesCount: 4, recalculationsCount: 3 },
    notes: '10 класс, Лицей №8 Павлодар. Заранее готовится к поступлению в KAIST и Корею.',
    profile: {
      name: 'Тимур Болатов',
      grade: 'grade_10',
      field: 'cs_it',
      gpa: 4.6,
      hasLanguageTest: true,
      languageScore: 'IELTS 6.0',
      hasStateExam: false,
      stateExamScore: '',
      targetRegion: 'asia',
      budget: 'full_grant',
      targetYear: '2027',
      portfolioText: 'Участник соревнований по спортивному программированию Codeforces (рейтинг 1450), разработал Telegram-бота для подготовки к олимпиадам.'
    }
  },
  {
    id: 'user-demo-07',
    email: 'kamila.yerzhan@gmail.com',
    name: 'Камила Ержанова',
    password: 'Kamila99',
    role: 'customer',
    subscriptionTier: 'free',
    isBanned: false,
    createdAt: '2026-09-15T18:50:00Z',
    usageStats: { searchesCount: 3, recalculationsCount: 2 },
    notes: 'Выпускник колледжа, Астана. Графический дизайн и архитектура (Politecnico di Milano).',
    profile: {
      name: 'Камила Ержанова',
      grade: 'graduate',
      field: 'design_media',
      gpa: 4.15,
      hasLanguageTest: true,
      languageScore: 'Duolingo 115',
      hasStateExam: false,
      stateExamScore: '',
      targetRegion: 'europe',
      budget: 'low_cost',
      targetYear: '2026',
      portfolioText: 'Портфолио на Behance с 15 работами по брендингу, иллюстрации для городской молодежной выставки, оформление школьного журнала.'
    }
  },
  {
    id: 'user-demo-08',
    email: 'yerassyl.m@gmail.com',
    name: 'Ерасыл Маратов',
    password: 'YerassylLaw',
    role: 'customer',
    subscriptionTier: 'free',
    isBanned: false,
    createdAt: '2026-09-16T13:10:00Z',
    usageStats: { searchesCount: 5, recalculationsCount: 3 },
    notes: '11 класс, Караганда. Международное право и дипломатия (КАЗГЮУ, ЕНУ, Нархоз).',
    profile: {
      name: 'Ерасыл Маратов',
      grade: 'grade_11',
      field: 'social_law',
      gpa: 3.9,
      hasLanguageTest: false,
      languageScore: '',
      hasStateExam: true,
      stateExamScore: 'ЕНТ 108 / 140',
      targetRegion: 'kazakhstan',
      budget: 'full_grant',
      targetYear: '2026',
      portfolioText: 'Капитан школьной сборной по дебатам в казахской лиге, волонтер молодежного ресурсного центра Караганды.'
    }
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

      // Auto-populate all missing seed users so existing DB always has the full applicant database
      for (const seed of SEED_USERS) {
        if (!users.some(u => u.email.toLowerCase() === seed.email.toLowerCase())) {
          users.push(seed);
        }
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
    const users: UserAccount[] = JSON.parse(raw);
    let modified = false;

    // Ensure all 8 seed applicants are present in database
    for (const seed of SEED_USERS) {
      const existingIndex = users.findIndex(u => u.email.toLowerCase() === seed.email.toLowerCase());
      if (existingIndex === -1) {
        users.push(seed);
        modified = true;
      } else if (!users[existingIndex].profile && seed.profile) {
        users[existingIndex].profile = seed.profile;
        modified = true;
      }
    }

    // Ensure Super Admin status is maintained
    const admin = users.find(u => u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());
    if (admin) {
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
    }
    return users;
  } catch {
    return SEED_USERS;
  }
}

export function resetSeedUsers(): UserAccount[] {
  if (typeof window === 'undefined') return SEED_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    let users: UserAccount[] = raw ? JSON.parse(raw) : [];

    for (const seed of SEED_USERS) {
      const idx = users.findIndex(u => u.email.toLowerCase() === seed.email.toLowerCase());
      if (idx === -1) {
        users.push(seed);
      } else {
        users[idx] = {
          ...seed,
          ...users[idx],
          name: seed.name,
          notes: seed.notes,
          profile: seed.profile || users[idx].profile,
          subscriptionTier: users[idx].subscriptionTier || seed.subscriptionTier
        };
      }
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

