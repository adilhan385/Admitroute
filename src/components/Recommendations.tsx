import { useState } from 'react';
import type { UniversityProgram, MatchCategory } from '../types';
import { Target, ExternalLink, Check, Scale, Award, FileText, Info, AlertTriangle, RefreshCw, Sparkles, Loader2 } from 'lucide-react';

interface RecommendationsProps {
  universities: UniversityProgram[];
  selectedForCompare: string[];
  onToggleCompare: (id: string) => void;
  onOpenCompareModal: () => void;
  onOpenEssayModal?: (uni: UniversityProgram) => void;
  onSelectUniversity?: (uni: UniversityProgram) => void;
  onRefreshVariants?: () => void;
  onRequestAiVariants?: () => void;
  isAiGenerating?: boolean;
}

export const Recommendations: React.FC<RecommendationsProps> = ({
  universities,
  selectedForCompare,
  onToggleCompare,
  onOpenCompareModal,
  onOpenEssayModal,
  onSelectUniversity,
  onRefreshVariants,
  onRequestAiVariants,
  isAiGenerating
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
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
            <Award className="h-3 w-3" />
            <span>Reach (Амбициозный)</span>
          </span>
        );
      case 'safety':
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
            <Check className="h-3 w-3" />
            <span>Safety (Надежный)</span>
          </span>
        );
      case 'unlikely':
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
            <AlertTriangle className="h-3 w-3" />
            <span>Маловероятно (Высокий риск)</span>
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
            Честная оценка шансов без завышений: Target, Safety и Reach с дедлайнами 3 волн
          </p>
        </div>

        {/* Action Buttons: Refresh, AI, Filter, Compare */}
        <div className="flex flex-wrap items-center gap-2">
          {onRefreshVariants && (
            <button
              type="button"
              onClick={onRefreshVariants}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
              title="Показать другие подходящие варианты из базы"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Обновить список</span>
            </button>
          )}

          {onRequestAiVariants && (
            <button
              type="button"
              onClick={onRequestAiVariants}
              disabled={isAiGenerating}
              className="inline-flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-100 disabled:opacity-50 transition"
              title="Сгенерировать свежие варианты через Gemini AI"
            >
              {isAiGenerating ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin text-purple-600" />
                  <span>Поиск ИИ...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 text-purple-600" />
                  <span>Варианты через ИИ</span>
                </>
              )}
            </button>
          )}

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
              onClick={() => setFilterCategory('safety')}
              className={`rounded-md px-2.5 py-1 transition ${
                filterCategory === 'safety'
                  ? 'bg-slate-900 text-white'
                  : 'hover:text-slate-900'
              }`}
            >
              Safety
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
          const chance = uni.admissionChancePercentage ?? uni.matchScore;

          return (
            <div
              key={uni.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition hover:border-slate-300 hover:shadow-sm"
            >
              <div>
                {/* Badges row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getCategoryBadge(uni.matchCategory)}
                    <span
                      className={`rounded-md border px-2 py-0.5 text-xs font-mono font-medium ${
                        chance >= 70
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : chance >= 40
                          ? 'border-blue-200 bg-blue-50 text-blue-700'
                          : chance >= 20
                          ? 'border-amber-200 bg-amber-50 text-amber-700'
                          : 'border-rose-200 bg-rose-50 text-rose-700'
                      }`}
                    >
                      Шанс: {chance}%
                    </span>
                    {uni.isAiGenerated && (
                      <span className="rounded-md border border-purple-200 bg-purple-50 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700">
                        ИИ-подбор
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {uni.city}, {uni.country}
                  </span>
                </div>

                {/* Clickable Title & Program */}
                <div
                  onClick={() => onSelectUniversity && onSelectUniversity(uni)}
                  className="mt-4 cursor-pointer group"
                  title="Нажмите для открытия всех деталей вуза"
                >
                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-700 transition flex items-center justify-between">
                    <span>{uni.name}</span>
                    <Info className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition shrink-0 ml-2" />
                  </h3>
                  <p className="mt-0.5 text-xs font-medium text-blue-700">
                    {uni.programTitle}
                  </p>
                </div>

                {/* REALITY CHECK ALERT (if exists) */}
                {uni.realityCheckWarning && (
                  <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                    <div className="text-[11px] leading-relaxed text-rose-700">
                      <strong>Предупреждение приемной комиссии:</strong> {uni.realityCheckWarning}
                    </div>
                  </div>
                )}

                {/* 3 Application Waves Strip */}
                <div className="mt-3.5 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <strong>Ранняя подача:</strong>
                    </span>
                    <span className="font-mono text-slate-600">{uni.details.rounds.early.deadline}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      <strong>Основная подача:</strong>
                    </span>
                    <span className="font-mono text-slate-600">{uni.details.rounds.regular.deadline}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <strong>Поздний добор:</strong>
                    </span>
                    <span className="font-mono text-slate-600">{uni.details.rounds.late.deadline}</span>
                  </div>
                </div>

                {/* Last year grants banner */}
                <div className="mt-2.5 rounded-xl border border-blue-100 bg-blue-50/40 p-2.5 text-[11px] text-blue-950">
                  <span className="font-semibold block text-blue-800">
                    Гранты и проходной порог прошлого года:
                  </span>
                  <p className="mt-0.5 text-slate-700">
                    {uni.details.grantStats.lastYearCutoff} • {uni.details.grantStats.lastYearGrantsCount}
                  </p>
                </div>

                {/* Why it fits */}
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

                  <button
                    type="button"
                    onClick={() => onSelectUniversity && onSelectUniversity(uni)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                    title="Открыть все раунды подачи и детали кампуса"
                  >
                    <Info className="h-3.5 w-3.5 text-slate-500" />
                    <span>Все детали</span>
                  </button>

                  {onOpenEssayModal && (
                    <button
                      type="button"
                      onClick={() => onOpenEssayModal(uni)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                      title="Сгенерировать структуру мотивационного письма"
                    >
                      <FileText className="h-3.5 w-3.5 text-blue-600" />
                      <span className="hidden sm:inline">План эссе</span>
                    </button>
                  )}
                </div>

                <a
                  href={uni.officialSiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition"
                >
                  <span>Сайт</span>
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
