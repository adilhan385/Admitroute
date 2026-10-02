import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { RotateCcw, Printer, Calendar, Shield, LogIn, LogOut, MessageSquare, Sparkles, Menu, X, UserPlus, Gift, Send } from 'lucide-react';
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
  onOpenReferral,
  onLogout
}) => {
  const [unreadChatForAdmin, setUnreadChatForAdmin] = useState<number>(() => getTotalUnreadForAdmin());
  const [, setQuotaVersion] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  useEffect(() => {
    const handleSync = () => {
      setUnreadChatForAdmin(getTotalUnreadForAdmin());
    };
    const handleStorage = () => {
      handleSync();
      setQuotaVersion(value => value + 1);
    };
    window.addEventListener('admitroute_chat_update', handleSync);
    window.addEventListener('storage', handleStorage);
    const handleQuotaUpdate = () => setQuotaVersion(value => value + 1);
    window.addEventListener('admitroute_quota_update', handleQuotaUpdate);
    return () => {
      window.removeEventListener('admitroute_chat_update', handleSync);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('admitroute_quota_update', handleQuotaUpdate);
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const isAdmin = currentUser?.role === 'admin' || !!currentUser?.isSuperAdmin;
  const isPro = currentUser?.subscriptionTier === 'pro';

  const searchLimits = checkActionAllowed('search');
  const runFromMenu = (action: () => void) => {
    setMenuOpen(false);
    action();
  };
  const menuItemClass = 'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600';

  return (
    <>
    <header className="sticky top-0 z-40 w-full border-b border-slate-300 bg-[#f7f7f5]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Открыть меню"
            aria-expanded={menuOpen}
            aria-controls="site-navigation"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-slate-700/50 bg-slate-900 shadow-xs">
            <img src="/avatar.jpg" alt="AdmitRoute Logo" className="h-full w-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                AdmitRoute
              </span>
              <span className="hidden sm:inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono font-medium text-slate-700">
                LOCUSCASE2
              </span>
            </div>
            <p className="hidden text-[11px] text-slate-500 sm:block">
              План поступления в университет
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
              className="hidden xl:inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
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
              className="hidden xl:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
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
              className="hidden xl:inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-slate-700 transition-colors"
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
              className="hidden xl:inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Админ-панель</span>
            </button>
          )}

          {/* Gamification, Streak & Telegram Widgets */}
          {currentUser && onOpenTelegram && onOpenReferral && (
            <div className="hidden 2xl:flex items-center">
              <GamificationHeaderWidget
                user={currentUser}
                onOpenTelegram={onOpenTelegram}
                onOpenReferral={onOpenReferral}
              />
            </div>
          )}

          {/* User Account / Role Badge */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 pl-2 pr-1.5 py-1 text-xs">
              <span className="hidden sm:inline font-semibold text-slate-800 max-w-[120px] truncate">
                {currentUser.name}
              </span>
              <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                isAdmin
                  ? 'bg-amber-100 text-amber-900'
                  : isPro
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-slate-200 text-slate-700'
              }`}>
                {isAdmin ? 'ADMIN' : isPro ? 'PRO' : 'FREE'}
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
                  className="hidden 2xl:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50"
                  title="Экспорт всех дедлайнов в Календарь (.ics)"
                >
                  <Calendar className="h-3.5 w-3.5 text-blue-600" />
                  <span>.ics</span>
                </button>
              )}

              <button
                type="button"
                onClick={handlePrint}
                className="hidden 2xl:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50"
                title="Экспорт плана в PDF / Печать"
              >
                <Printer className="h-3.5 w-3.5 text-slate-500" />
                <span>Печать</span>
              </button>

              <button
                type="button"
                onClick={onReset}
                className="hidden 2xl:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50"
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
    {menuOpen && createPortal(
      <div className="fixed inset-0 z-[100] flex" role="presentation">
        <button type="button" className="absolute inset-0 bg-slate-950/45" aria-label="Закрыть меню" onClick={() => setMenuOpen(false)} />
        <nav id="site-navigation" aria-label="Главное меню" className="relative flex h-full w-[min(340px,88vw)] flex-col bg-white p-4 shadow-2xl">
          <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="text-lg font-bold text-slate-900">AdmitRoute</div>
              <div className="text-xs text-slate-500">Меню и инструменты</div>
            </div>
            <button type="button" onClick={() => setMenuOpen(false)} aria-label="Закрыть меню" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
          </div>
          <div className="flex-1 space-y-1 overflow-y-auto">
            <button type="button" className={menuItemClass} onClick={() => runFromMenu(() => window.scrollTo({ top: 0, behavior: 'smooth' }))}><Sparkles className="h-4 w-4 text-blue-600" />Главная</button>
            {isAdmin ? (
              <>
                <button type="button" className={menuItemClass} onClick={() => runFromMenu(() => onOpenAdmin('users'))}><Shield className="h-4 w-4 text-amber-600" />Админ-панель</button>
                <button type="button" className={menuItemClass} onClick={() => runFromMenu(() => onOpenAdmin('messages'))}><MessageSquare className="h-4 w-4 text-blue-600" />Сообщения {unreadChatForAdmin > 0 && <span className="ml-auto rounded-full bg-rose-600 px-2 py-0.5 text-xs text-white">{unreadChatForAdmin}</span>}</button>
              </>
            ) : (
              <>
                <button type="button" className={menuItemClass} onClick={() => runFromMenu(() => onOpenSupport('Вопрос по поступлению'))}><MessageSquare className="h-4 w-4 text-blue-600" />Чат с админом</button>
                {!isPro && <button type="button" className={menuItemClass} onClick={() => runFromMenu(() => (onOpenPricing || (() => onOpenSupport('PRO')))())}><Sparkles className="h-4 w-4 text-indigo-600" />Купить PRO</button>}
              </>
            )}
            {currentUser && onOpenTelegram && <button type="button" className={menuItemClass} onClick={() => runFromMenu(onOpenTelegram)}><Send className="h-4 w-4 text-sky-600" />Telegram</button>}
            {currentUser && onOpenReferral && <button type="button" className={menuItemClass} onClick={() => runFromMenu(onOpenReferral)}><Gift className="h-4 w-4 text-slate-600" />Пригласить друга</button>}
            {hasProfile && <>
              {onExportCalendar && <button type="button" className={menuItemClass} onClick={() => runFromMenu(onExportCalendar)}><Calendar className="h-4 w-4 text-blue-600" />Экспорт календаря</button>}
              <button type="button" className={menuItemClass} onClick={() => runFromMenu(handlePrint)}><Printer className="h-4 w-4 text-slate-500" />Печать плана</button>
              <button type="button" className={menuItemClass} onClick={() => runFromMenu(onReset)}><RotateCcw className="h-4 w-4 text-slate-500" />Заполнить заново</button>
            </>}
          </div>
          <div className="border-t border-slate-100 pt-3">
            {currentUser ? <>
              <div className="truncate px-3 py-2 text-xs text-slate-500">{currentUser.name} · {currentUser.email}</div>
              <button type="button" className={menuItemClass} onClick={() => runFromMenu(onLogout)}><LogOut className="h-4 w-4" />Выйти</button>
            </> : <>
              <button type="button" className={menuItemClass} onClick={() => runFromMenu(() => onOpenAuth('login'))}><LogIn className="h-4 w-4" />Войти</button>
              <button type="button" className={menuItemClass} onClick={() => runFromMenu(() => onOpenAuth('register'))}><UserPlus className="h-4 w-4" />Регистрация</button>
            </>}
          </div>
        </nav>
      </div>, document.body
    )}
    </>
  );
};
