/**
 * Глобальный сервис синхронизации базы пользователей, переписок и настроек
 * Работает через защищенный Serverless API (/api/state) без раскрытия учетных данных БД клиенту.
 */

const USERS = 'admitroute_users_db_v1';
const CHAT = 'admitroute_live_chat_threads_v2';
const SETTINGS = 'admitroute_site_settings_v1';
const DELETED_USERS_KEY = 'admitroute_deleted_user_ids_v1';
const TOKEN_KEY = 'admitroute_auth_token_v1';

const FAKE_DEMO_EMAILS = [
  'student@admitroute.kz',
  'aizada.sat@gmail.com',
  'daniyar.nurgali@mail.kz',
  'madina.k@inbox.ru',
  'timur.b@gmail.com',
  'kamila.yerzhan@gmail.com',
  'yerassyl.m@gmail.com'
];

let isSyncRunning = false;
let isPushing = false;
let syncIntervalId: number | null = null;

const getLocalState = () => ({
  users: JSON.parse(localStorage.getItem(USERS) || '[]'),
  messages: JSON.parse(localStorage.getItem(CHAT) || '[]'),
  settings: JSON.parse(localStorage.getItem(SETTINGS) || '{}'),
  deletedUserIds: JSON.parse(localStorage.getItem(DELETED_USERS_KEY) || '[]')
});

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

/**
 * Безопасное объединение удаленного состояния с локальным
 */
function applyRemoteState(remote: any): void {
  if (!remote || typeof remote !== 'object') return;

  try {
    const deletedIds = new Set<string>(JSON.parse(localStorage.getItem(DELETED_USERS_KEY) || '[]'));

    // 1. Объединение пользователей
    if (Array.isArray(remote.users)) {
      const localUsers: any[] = JSON.parse(localStorage.getItem(USERS) || '[]');
      const userMap = new Map<string, any>();

      for (const u of localUsers) {
        if (u && u.id && !deletedIds.has(u.id)) {
          const emailKey = (u.email || '').toLowerCase();
          if (!u.id.startsWith('user-demo-') && !FAKE_DEMO_EMAILS.includes(emailKey)) {
            userMap.set(u.id, u);
            if (emailKey) userMap.set(emailKey, u);
          }
        }
      }

      for (const u of remote.users) {
        if (u && u.id && !deletedIds.has(u.id)) {
          const emailKey = (u.email || '').toLowerCase();
          if (!u.id.startsWith('user-demo-') && !FAKE_DEMO_EMAILS.includes(emailKey)) {
            const existing = (emailKey ? userMap.get(emailKey) : null) || userMap.get(u.id);
            if (existing) {
              const merged = { ...existing, ...u };
              userMap.set(u.id, merged);
              if (emailKey) userMap.set(emailKey, merged);
            } else {
              userMap.set(u.id, u);
              if (emailKey) userMap.set(emailKey, u);
            }
          }
        }
      }

      const mergedUsers: any[] = [];
      const seenIds = new Set<string>();
      for (const u of userMap.values()) {
        if (!seenIds.has(u.id) && !deletedIds.has(u.id)) {
          seenIds.add(u.id);
          mergedUsers.push(u);
        }
      }

      localStorage.setItem(USERS, JSON.stringify(mergedUsers));
    }

    // 2. Объединение сообщений чата
    if (Array.isArray(remote.messages)) {
      const localMsgs: any[] = JSON.parse(localStorage.getItem(CHAT) || '[]');
      const msgMap = new Map<string, any>();

      for (const m of localMsgs) {
        if (m && m.id && !m.id.startsWith('msg-seed-')) {
          msgMap.set(m.id, m);
        }
      }

      for (const m of remote.messages) {
        if (m && m.id && !m.id.startsWith('msg-seed-')) {
          const existing = msgMap.get(m.id);
          if (existing) {
            msgMap.set(m.id, { ...existing, ...m });
          } else {
            msgMap.set(m.id, m);
          }
        }
      }

      const mergedMsgs = Array.from(msgMap.values()).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      localStorage.setItem(CHAT, JSON.stringify(mergedMsgs));
    }

    // 3. Объединение настроек
    if (remote.settings && typeof remote.settings === 'object') {
      const localSettings = JSON.parse(localStorage.getItem(SETTINGS) || '{}');
      localStorage.setItem(SETTINGS, JSON.stringify({ ...localSettings, ...remote.settings }));
    }

    // Оповещаем все компоненты и админ-панель
    window.dispatchEvent(new Event('admitroute_chat_update'));
    window.dispatchEvent(new Event('admitroute_users_update'));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.warn('Error applying remote state:', err);
  }
}

/**
 * Получение свежего состояния из защищенного Serverless API
 */
export async function pullSharedState(): Promise<void> {
  if (typeof window === 'undefined' || !navigator.onLine) return;

  try {
    const res = await fetch('/api/state', {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.state) {
        applyRemoteState(data.state);
      }
    }
  } catch {
    // Бесшумный fallback при отсутствии сети
  }
}

/**
 * Отправка локальных изменений в защищенный Serverless API
 */
export async function pushSharedState(): Promise<void> {
  if (typeof window === 'undefined' || !navigator.onLine || isPushing) return;
  isPushing = true;

  const currentLocal = getLocalState();

  try {
    const res = await fetch('/api/state', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(currentLocal)
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.state) {
        applyRemoteState(data.state);
      }
    }
  } catch {
    // Бесшумный fallback при временном отсутствии сети
  } finally {
    isPushing = false;
  }
}

/**
 * Запуск непрерывного глобального обмена данными
 */
export function startSharedSync(): void {
  if (typeof window === 'undefined' || isSyncRunning) return;
  isSyncRunning = true;

  // Первый опрос сразу
  void pullSharedState();

  // Непрерывный опрос каждые 2.5 секунды для мгновенного чата и пользователей
  syncIntervalId = window.setInterval(() => {
    void pullSharedState();
  }, 2500);

  // Мгновенная синхронизация при возвращении на вкладку
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      void pullSharedState();
    }
  });

  // Синхронизация при восстановлении интернет-соединения
  window.addEventListener('online', () => {
    void pullSharedState();
    void pushSharedState();
  });
}

/**
 * Остановка фоновой синхронизации
 */
export function stopSharedSync(): void {
  if (syncIntervalId !== null) {
    window.clearInterval(syncIntervalId);
    syncIntervalId = null;
  }
  isSyncRunning = false;
}
