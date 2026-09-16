import { useState } from 'react';
import type { UniversityProgram, MatchCategory } from '../types';
import { Target, ExternalLink, Check, Scale, Award, FileText } from 'lucide-react';

interface RecommendationsProps {
  universities: UniversityProgram[];
  selectedForCompare: string[];
  onToggleCompare: (id: string) => void;
  onOpenCompareModal: () => void;
  onOpenEssayModal?: (uni: UniversityProgram) => void;
}

export const Recommendations: React.FC<RecommendationsProps> = ({
  universities,
  selectedForCompare,
  onToggleCompare,
  onOpenCompareModal,
  onOpenEssayModal
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredUnis = universities.filter((u) => {
    if (filterCategory === 'all') return true;
    return u.matchCategory === filterCategory;
  });

  const getCategoryBadge = (category: MatchCategory) => {
    switch (category) {
      case 'target':
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
            <Target className="h-3 w-3" />
            <span>Target (Основная цель)</span>
          </span>
        );
      case 'reach':
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800">
            <Award className="h-3 w-3" />
            <span>Reach (Амбициозный вариант)</span>
          </span>
        );
      case 'safety':
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
            <Check className="h-3 w-3" />
            <span>Safety (Страховочный вариант)</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              Этап 04: Персональный подбор программ
            </span>
          </div>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Рекомендованные университеты и программы
          </h2>
          <p className="text-xs text-slate-500">
            Сбалансированная стратегия поступления с распределением по вероятности и обоснованием
          </p>
        </div>

        {/* Filter Chips & Compare CTA */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 text-xs font-medium text-slate-600 shadow-xs">
            <button
              type="button"
              onClick={() => setFilterCategory('all')}
              className={`rounded-md px-2.5 py-1 transition ${
                filterCategory === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'hover:text-slate-900'
              }`}
            >
              Все ({universities.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('target')}
              className={`rounded-md px-2.5 py-1 transition ${
                filterCategory === 'target'
                  ? 'bg-slate-900 text-white'
                  : 'hover:text-slate-900'
              }`}
            >
              Target
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('reach')}
              className={`rounded-md px-2.5 py-1 transition ${
                filterCategory === 'reach'
                  ? 'bg-slate-900 text-white'
                  : 'hover:text-slate-900'
              }`}
            >
              Reach
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('safety')}
              className={`rounded-md px-2.5 py-1 transition ${
                filterCategory === 'safety'
                  ? 'bg-slate-900 text-white'
                  : 'hover:text-slate-900'
              }`}
            >
              Safety
            </button>
          </div>

          {selectedForCompare.length > 0 && (
            <button
              type="button"
              onClick={onOpenCompareModal}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-blue-700 transition"
            >
              <Scale className="h-3.5 w-3.5" />
              <span>Сравнить ({selectedForCompare.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* University Cards Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {filteredUnis.map((uni) => {
          const isCompared = selectedForCompare.includes(uni.id);

          return (
            <div
              key={uni.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition hover:border-slate-300"
            >
              <div>
                {/* Badges row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getCategoryBadge(uni.matchCategory)}
                    <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-mono font-medium text-slate-600">
                      Совпадение: {uni.matchScore}%
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {uni.city}, {uni.country}
                  </span>
                </div>

                {/* Title */}
                <div className="mt-4">
                  <h3 className="text-base font-semibold text-slate-900">
                    {uni.name}
                  </h3>
                  <p className="mt-0.5 text-xs font-medium text-blue-700">
                    {uni.programTitle}
                  </p>
                </div>

                {/* Key Metrics Grid */}
                <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-500">Экзамены:</span>
                    <p className="font-medium text-slate-800 line-clamp-1">{uni.examRequirement}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500">Языковые требования:</span>
                    <p className="font-medium text-slate-800 line-clamp-1">{uni.languageRequirement}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500">Финансирование:</span>
                    <p className="font-medium text-slate-800 line-clamp-1">{uni.scholarshipAvailability}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500">Дедлайн подачи:</span>
                    <p className="font-medium text-slate-800 font-mono">{uni.applicationDeadline}</p>
                  </div>
                </div>

                {/* Why it fits (Human explanation - Case requirement!) */}
                <div className="mt-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Почему подходит именно вам:
                  </span>
                  <ul className="mt-2 space-y-1.5">
                    {uni.whyFits.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleCompare(uni.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                      isCompared
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Scale className="h-3.5 w-3.5" />
                    <span>{isCompared ? 'В сравнении' : 'К сравнению'}</span>
                  </button>

                  {onOpenEssayModal && (
                    <button
                      type="button"
                      onClick={() => onOpenEssayModal(uni)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                      title="Сгенерировать структуру мотивационного письма"
                    >
                      <FileText className="h-3.5 w-3.5 text-blue-600" />
                      <span>План эссе</span>
                    </button>
                  )}
                </div>

                <a
                  href={uni.officialSiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition"
                >
                  <span>Официальный сайт</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
