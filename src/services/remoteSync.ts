/**
 * Глобальный сервис синхронизации базы пользователей, переписок и настроек
 * Подключен к глобальной базе данных Neon PostgreSQL (AWS).
 * Работает как через Serverless API (/api/state), так и с прямым отказоустойчивым каналом к БД.
 */

const USERS = 'admitroute_users_db_v1';
const CHAT = 'admitroute_live_chat_threads_v2';
const SETTINGS = 'admitroute_site_settings_v1';

const NEON_HOST = 'ep-shy-butterfly-b4s3isp6-pooler.c-6.us-east-2.aws.neon.tech';
const NEON_URL = `https://${NEON_HOST}/sql`;
const NEON_CONN = `postgresql://neondb_owner:npg_f51BdGjPnHkM@${NEON_HOST}/neondb?sslmode=require`;

const DELETED_USERS_KEY = 'admitroute_deleted_user_ids_v1';

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

/**
 * Прямой запрос к Neon SQL по HTTP (работает в браузере с CORS)
 */
async function executeDirectNeonSql(sql: string): Promise<any> {
  const res = await fetch(NEON_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Neon-Connection-String': NEON_CONN
    },
    body: JSON.stringify({ query: sql })
  });
  if (!res.ok) {
    throw new Error(`Direct Neon HTTP error: ${res.status}`);
  }
  return res.json();
}

/**
 * Безопасное объединение удаленного состояния с локальным
 */
function applyRemoteState(remote: any): void {
  if (!remote || typeof remote !== 'object') return;

  try {
    // 1. Объединение пользователей
    if (Array.isArray(remote.users)) {
      const localUsers: any[] = JSON.parse(localStorage.getItem(USERS) || '[]');
      const userMap = new Map<string, any>();

      for (const u of localUsers) {
        if (u && u.id) {
          const emailKey = (u.email || '').toLowerCase();
          if (!u.id.startsWith('user-demo-') && !FAKE_DEMO_EMAILS.includes(emailKey)) {
            userMap.set(u.id, u);
            if (emailKey) userMap.set(emailKey, u);
          }
        }
      }

      for (const u of remote.users) {
        if (u && u.id) {
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
        if (!seenIds.has(u.id)) {
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
 * Получение свежего состояния из глобальной БД
 */
export async function pullSharedState(): Promise<void> {
  if (typeof window === 'undefined' || !navigator.onLine) return;

  // 1. Попытка через Serverless API
  try {
    const res = await fetch('/api/state', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && data.state) {
        applyRemoteState(data.state);
        return;
      }
    }
  } catch {}

  // 2. Резервный прямой канал в Neon PostgreSQL
  try {
    const sql = "SELECT value FROM app_state WHERE key = 'admitroute_global_state_v1';";
    const res = await executeDirectNeonSql(sql);
    const row = res.rows?.[0];
    if (row && row.value) {
      applyRemoteState(row.value);
    }
  } catch (err) {
    // Бесшумный fallback при отсутствии сети
  }
}

/**
 * Отправка локальных изменений в глобальную БД
 */
export async function pushSharedState(): Promise<void> {
  if (typeof window === 'undefined' || !navigator.onLine || isPushing) return;
  isPushing = true;

  const currentLocal = getLocalState();

  try {
    // 1. Попытка через Serverless API
    const res = await fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentLocal)
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.state) {
        applyRemoteState(data.state);
        isPushing = false;
        return;
      }
    }
  } catch {}

  // 2. Резервная прямая запись в Neon PostgreSQL
  try {
    const stateJson = JSON.stringify(currentLocal).replace(/'/g, "''");
    const sql = `INSERT INTO app_state (key, value, updated_at) VALUES ('admitroute_global_state_v1', '${stateJson}'::jsonb, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW() RETURNING value;`;
    const res = await executeDirectNeonSql(sql);
    const row = res.rows?.[0];
    if (row && row.value) {
      applyRemoteState(row.value);
    }
  } catch (err) {
    console.warn('Global push failed:', err);
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
