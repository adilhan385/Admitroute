import React from 'react';
import { X, Check, Sparkles, MessageSquare, ShieldCheck, Zap } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToChat: () => void;
  isPro?: boolean;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  onProceedToChat,
  isPro = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-3 sm:p-5 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-5 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 font-bold shadow-xs">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Тарифные планы AdmitRoute</h2>
              <p className="text-xs text-slate-400">
                Сравните возможности и выберите оптимальный уровень сопровождения поступления
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Plan 1: Free */}
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition-all">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                  БАЗОВЫЙ
                </span>
                {!isPro && (
                  <span className="text-[11px] font-semibold text-slate-500">
                    Ваш текущий план
                  </span>
                )}
              </div>

              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900">0 ₸</div>
                <div className="text-xs text-slate-500 mt-0.5">Бесплатный ознакомительный доступ</div>
              </div>

              <p className="mt-3 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3">
                Подходит для первого знакомства с сервисом и экспресс-оценки шансов по базовой анкете.
              </p>

              <div className="mt-4 flex-1 space-y-2.5">
                <div className="flex items-start gap-2 text-xs text-slate-700">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>До 6 поисков вузов (1 поиск для гостей)</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-700">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>До 12 пересчетов стратегии (2 для гостей)</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-700">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Экспресс-диагностика сильных сторон и рисков</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-700">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Базовый чат со службой поддержки</span>
                </div>

                <div className="pt-2 border-t border-slate-200/60 space-y-2 text-slate-400">
                  <div className="flex items-start gap-2 text-xs line-through">
                    <X className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>Безлимитный AI-поиск вузов мира</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs line-through">
                    <X className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>Приоритетный личный чат с ментором</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs line-through">
                    <X className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>Экспорт дедлайнов в iCalendar (.ics)</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs line-through">
                    <X className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>AI-генератор мотивационных писем и эссе</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-200/60">
                <button
                  type="button"
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-500 shadow-2xs cursor-default"
                >
                  {isPro ? 'Остаться на PRO' : 'Активен по умолчанию'}
                </button>
              </div>
            </div>

            {/* Plan 2: PRO */}
            <div className="relative flex flex-col rounded-2xl border-2 border-blue-600 bg-gradient-to-b from-blue-50/40 via-white to-white p-5 shadow-lg shadow-blue-500/10">
              <div className="absolute -top-3 right-5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
                🔥 Рекомендуется
              </div>

              <div className="flex items-center justify-between">
                <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-black text-blue-800">
                  ADMITROUTE PRO
                </span>
                {isPro && (
                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                    ✓ У вас уже PRO
                  </span>
                )}
              </div>

              <div className="mt-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-slate-900">4 990 ₸</span>
                  <span className="text-xs text-slate-500 font-medium">/ сезон поступления</span>
                </div>
                <div className="text-xs text-blue-700 font-semibold mt-0.5">
                  Единоразовый платеж • Без автосписаний
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                Максимальный набор инструментов и персональное менторское сопровождение до выхода приказа о зачислении.
              </p>

              <div className="mt-4 flex-1 space-y-2.5">
                <div className="flex items-start gap-2 text-xs text-slate-900 font-medium">
                  <div className="rounded-full bg-blue-100 p-0.5 text-blue-600 mt-0.5 shrink-0">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span><strong>Безлимитный AI-поиск</strong> любых вузов Казахстана и мира</span>
                </div>

                <div className="flex items-start gap-2 text-xs text-slate-900 font-medium">
                  <div className="rounded-full bg-blue-100 p-0.5 text-blue-600 mt-0.5 shrink-0">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span><strong>Неограниченные пересчеты стратегии</strong> при любых изменениях баллов</span>
                </div>

                <div className="flex items-start gap-2 text-xs text-slate-900 font-medium">
                  <div className="rounded-full bg-blue-100 p-0.5 text-blue-600 mt-0.5 shrink-0">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span><strong>Приоритетный личный чат с основателем Адильханом</strong> (ответ до 15 мин)</span>
                </div>

                <div className="flex items-start gap-2 text-xs text-slate-900 font-medium">
                  <div className="rounded-full bg-blue-100 p-0.5 text-blue-600 mt-0.5 shrink-0">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span><strong>Экспорт Roadmap в iCalendar (.ics)</strong> (Google/Apple/Outlook)</span>
                </div>

                <div className="flex items-start gap-2 text-xs text-slate-900 font-medium">
                  <div className="rounded-full bg-blue-100 p-0.5 text-blue-600 mt-0.5 shrink-0">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span><strong>Детальный расчет 100% грантов:</strong> госгранты РК, DSU (Италия), Hungaricum</span>
                </div>

                <div className="flex items-start gap-2 text-xs text-slate-900 font-medium">
                  <div className="rounded-full bg-blue-100 p-0.5 text-blue-600 mt-0.5 shrink-0">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span><strong>AI-генератор мотивационных писем</strong> под конкретный факультет</span>
                </div>

                <div className="flex items-start gap-2 text-xs text-slate-900 font-medium">
                  <div className="rounded-full bg-blue-100 p-0.5 text-blue-600 mt-0.5 shrink-0">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span><strong>Помощь при апелляциях</strong> и оформлении документов приемной комиссии</span>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onProceedToChat();
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-md hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg transition-all"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Перейти к оформлению в чате →</span>
                </button>
                <div className="mt-2 text-center text-[10px] text-slate-500">
                  Мгновенная активация после подтверждения перевода на Kaspi
                </div>
              </div>
            </div>
          </div>

          {/* Trust Banner */}
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Безопасная оплата через Kaspi • Прямая связь с основателем платформы</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>WhatsApp: <strong>+7 775 253 01 10</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
