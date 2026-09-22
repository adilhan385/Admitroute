import type { ProfileDiagnosis, UserProfile } from '../types';
import { AlertCircle, Target, CheckCircle2, SlidersHorizontal, AlertTriangle, ShieldAlert } from 'lucide-react';

interface DiagnosticCardProps {
  diagnosis: ProfileDiagnosis;
  profile: UserProfile;
  onEditProfile: () => void;
}

export const DiagnosticCard: React.FC<DiagnosticCardProps> = ({
  diagnosis,
  profile,
  onEditProfile
}) => {
  const readiness = diagnosis.overallReadinessScore;
  const level = diagnosis.readinessLevel || (readiness < 25 ? 'critical' : readiness < 55 ? 'low' : readiness < 75 ? 'moderate' : 'high');

  const levelBadgeConfig = {
    critical: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      meterColor: 'text-rose-600',
      label: 'Критический риск'
    },
    low: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      meterColor: 'text-amber-600',
      label: 'Низкая готовность'
    },
    moderate: {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      meterColor: 'text-blue-600',
      label: 'Базовая готовность'
    },
    high: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      meterColor: 'text-emerald-600',
      label: 'Высокая готовность'
    }
  }[level];

  const hasNoStrengths = diagnosis.strengths.length === 1 && diagnosis.strengths[0].includes('отсутствуют');

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-8">
      {/* Top Bar with Readiness Score */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              Этап 03: Диагностика профиля
            </span>
            <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${levelBadgeConfig.bg}`}>
              {levelBadgeConfig.label}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ID: {profile.name} • {profile.targetYear} г.
            </span>
          </div>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">
            Аналитическое резюме кандидата
          </h2>
          <p className="mt-1 text-xs text-slate-600 max-w-xl leading-relaxed">
            {diagnosis.summary}
          </p>
        </div>

        {/* Readiness Meter */}
        <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 sm:text-right">
          <div>
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Индекс готовности
            </div>
            <div className={`text-2xl font-bold tracking-tight ${levelBadgeConfig.meterColor}`}>
              {readiness}%
            </div>
          </div>
          <button
            type="button"
            onClick={onEditProfile}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 transition"
            title="Изменить ответы для пересчета маршрута"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
            <span>Изменить</span>
          </button>
        </div>
      </div>

      {/* Critical Warnings Banner */}
      {diagnosis.criticalWarnings && diagnosis.criticalWarnings.length > 0 && (
        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50/80 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-800 uppercase tracking-wider">
            <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
            <span>Критические барьеры допуска к конкурсу</span>
          </div>
          <ul className="mt-2.5 space-y-1.5">
            {diagnosis.criticalWarnings.map((warning, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs font-medium text-rose-900">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Primary Goal Banner */}
      <div className="mt-5 rounded-xl border border-slate-200/70 bg-slate-50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Сформулированная образовательная цель
            </span>
            <p className="mt-0.5 text-sm font-medium text-slate-900">
              {diagnosis.primaryGoal}
            </p>
          </div>
        </div>
      </div>

      {/* Strengths and Risk Factors Grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Strengths / Growth Zone */}
        {hasNoStrengths ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>Зона роста (Конкурентные преимущества)</span>
            </div>
            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              {diagnosis.strengths[0]}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Сильные стороны и конкурентные преимущества</span>
            </div>
            <ul className="mt-3 space-y-2">
              {diagnosis.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risk Factors / Bottlenecks */}
        <div className="rounded-xl border border-amber-100 bg-amber-50/30 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span>Факторы риска и ключевые ограничения</span>
          </div>
          <ul className="mt-3 space-y-2">
            {diagnosis.riskFactors.map((risk, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
