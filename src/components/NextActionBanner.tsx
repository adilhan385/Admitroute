import type { RoadmapStep } from '../types';
import { CheckCircle2, Clock, SlidersHorizontal } from 'lucide-react';

interface NextActionBannerProps {
  nextStep: RoadmapStep | null;
  onCompleteNextStep: (id: string) => void;
  onEditProfile: () => void;
}

export const NextActionBanner: React.FC<NextActionBannerProps> = ({
  nextStep,
  onCompleteNextStep,
  onEditProfile
}) => {
  if (!nextStep) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 sm:p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-lg font-semibold text-emerald-950">
          Все ключевые шаги дорожной карты выполнены!
        </h3>
        <p className="mx-auto mt-1 max-w-md text-xs text-emerald-800">
          Вы закрыли все запланированные этапы подготовки. Проверьте статус зачисления в личных кабинетах университетов.
        </p>
        <button
          type="button"
          onClick={onEditProfile}
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-900 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-emerald-800 transition"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Пересчитать маршрут для новых целей</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-slate-900 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        {/* Left Side Info */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-0.5 text-xs font-semibold text-white">
              <Clock className="h-3.5 w-3.5 text-blue-400" />
              <span>Этап 07: Ближайшее действие</span>
            </span>
            <span className="text-xs font-mono font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
              Срок: до {nextStep.deadlineDate}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
              {nextStep.title}
            </h3>
            <p className="mt-1 max-w-2xl text-xs sm:text-sm text-slate-600 leading-relaxed">
              {nextStep.description}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col gap-2.5 sm:flex-row lg:flex-col shrink-0">
          <button
            type="button"
            onClick={() => onCompleteNextStep(nextStep.id)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-slate-800 transition"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Отметить как выполненное</span>
          </button>

          <button
            type="button"
            onClick={onEditProfile}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
            <span>Изменить вводные данные</span>
          </button>
        </div>
      </div>
    </div>
  );
};
