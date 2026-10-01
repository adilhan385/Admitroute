import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
  onPresetSelect: (presetKey: 'kz_tech' | 'intl_cs' | 'kz_grant') => void;
}

export const Hero: React.FC<HeroProps> = ({ onStart, onPresetSelect }) => {
  return (
    <section className="py-10 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">План поступления · 2026</p>

        {/* Main headline */}
        <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.035em] leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
          Маршрут поступления, <br className="hidden sm:inline" />
          а не просто список университетов
        </h1>

        {/* Lead description */}
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
          Превратите ваши баллы, экзамены и бюджет в понятный пошаговый план: 
          куда подавать документы, почему эти программы подходят именно вам 
          и какое действие необходимо сделать прямо сейчас.
        </p>

        {/* Primary CTA button */}
        <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onStart}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-slate-700 sm:w-auto"
          >
            <span>Построить мой маршрут</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Demo presets for Jury testing */}
        <div className="mt-12 border-t border-slate-300 pt-5">
          <p className="text-xs font-medium text-slate-500">
            Примеры профилей
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <button
              type="button"
              onClick={() => onPresetSelect('kz_tech')}
              className="border-b border-slate-400 py-1 text-left text-xs font-medium text-slate-700 hover:border-slate-900 hover:text-slate-900 transition"
            >
              11 класс: IT в Казахстане (ЕНТ 115, грант)
            </button>
            <button
              type="button"
              onClick={() => onPresetSelect('intl_cs')}
              className="border-b border-slate-400 py-1 text-left text-xs font-medium text-slate-700 hover:border-slate-900 hover:text-slate-900 transition"
            >
              10 класс: CS за рубежом (IELTS 7.0, стипендия)
            </button>
            <button
              type="button"
              onClick={() => onPresetSelect('kz_grant')}
              className="border-b border-slate-400 py-1 text-left text-xs font-medium text-slate-700 hover:border-slate-900 hover:text-slate-900 transition"
            >
              11 класс: Инженерия (GPA 4.2, только 100% грант)
            </button>
          </div>
        </div>

        {/* 3 Core pillars */}
        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-7 border-t border-slate-300 pt-7 text-left sm:grid-cols-3">
          <div>
            <span className="text-xs font-mono text-slate-500">01 / Анализ</span>
            <h3 className="mt-2 text-sm font-semibold text-slate-900">
              Диагностика профиля
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Оценка сильных сторон, ограничений и индекса академической готовности без ложных гарантий.
            </p>
          </div>

          <div>
            <span className="text-xs font-mono text-slate-500">02 / Выбор</span>
            <h3 className="mt-2 text-sm font-semibold text-slate-900">
              Стратегия выбора
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Баланс программ по корзинам Target, Reach и Safety с понятным обоснованием «почему подходит».
            </p>
          </div>

          <div>
            <span className="text-xs font-mono text-slate-500">03 / Действия</span>
            <h3 className="mt-2 text-sm font-semibold text-slate-900">
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
