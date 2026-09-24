import React, { useState, useEffect } from 'react';
import { RotateCcw, Printer, Calendar, Shield, LogIn, LogOut, MessageSquare, Sparkles } from 'lucide-react';
import type { UserAccount } from '../types';
import { checkActionAllowed } from '../services/auth';
import { getTotalUnreadForAdmin } from '../services/chat';
import { GamificationHeaderWidget } from './GamificationHeaderWidget';

interface HeaderProps {
  onReset: () => void;
  hasProfile: boolean;
  onExportCalendar?: () => void;
  currentUser: UserAccount | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenAdmin: (tab?: 'users' | 'messages' | 'settings') => void;
  onOpenSupport: (topic?: string) => void;
  onOpenPricing?: () => void;
  onOpenTelegram?: () => void;
  onOpenShare?: () => void;
  onOpenReferral?: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  hasProfile,
  onExportCalendar,
  currentUser,
  onOpenAuth,
  onOpenAdmin,
  onOpenSupport,
  onOpenPricing,
  onOpenTelegram,
  onOpenShare,
  onOpenReferral,
  onLogout
}) => {
  const [unreadChatForAdmin, setUnreadChatForAdmin] = useState<number>(() => getTotalUnreadForAdmin());

  useEffect(() => {
    const handleSync = () => {
      setUnreadChatForAdmin(getTotalUnreadForAdmin());
    };
    window.addEventListener('admitroute_chat_update', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('admitroute_chat_update', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const isAdmin = currentUser?.role === 'admin' || !!currentUser?.isSuperAdmin;
  const isPro = currentUser?.subscriptionTier === 'pro';

  const searchLimits = checkActionAllowed('search');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-slate-700/50 bg-slate-900 shadow-xs">
            <img src="/avatar.jpg" alt="AdmitRoute Logo" className="h-full w-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                AdmitRoute
              </span>
              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono font-medium text-slate-700">
                LOCUSCASE2
              </span>
            </div>
            <p className="hidden text-[11px] text-slate-500 sm:block">
              Персональный AI-маршрут поступления
            </p>
          </div>
        </div>

        {/* Center/Right Status & User Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Support / Chat / Admin messages button */}
          {isAdmin ? (
            <button
              type="button"
              onClick={() => onOpenAdmin('messages')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/80 px-2.5 py-1.5 text-xs font-semibold text-blue-700 shadow-2xs hover:bg-blue-100 transition-colors"
              title="Переписка и заявки студентов в чате"
            >
              <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
              <span>Сообщения</span>
              {unreadChatForAdmin > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] text-white font-bold">
                  {unreadChatForAdmin}
                </span>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenSupport(isPro ? 'Вопрос по поступлению' : 'PRO')}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
              title="Чат с основателем (WhatsApp / Telegram / Сайт)"
            >
              <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
              <span>Чат с админом</span>
            </button>
          )}

          {/* If Not PRO, show Buy PRO button */}
          {!isPro && !isAdmin && (
            <button
              type="button"
              onClick={onOpenPricing || (() => onOpenSupport('PRO'))}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Купить PRO</span>
            </button>
          )}

          {/* Admin Panel Button */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => onOpenAdmin('users')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-2.5 py-1.5 text-xs font-bold text-slate-950 shadow-xs hover:bg-amber-400 transition-colors"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Админ-панель</span>
            </button>
          )}

          {/* Gamification, Streak & Telegram Widgets */}
          {currentUser && onOpenTelegram && onOpenShare && onOpenReferral && (
            <div className="hidden sm:flex items-center">
              <GamificationHeaderWidget
                user={currentUser}
                onOpenTelegram={onOpenTelegram}
                onOpenShare={onOpenShare}
                onOpenReferral={onOpenReferral}
              />
            </div>
          )}

          {/* User Account / Role Badge */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 pl-2 pr-1.5 py-1 text-xs">
              <span className="font-semibold text-slate-800 max-w-[90px] sm:max-w-[120px] truncate">
                {currentUser.name}
              </span>
              <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                isAdmin
                  ? 'bg-amber-100 text-amber-900'
                  : isPro
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-slate-200 text-slate-700'
              }`}>
                {isAdmin ? 'ADMIN' : isPro ? '⭐ PRO' : 'FREE'}
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700"
                title="Выйти из аккаунта"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <LogIn className="h-3.5 w-3.5 text-slate-500" />
              <span>Войти</span>
              <span className="hidden md:inline rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 font-normal">
                {searchLimits.remaining} поиска
              </span>
            </button>
          )}

          {/* Profile Actions: Print & Reset */}
          {hasProfile && (
            <>
              {onExportCalendar && (
                <button
                  type="button"
                  onClick={onExportCalendar}
                  className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50"
                  title="Экспорт всех дедлайнов в Календарь (.ics)"
                >
                  <Calendar className="h-3.5 w-3.5 text-blue-600" />
                  <span>.ics</span>
                </button>
              )}

              <button
                type="button"
                onClick={handlePrint}
                className="hidden lg:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50"
                title="Экспорт плана в PDF / Печать"
              >
                <Printer className="h-3.5 w-3.5 text-slate-500" />
                <span>Печать</span>
              </button>

              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50"
                title="Сбросить и заполнить заново"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                <span className="hidden sm:inline">Сброс</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
