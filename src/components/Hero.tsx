import React from 'react';
import { Target, CalendarCheck, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
  onPresetSelect: (presetKey: 'kz_tech' | 'intl_cs' | 'kz_grant') => void;
}

export const Hero: React.FC<HeroProps> = ({ onStart, onPresetSelect }) => {
  return (
    <section className="relative overflow-hidden py-12 sm:py-16">
      <div className="mx-auto max-w-4xl text-center">
        {/* Tag pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/70 px-3.5 py-1 text-xs font-medium text-blue-800">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          <span>Кейс 02: Персональный маршрут поступления</span>
        </div>

        {/* Main headline */}
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Маршрут поступления, <br className="hidden sm:inline" />
          а не просто список университетов
        </h1>

        {/* Lead description */}
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
          Превратите ваши баллы, экзамены и бюджет в понятный пошаговый план: 
          куда подавать документы, почему эти программы подходят именно вам 
          и какое действие необходимо сделать прямо сейчас.
        </p>

        {/* Primary CTA button */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onStart}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 sm:w-auto"
          >
            <span>Построить мой маршрут</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Demo presets for Jury testing */}
        <div className="mt-8 border-t border-slate-200/70 pt-6">
          <p className="text-xs font-medium text-slate-500">
            Быстрый тест для жюри (готовые сценарии в 1 клик):
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => onPresetSelect('kz_tech')}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50 transition"
            >
              11 класс: IT в Казахстане (ЕНТ 115, грант)
            </button>
            <button
              type="button"
              onClick={() => onPresetSelect('intl_cs')}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50 transition"
            >
              10 класс: CS за рубежом (IELTS 7.0, стипендия)
            </button>
            <button
              type="button"
              onClick={() => onPresetSelect('kz_grant')}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50 transition"
            >
              11 класс: Инженерия (GPA 4.2, только 100% грант)
            </button>
          </div>
        </div>

        {/* 3 Core pillars */}
        <div className="mt-12 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-slate-900">
              Диагностика профиля
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Оценка сильных сторон, ограничений и индекса академической готовности без ложных гарантий.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Target className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-slate-900">
              Стратегия выбора
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Баланс программ по корзинам Target, Reach и Safety с понятным обоснованием «почему подходит».
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-slate-900">
              Пошаговый Roadmap
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Календарь контрольных точек, документов и дедлайнов с одним выделенным ближайшим действием.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
