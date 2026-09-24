import React from 'react';
import type { UserAccount } from '../types';

interface Props {
  user: UserAccount | null;
  onOpenTelegram: () => void;
  onOpenReferral: () => void;
}

export const GamificationHeaderWidget: React.FC<Props> = ({
  user,
  onOpenTelegram,
  onOpenReferral
}) => {
  if (!user) return null;

  const currentStreak = user.gamification?.streak?.currentStreak || 1;
  const maxSearches = (user.dailySearches?.maxPerDay || (user.subscriptionTier === 'pro' ? 50 : 5)) + (user.dailySearches?.bonusCount || 0);
  const usedSearches = user.dailySearches?.count || 0;
  const remainingSearches = Math.max(0, maxSearches - usedSearches);
  const isTgLinked = !!user.telegramChatId;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* 1. Daily Streak Widget */}
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/90 rounded-xl text-xs font-bold text-amber-900 transition cursor-default shadow-xs"
        title={`Стрик подготовки: ${currentStreak} дн. подряд! Регулярная активность повышает шансы на грант.`}
      >
        <span className="text-base animate-pulse">🔥</span>
        <span>{currentStreak} {currentStreak === 1 ? 'день' : currentStreak < 5 ? 'дня' : 'дней'}</span>
      </div>

      {/* 2. Daily Search Quota */}
      <button
        onClick={onOpenReferral}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100/80 border border-blue-200/90 rounded-xl text-xs font-bold text-blue-900 transition shadow-xs"
        title="Нажмите, чтобы получить +5 бонусных поисков за приглашение друга"
      >
        <span className="text-blue-600">⚡</span>
        <span>{remainingSearches}/{maxSearches} AI</span>
        <span className="text-[10px] bg-blue-200/80 text-blue-800 px-1.5 py-0.2 rounded-md font-mono">+5</span>
      </button>

      {/* 3. Telegram Connect Status Button */}
      <button
        onClick={onOpenTelegram}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs border ${
          isTgLinked
            ? 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-900'
            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
        }`}
        title={isTgLinked ? 'Telegram-бот подключен (нажмите для настроек)' : 'Подключить Telegram-бота для напоминаний о дедлайнах'}
      >
        <span>✈️</span>
        <span className="hidden sm:inline">{isTgLinked ? 'TG подключен' : 'Бот в TG'}</span>
        {isTgLinked && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
      </button>
    </div>
  );
};
