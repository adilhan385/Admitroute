import React from 'react';
import type { UserAccount } from '../types';
import { getSearchQuota } from '../services/auth';
import { Flame, Search, Send } from 'lucide-react';

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
  const quota = getSearchQuota();
  const maxSearches = quota?.max ?? 0;
  const remainingSearches = quota?.remaining ?? 0;
  const isUnlimited = quota?.max === null || user.subscriptionTier === 'pro' || user.role === 'admin' || !!user.isSuperAdmin;
  const isTgLinked = !!user.telegramChatId;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* 1. Daily Streak Widget */}
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/90 rounded-xl text-xs font-bold text-amber-900 transition cursor-default shadow-xs"
        title={`Стрик подготовки: ${currentStreak} дн. подряд! Регулярная активность повышает шансы на грант.`}
      >
        <Flame className="h-4 w-4" aria-hidden="true" />
        <span>{currentStreak} {currentStreak === 1 ? 'день' : currentStreak < 5 ? 'дня' : 'дней'}</span>
      </div>

      {/* 2. Daily Search Quota */}
      <button
        onClick={onOpenReferral}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100/80 border border-blue-200/90 rounded-xl text-xs font-bold text-blue-900 transition shadow-xs"
        title="Дневной лимит AI-поиска"
      >
        <Search className="h-4 w-4 text-blue-600" aria-hidden="true" />
        <span>{isUnlimited ? 'Безлимит AI' : quota ? `${remainingSearches}/${maxSearches} AI` : 'Лимит AI'}</span>
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
        <Send className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">{isTgLinked ? 'TG подключен' : 'Бот в TG'}</span>
        {isTgLinked && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
      </button>
    </div>
  );
};
