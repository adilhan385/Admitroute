import { useState } from 'react';
import { X, Lock, Mail, User, Shield, AlertCircle, ArrowRight } from 'lucide-react';
import { login, register } from '../services/auth';
import type { UserAccount } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserAccount) => void;
  initialMode?: 'login' | 'register';
  customTitle?: string;
  customSubtitle?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
  customTitle,
  customSubtitle
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = login(email, password);
        if (res.success && res.user) {
          onAuthSuccess(res.user);
          onClose();
        } else {
          setError(res.error || 'Ошибка входа');
        }
      } else {
        const res = register(name, email, password);
        if (res.success && res.user) {
          onAuthSuccess(res.user);
          onClose();
        } else {
          setError(res.error || 'Ошибка регистрации');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLoginAdmin = () => {
    setEmail('adilhananuar426@gmail.com');
    setPassword('Adilhan0404');
    setMode('login');
    const res = login('adilhananuar426@gmail.com', 'Adilhan0404');
    if (res.success && res.user) {
      onAuthSuccess(res.user);
      onClose();
    }
  };

  const handleQuickLoginStudent = () => {
    setEmail('student@admitroute.kz');
    setPassword('Student123');
    setMode('login');
    const res = login('student@admitroute.kz', 'Student123');
    if (res.success && res.user) {
      onAuthSuccess(res.user);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-5 text-left">
          <div className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            <Shield className="h-3.5 w-3.5" />
            <span>AdmitRoute ID</span>
          </div>
          <h3 className="mt-2 text-lg font-bold text-slate-900">
            {customTitle || (mode === 'login' ? 'Вход в аккаунт' : 'Регистрация абитуриента')}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {customSubtitle || (mode === 'login'
              ? 'Войдите, чтобы сохранять свои расчеты и снимать лимиты'
              : 'Создайте бесплатный аккаунт для сохранения персонального роадмапа')}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="mb-4 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-xs font-medium text-slate-600">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`rounded-lg py-1.5 text-center transition-all ${
              mode === 'login' ? 'bg-white font-semibold text-slate-900 shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            Вход
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`rounded-lg py-1.5 text-center transition-all ${
              mode === 'register' ? 'bg-white font-semibold text-slate-900 shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            Регистрация
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Ваше имя</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Данияр"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email адрес</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Пароль</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:opacity-50 transition-colors"
          >
            <span>{mode === 'login' ? 'Войти' : 'Создать аккаунт'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>

        {/* Quick Demo Logins for Hackathon Jury */}
        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
            Быстрый вход для проверки жюри:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleQuickLoginAdmin}
              className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50/70 p-2 text-left text-xs font-medium text-amber-900 hover:bg-amber-100 transition-colors"
              title="adilhananuar426@gmail.com"
            >
              <Shield className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <div className="truncate">
                <div className="font-semibold leading-tight">Администратор</div>
                <div className="text-[10px] text-amber-700 truncate">adilhananuar426@...</div>
              </div>
            </button>

            <button
              type="button"
              onClick={handleQuickLoginStudent}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-2 text-left text-xs font-medium text-slate-800 hover:bg-slate-100 transition-colors"
              title="student@admitroute.kz"
            >
              <User className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <div className="truncate">
                <div className="font-semibold leading-tight">Абитуриент</div>
                <div className="text-[10px] text-slate-500 truncate">student@admit...</div>
              </div>
            </button>
          </div>

          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-[11px] text-slate-400 hover:text-slate-600 underline"
            >
              Продолжить как гость (с базовыми лимитами)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
