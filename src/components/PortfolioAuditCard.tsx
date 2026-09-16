import React from 'react';
import type { PortfolioAudit, UserProfile } from '../types';
import { AlertCircle, CheckCircle2, TrendingUp, Sparkles, Compass } from 'lucide-react';

interface PortfolioAuditCardProps {
  audit: PortfolioAudit;
  profile: UserProfile;
  onEditPortfolio: () => void;
}

export const PortfolioAuditCard: React.FC<PortfolioAuditCardProps> = ({
  audit,
  profile,
  onEditPortfolio
}) => {
  const getCompetitivenessBadge = (comp: PortfolioAudit['abroadCompetitiveness']) => {
    switch (comp) {
      case 'Высокая':
        return (
          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
            {comp}
          </span>
        );
      case 'Умеренная':
        return (
          <span className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
            {comp}
          </span>
        );
      case 'Недостаточная без усиления':
        return (
          <span className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
            {comp}
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              <Sparkles className="h-3 w-3" />
              <span>Честный AI-аудит портфолио</span>
            </span>
            <span className="text-xs text-slate-500">
              Оценка внеучебных активностей ({profile.name})
            </span>
          </div>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">
            Оценка шансов на гранты и зарубежные программы
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Объективный анализ без завышения вероятностей и ложных гарантий
          </p>
        </div>

        {/* Abroad Readiness Meter */}
        <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 sm:text-right">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Конкурентоспособность
            </div>
            <div className="mt-1">
              {getCompetitivenessBadge(audit.abroadCompetitiveness)}
            </div>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Балл активности
            </div>
            <div className="text-xl font-bold font-mono text-slate-900">
              {audit.scoreOutOf100} / 100
            </div>
          </div>
        </div>
      </div>

      {/* Honest Verdict Callout */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Реалистичный вердикт приемной комиссии
            </span>
            <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-800">
              {audit.honestVerdict}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Strengths vs Gaps */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Strong points */}
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Подтвержденные преимущества профиля</span>
          </div>
          <ul className="mt-3 space-y-2">
            {audit.strongPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Critical gaps (Honest breakdown!) */}
        <div className="rounded-xl border border-rose-100 bg-rose-50/30 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-900">
            <AlertCircle className="h-4 w-4 text-rose-600" />
            <span>Критические пробелы для топ-вузов</span>
          </div>
          <ul className="mt-3 space-y-2">
            {audit.criticalGaps.map((gap, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actionable recommendations for portfolio improvement */}
      <div className="mt-6 border-t border-slate-100 pt-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span>Как усилить портфолио до подачи документов:</span>
          </div>
          <button
            type="button"
            onClick={onEditPortfolio}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition"
          >
            Дополнить текст активности
          </button>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {audit.recommendedNextActivities.map((act, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700">
              <span className="font-mono text-[11px] font-semibold text-blue-600 block mb-1">
                Шаг 0{idx + 1}
              </span>
              {act}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
