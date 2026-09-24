import React, { useState, useEffect } from 'react';
import {
  getTelegramStatus,
  generateTelegramLinkCode,
  updateTelegramSettings,
  disconnectTelegram
} from '../services/retention';
import type { TelegramSettings } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStatusChanged?: () => void;
}

export const TelegramNotificationModal: React.FC<Props> = ({ isOpen, onClose, onStatusChanged }) => {
  const [loading, setLoading] = useState(isOpen);
  const [isConnected, setIsConnected] = useState(false);
  const [maskedChatId, setMaskedChatId] = useState<string | null>(null);
  const [botUsername, setBotUsername] = useState('admitroute_kz_bot');
  const [linkCode, setLinkCode] = useState<string | null>(null);
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [settings, setSettings] = useState<TelegramSettings>({
    notifyDeadlines: true,
    notifyDigest: true,
    notifyStaleProfile: true,
    notifyAchievements: true
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      getTelegramStatus().then(data => {
        if (!isMounted) return;
        setIsConnected(data.isConnected);
        setMaskedChatId(data.telegramChatId);
        setBotUsername(data.botUsername || 'admitroute_kz_bot');
        if (data.settings) setSettings(data.settings);
        setLoading(false);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const handleGenerateCode = async () => {
    setLoading(true);
    try {
      const res = await generateTelegramLinkCode();
      if (res && res.code && res.deepLink) {
        setLinkCode(res.code);
        setDeepLink(res.deepLink);
        if (res.botUsername) setBotUsername(res.botUsername);
      }
    } catch (err) {
      console.error('[Error generating Telegram link]:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (deepLink) {
      navigator.clipboard.writeText(deepLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleSetting = async (key: keyof TelegramSettings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    await updateTelegramSettings(updated);
  };

  const handleDisconnect = async () => {
    if (!confirm('Вы действительно хотите отключить уведомления в Telegram?')) return;
    setLoading(true);
    const ok = await disconnectTelegram();
    if (ok) {
      setIsConnected(false);
      setMaskedChatId(null);
      setLinkCode(null);
      setDeepLink(null);
      if (onStatusChanged) onStatusChanged();
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm transition"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-2xl">
            ✈️
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Уведомления в Telegram</h3>
            <p className="text-xs text-slate-500">Персональный бот-помощник AdmitRoute</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Загрузка данных...</div>
        ) : isConnected ? (
          <div className="space-y-5">
            <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">✅</span>
                <div>
                  <div className="text-xs font-bold text-emerald-900">Telegram подключен</div>
                  <div className="text-[11px] text-emerald-700">ID чата: {maskedChatId || '••••'}</div>
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-100 rounded-lg font-medium transition"
              >
                Отключить
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Категории уведомлений
              </div>

              <label className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition">
                <input
                  type="checkbox"
                  checked={settings.notifyDeadlines}
                  onChange={() => handleToggleSetting('notifyDeadlines')}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-800">⏰ Напоминания о дедлайнах</div>
                  <div className="text-[11px] text-slate-500">Оповещения за 14, 7, 3 и 1 день до срока подачи</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition">
                <input
                  type="checkbox"
                  checked={settings.notifyDigest}
                  onChange={() => handleToggleSetting('notifyDigest')}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-800">📊 Еженедельный дайджест</div>
                  <div className="text-[11px] text-slate-500">Сводка ключевых задач на неделю по понедельникам</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition">
                <input
                  type="checkbox"
                  checked={settings.notifyStaleProfile}
                  onChange={() => handleToggleSetting('notifyStaleProfile')}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-800">⚠️ Актуальность профиля</div>
                  <div className="text-[11px] text-slate-500">Мягкие напоминания, если баллы не обновлялись 60+ дней</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition">
                <input
                  type="checkbox"
                  checked={settings.notifyAchievements}
                  onChange={() => handleToggleSetting('notifyAchievements')}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-800">🏆 Достижения и бейджи</div>
                  <div className="text-[11px] text-slate-500">Поздравления с подачей заявок и стриком подготовки</div>
                </div>
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Подключите нашего официального Telegram-бота, чтобы мгновенно получать напоминания о дедлайнах и не пропустить сроки подачи документов в университеты.
            </p>

            {linkCode && deepLink ? (
              <div className="p-4 bg-sky-50 border border-sky-100 rounded-2xl space-y-3">
                <div className="text-center">
                  <div className="text-xs text-sky-800 font-medium mb-1">Ваш одноразовый код привязки:</div>
                  <div className="text-2xl font-black tracking-widest text-sky-950 font-mono py-1 px-3 bg-white rounded-xl inline-block border border-sky-200">
                    {linkCode}
                  </div>
                  <div className="text-[11px] text-sky-600 mt-1">Действует 10 минут</div>
                </div>

                <a
                  href={deepLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <span>🚀</span> Открыть бота в Telegram
                </a>

                <button
                  onClick={handleCopyLink}
                  className="w-full py-2 px-3 bg-white hover:bg-slate-50 border border-sky-200 text-sky-900 rounded-xl text-xs font-medium transition"
                >
                  {copied ? '✓ Ссылка скопирована' : '📋 Скопировать прямую ссылку'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleGenerateCode}
                className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-sky-500/20 transition flex items-center justify-center gap-2"
              >
                <span>✈️</span> Подключить Telegram-бота
              </button>
            )}

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 space-y-1">
              <div>💡 <b>Как это работает:</b></div>
              <div>1. Нажмите кнопку подключения и перейдите в бота <code>@{botUsername}</code>.</div>
              <div>2. Нажмите кнопку Start — бот автоматически привяжет ваш аккаунт.</div>
              <div>3. Вы сможете настроить частоту уведомлений в любой момент.</div>
            </div>
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
