import { useState, useMemo } from 'react';
import type { UserProfile, UniversityProgram } from '../types';
import { findUniversityByAliasOrName, searchUniversitiesWithAliases } from '../utils/universityMatcher';
import { evaluateUniversityProgram } from '../utils/engine';
import { searchOrGenerateUniversityWithAi, generateSmartFallbackUniversity } from '../services/ai';
import { checkActionAllowed, recordActionUsage } from '../services/auth';
import {
  Search,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Target,
  Award,
  Scale,
  FileText,
  Info,
  ExternalLink,
  Plus,
  Loader2
} from 'lucide-react';

interface UniversitySearchProps {
  profile: UserProfile;
  onSelectUniversity: (uni: UniversityProgram) => void;
  onOpenEssayModal?: (uni: UniversityProgram) => void;
  onOpenPlanModal?: (uni: UniversityProgram) => void;
  selectedForCompare: string[];
  onToggleCompare: (id: string) => void;
  onAddCustomUniversity?: (uni: UniversityProgram) => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onOpenSupport?: (topic?: string) => void;
  onOpenPricing?: () => void;
}

export const UniversitySearch: React.FC<UniversitySearchProps> = ({
  profile,
  onSelectUniversity,
  onOpenEssayModal,
  onOpenPlanModal,
  selectedForCompare,
  onToggleCompare,
  onAddCustomUniversity,
  onOpenAuth,
  onOpenSupport,
  onOpenPricing
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUni, setSelectedUni] = useState<UniversityProgram | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [isDropdownDismissed, setIsDropdownDismissed] = useState(false);
  const [, setUsageTick] = useState(0);

  const searchLimits = checkActionAllowed('search');

  // Popular quick-search presets with real abbreviations and international universities
  const popularPresets = [
    { label: 'SDU (СДУ)', name: 'SDU' },
    { label: 'NU (Назарбаев Ун-т)', name: 'NU' },
    { label: 'КБТУ (KBTU)', name: 'КБТУ' },
    { label: 'МУИТ (IITU)', name: 'МУИТ' },
    { label: 'AITU (Астана IT)', name: 'AITU' },
    { label: 'МГУ им. Ломоносова', name: 'МГУ' },
    { label: 'ВШЭ (Вышка)', name: 'ВШЭ' },
    { label: 'МФТИ (Физтех)', name: 'МФТИ' },
    { label: 'Harvard (Гарвард)', name: 'Harvard' },
    { label: 'MIT', name: 'MIT' },
    { label: 'Stanford (Стэнфорд)', name: 'Stanford' },
    { label: 'UniTrento (Италия)', name: 'UniTrento' },
    { label: 'KAIST (Корея)', name: 'KAIST' },
    { label: 'TUM (Германия)', name: 'TUM' },
    { label: 'Bocconi (Милан)', name: 'Bocconi' }
  ];

  // Filter local database by query with smart alias and abbreviation resolution
  const suggestions = useMemo(() => {
    return searchUniversitiesWithAliases(searchQuery, 6);
  }, [searchQuery]);

  // Handle selection from local DB
  const handleSelectFromDb = (uni: UniversityProgram) => {
    const evaluated = evaluateUniversityProgram(uni, profile);
    setSelectedUni({
      ...uni,
      matchCategory: evaluated.matchCategory,
      matchScore: evaluated.matchScore,
      admissionChancePercentage: evaluated.admissionChancePercentage,
      realityCheckWarning: evaluated.realityCheckWarning,
      whyFits: evaluated.whyFits
    });
    setIsDropdownDismissed(true);
  };

  // Handle Search submit or AI analysis
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    // Check if exact or alias match exists in verified DB
    const match = findUniversityByAliasOrName(query);

    if (match) {
      handleSelectFromDb(match);
      return;
    }

    // Otherwise trigger dynamic search
    await handleAiSearch(query);
  };

  const handleAiSearch = async (query: string) => {
    const limits = checkActionAllowed('search');
    if (!limits.allowed) {
      setIsLimitModalOpen(true);
      return;
    }
    setIsAiLoading(true);
    try {
      const result = await searchOrGenerateUniversityWithAi(query, profile);
      if (result) {
        recordActionUsage('search');
        setUsageTick(prev => prev + 1);
        setSelectedUni(result);
        if (onAddCustomUniversity) {
          onAddCustomUniversity(result);
        }
      } else {
        // Safe guaranteed fallback
        const fallback = generateSmartFallbackUniversity(query, profile);
        setSelectedUni(fallback);
        if (onAddCustomUniversity) {
          onAddCustomUniversity(fallback);
        }
      }
    } catch {
      const fallback = generateSmartFallbackUniversity(query, profile);
      setSelectedUni(fallback);
      if (onAddCustomUniversity) {
        onAddCustomUniversity(fallback);
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const isCompared = selectedUni ? selectedForCompare.includes(selectedUni.id) : false;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
              <Search className="h-3 w-3" />
              <span>Поиск любого университета в мире</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
              <Sparkles className="h-3 w-3" />
              <span>ИИ-оценка шансов</span>
            </span>
          </div>
          <h3 className="mt-1 text-base font-semibold text-slate-900">
            Проверьте шансы поступления в любой университет
          </h3>
          <p className="text-xs text-slate-500">
            Введите название любого вуза (SDU, Harvard, Тренто, МУИТ, Bocconi) — система рассчитает реальные шансы под ваш GPA и экзамены
          </p>
        </div>
      </div>

      {/* Search Input & Action */}
      <form onSubmit={handleSearchSubmit} className="mt-5 relative">
        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setIsDropdownDismissed(false);
              }}
              placeholder="Введите название любого вуза (напр. SDU, MIT, МУИТ, Университет Тренто, Bocconi)..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsDropdownDismissed(true);
                }}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isAiLoading || !searchQuery.trim()}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-slate-800 disabled:opacity-50 transition shrink-0"
          >
            {isAiLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
                <span>Анализ требований...</span>
              </>
            ) : (
              <>
                <Search className="h-3.5 w-3.5" />
                <span>Оценить шансы</span>
              </>
            )}
          </button>
        </div>

        {/* Live Suggestions Dropdown */}
        {suggestions.length > 0 && !isDropdownDismissed && (
          <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
            <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase">
              Найдено в верифицированной базе:
            </div>
            {suggestions.map(uni => (
              <button
                key={uni.id}
                type="button"
                onClick={() => {
                  handleSelectFromDb(uni);
                  setSearchQuery(uni.name);
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs hover:bg-slate-50 transition"
              >
                <div>
                  <span className="font-semibold text-slate-800">{uni.name}</span>
                  <span className="ml-1 text-[11px] text-slate-500">
                    ({uni.city}, {uni.country})
                  </span>
                </div>
                <span className="text-[11px] font-medium text-blue-600">
                  {uni.programTitle.slice(0, 30)}...
                </span>
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Popular Quick Pills */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-[11px] font-medium text-slate-400">Быстрый выбор:</span>
        {popularPresets.map(preset => (
          <button
            key={preset.name}
            type="button"
            onClick={() => {
              setSearchQuery(preset.name);
              const found = findUniversityByAliasOrName(preset.name);
              if (found) {
                handleSelectFromDb(found);
              } else {
                handleAiSearch(preset.name);
              }
            }}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-slate-300 hover:bg-white transition"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* AI Loading State */}
      {isAiLoading && (
        <div className="mt-6 rounded-2xl border border-purple-200 bg-purple-50/40 p-6 text-center">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-purple-600" />
          <h4 className="mt-2 text-xs font-semibold text-purple-900">
            ИИ анализирует требования «{searchQuery}»
          </h4>
          <p className="mt-1 text-[11px] text-purple-700">
            Сопоставление вашего GPA ({profile.gpa.toFixed(1)}), экзаменов и бюджета с реальным конкурсом и волнами подачи...
          </p>
        </div>
      )}

      {/* Evaluated University Result Card */}
      {selectedUni && !isAiLoading && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 sm:p-6">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {selectedUni.matchCategory === 'target' && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    <Target className="h-3 w-3" />
                    <span>Target (Основная цель)</span>
                  </span>
                )}
                {selectedUni.matchCategory === 'safety' && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Safety (Надежный вариант)</span>
                  </span>
                )}
                {selectedUni.matchCategory === 'reach' && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
                    <Award className="h-3 w-3" />
                    <span>Reach (Амбициозный вариант)</span>
                  </span>
                )}
                {selectedUni.matchCategory === 'unlikely' && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-800">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Крайне маловероятно (Высокий риск)</span>
                  </span>
                )}

                {selectedUni.isAiGenerated && (
                  <span className="rounded-md border border-purple-200 bg-purple-100/70 px-2 py-0.5 text-[11px] font-semibold text-purple-800">
                    Анализ AdmitRoute AI
                  </span>
                )}
              </div>

              <h4 className="mt-2 text-lg font-bold text-slate-900">
                {selectedUni.name}
              </h4>
              <p className="text-xs font-medium text-blue-700">
                {selectedUni.programTitle} • {selectedUni.city}, {selectedUni.country}
              </p>
            </div>

            {/* Chance display */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between rounded-xl bg-white p-3 border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500">
                Персональный шанс:
              </span>
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-2xl font-extrabold ${
                    (selectedUni.admissionChancePercentage ?? 50) >= 70
                      ? 'text-emerald-600'
                      : (selectedUni.admissionChancePercentage ?? 50) >= 40
                      ? 'text-blue-600'
                      : (selectedUni.admissionChancePercentage ?? 50) >= 20
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}
                >
                  {selectedUni.admissionChancePercentage ?? selectedUni.matchScore}%
                </span>
              </div>
            </div>
          </div>

          {/* REALITY CHECK ALERT (if candidate is underqualified) */}
          {selectedUni.realityCheckWarning && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
              <div>
                <strong className="block font-semibold">Честное предупреждение (No False Hopes):</strong>
                <p className="mt-0.5 text-[11px] leading-relaxed text-rose-700">
                  {selectedUni.realityCheckWarning}
                </p>
              </div>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <span className="text-[11px] text-slate-400 block">Проходной GPA</span>
              <span className="mt-0.5 font-semibold text-slate-800">
                от {selectedUni.avgGpa.toFixed(1)} / 5.0
              </span>
              <span className="text-[10px] text-slate-500 block">
                Ваш GPA: {profile.gpa.toFixed(1)}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <span className="text-[11px] text-slate-400 block">Языковой порог</span>
              <span className="mt-0.5 font-semibold text-slate-800">
                {selectedUni.languageRequirement}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {profile.hasLanguageTest ? profile.languageScore : 'Сертификат не сдан'}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <span className="text-[11px] text-slate-400 block">Селективность</span>
              <span className="mt-0.5 font-semibold text-slate-800">
                {selectedUni.acceptanceRate} прием
              </span>
              <span className="text-[10px] text-slate-500 block">
                {selectedUni.details.grantStats.competitionRatio || 'Конкурс высокий'}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <span className="text-[11px] text-slate-400 block">Финансирование</span>
              <span className="mt-0.5 font-semibold text-slate-800">
                {selectedUni.scholarshipAvailability}
              </span>
              <span className="text-[10px] text-slate-500 block truncate">
                {selectedUni.tuitionYearKztOrUsd}
              </span>
            </div>
          </div>

          {/* 3 Waves Strip */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 text-xs space-y-2">
            <span className="font-semibold text-slate-700 text-[11px] block">
              3 раунда подачи документов:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                <span className="font-semibold text-emerald-700 block">1. Ранняя подача:</span>
                <span className="text-slate-600 block">{selectedUni.details.rounds.early.deadline}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">{selectedUni.details.rounds.early.recommendedFor}</span>
              </div>
              <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                <span className="font-semibold text-blue-700 block">2. Основной поток:</span>
                <span className="text-slate-600 block">{selectedUni.details.rounds.regular.deadline}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">{selectedUni.details.rounds.regular.recommendedFor}</span>
              </div>
              <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                <span className="font-semibold text-amber-700 block">3. Поздний добор:</span>
                <span className="text-slate-600 block">{selectedUni.details.rounds.late.deadline}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">{selectedUni.details.rounds.late.recommendedFor}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              {onOpenPlanModal && (
                <button
                  type="button"
                  onClick={() => onOpenPlanModal(selectedUni)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition shadow-2xs"
                  title="Открыть пошаговый план подготовки"
                >
                  <Target className="h-3.5 w-3.5 text-blue-400" />
                  <span>План подготовки</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onToggleCompare(selectedUni.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  isCompared
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Scale className="h-3.5 w-3.5" />
                <span>{isCompared ? 'В сравнении' : 'Добавить к сравнению'}</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectUniversity(selectedUni)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                <Info className="h-3.5 w-3.5 text-slate-500" />
                <span>Все подробности</span>
              </button>

              {onOpenEssayModal && (
                <button
                  type="button"
                  onClick={() => onOpenEssayModal(selectedUni)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  <FileText className="h-3.5 w-3.5 text-blue-600" />
                  <span>План эссе</span>
                </button>
              )}

              {onAddCustomUniversity && (
                <button
                  type="button"
                  onClick={() => onAddCustomUniversity(selectedUni)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Закрепить в рекомендациях</span>
                </button>
              )}
            </div>

            <a
              href={selectedUni.officialSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition"
            >
              <span>Официальный сайт</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}

      {/* Limit Reached Modal */}
      {isLimitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 mb-3">
              <Sparkles className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              Бесплатный лимит поиска исчерпан
            </h4>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Вы использовали доступные попытки AI-поиска ({searchLimits.currentCount} из {searchLimits.maxLimit}).
              Зарегистрируйтесь бесплатно, чтобы увеличить лимит, или оформите подписку PRO для безлимитного доступа!
            </p>

            <div className="mt-5 space-y-2">
              {onOpenAuth && (
                <button
                  type="button"
                  onClick={() => {
                    setIsLimitModalOpen(false);
                    onOpenAuth('register');
                  }}
                  className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
                >
                  Создать бесплатный аккаунт (расширить лимит)
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsLimitModalOpen(false);
                  if (onOpenPricing) {
                    onOpenPricing();
                  } else if (onOpenSupport) {
                    onOpenSupport('PRO');
                  }
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
              >
                Сравнить тарифы и оформить PRO
              </button>

              <button
                type="button"
                onClick={() => setIsLimitModalOpen(false)}
                className="text-[11px] text-slate-400 hover:text-slate-600 pt-1 block mx-auto"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
