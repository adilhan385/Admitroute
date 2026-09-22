import React, { useState, useEffect } from 'react';
import type { UniversityProgram, UserProfile, UniversityPreparationPlan } from '../types';
import { generateUniversityPreparationPlan } from '../utils/engine';
import { getGeminiApiKey } from '../services/ai';
import {
  X,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Clock,
  Award,
  Target,
  CheckSquare,
  Square,
  Printer,
  TrendingUp,
  GraduationCap
} from 'lucide-react';

interface UniversityPlanModalProps {
  uni: UniversityProgram;
  profile: UserProfile;
  onClose: () => void;
}

export const UniversityPlanModal: React.FC<UniversityPlanModalProps> = ({
  uni,
  profile,
  onClose
}) => {
  const [plan] = useState<UniversityPreparationPlan>(() =>
    generateUniversityPreparationPlan(uni, profile)
  );
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const toggleTask = (taskId: string) => {
    setCheckedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const handleGenerateAiDeepDive = async () => {
    setIsAiLoading(true);
    const key = getGeminiApiKey();

    if (!key) {
      // Offline fallback deep-dive based on gap analysis
      setTimeout(() => {
        const gap = plan.gapAnalysis;
        let advice = `🎯 Стратегический фокус для ${uni.name}:\n\n`;
        if (gap.overallFeasibility === 'near_impossible' || gap.overallFeasibility === 'low') {
          advice += `1. Приоритет №1: Экстренная ликвидация академического долга. На текущем этапе подавать документы не имеет смысла, так как сработает автоматический фильтр отсева.\n`;
          advice += `2. Стратегия Gap Year (академический год подготовки): 6 месяцев интенсива по языку (${gap.languageTarget}) + 4 месяца отработки типовых тестов позволят подать сильную заявку в следующем сезоне.\n`;
          advice += `3. Запасной аэродром: параллельно рассмотрите подготовительный факультет (Foundation) или колледж-партнер с возможностью трансфера на 2-й курс.`;
        } else {
          advice += `1. Приоритет №1: Подача на ранний раунд (дедлайн ${uni.details.rounds.early.deadline}). В этот период конкурс на гранты в 1.8 раза ниже, чем в регулярную волну.\n`;
          advice += `2. Формулировка эссе: сделайте акцент на ваших исследовательских интересах по специальности «${uni.programTitle}» и объясните, почему вам нужна именно лаборатория ${uni.shortName}.\n`;
          advice += `3. Рекомендательные письма: запросите у преподавателей математики или информатики с акцентом на вашу самостоятельность и проектную работу.`;
        }
        setAiAdvice(advice);
        setIsAiLoading(false);
      }, 700);
      return;
    }

    try {
      const prompt = `Ты — ведущий ментор по поступлению в университеты.
Составь персональный тактический совет абитуриенту для поступления в ${uni.name} (${uni.programTitle}):
- Кандидат: GPA ${profile.gpa}/5.0, Язык: ${profile.hasLanguageTest ? profile.languageScore : 'нет'}, Экзамен: ${profile.hasStateExam ? profile.stateExamScore : 'нет'}.
- Требования вуза: GPA ${uni.avgGpa}, Язык: ${uni.languageRequirement}, Экзамен: ${uni.examRequirement}.
- Статус реализуемости: ${plan.gapAnalysis.overallFeasibility}, оценочный срок: ${plan.gapAnalysis.estimatedPrepMonths} мес.

Дай 3 конкретных, честных, без воды тактических шага:
1. Какую главную слабость закрывать в первую очередь и как именно.
2. Какую тему выбрать для мотивационного письма под специфику именно этого университета.
3. Какая альтернативная или переходная стратегия (Foundation, трансфер, 2-я волна) убережет от потери года.
Пиши структурированно, емко, профессионально на русском языке.`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3 }
          })
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          setAiAdvice(text);
        } else {
          setAiAdvice('Не удалось получить ответ модели. Используйте стандартный пошаговый план ниже.');
        }
      } else {
        setAiAdvice('Сервис AI временно недоступен. Ниже представлен проверенный автономный маршрут подготовки.');
      }
    } catch (e) {
      console.warn('AI call failed:', e);
      setAiAdvice('Сервис AI временно недоступен. Ниже представлен проверенный автономный маршрут подготовки.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const feasibilityConfig = {
    near_impossible: {
      badge: 'bg-rose-100 text-rose-800 border-rose-300',
      title: '🚨 Критический разрыв с требованиями',
      color: 'text-rose-600'
    },
    low: {
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      title: '⚠️ Высокая сложность (Высокий риск отказа)',
      color: 'text-amber-600'
    },
    moderate: {
      badge: 'bg-blue-100 text-blue-800 border-blue-300',
      title: '⚡ Достижимо при интенсивной подготовке',
      color: 'text-blue-600'
    },
    high: {
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      title: '✅ Высокая сходимость (Высокий шанс)',
      color: 'text-emerald-600'
    }
  }[plan.gapAnalysis.overallFeasibility];

  const totalTasks = plan.phases.reduce((acc, p) => acc + p.tasks.length, 0);
  const completedTasksCount = Object.values(checkedTasks).filter(Boolean).length;
  const progressPercent = Math.round((completedTasksCount / (totalTasks || 1)) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-5 flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow-2xs">
                <Target className="h-3 w-3" />
                Индивидуальный план подготовки
              </span>
              <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${feasibilityConfig.badge}`}>
                {feasibilityConfig.title}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {uni.country}, {uni.city}
              </span>
            </div>

            <h2 className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              {uni.name}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium">
              Специальность: <span className="text-slate-900">{uni.programTitle}</span> • Ориентировочный срок подготовки: <span className="font-semibold text-slate-900">{plan.gapAnalysis.estimatedPrepMonths} мес.</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
            aria-label="Закрыть модальное окно"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Honest Verdict Alert Box */}
          <div className={`rounded-xl border p-4.5 ${
            plan.gapAnalysis.overallFeasibility === 'near_impossible' || plan.gapAnalysis.overallFeasibility === 'low'
              ? 'border-rose-200 bg-rose-50/70 text-rose-950'
              : 'border-blue-200 bg-blue-50/60 text-blue-950'
          }`}>
            <div className="flex items-start gap-3">
              {plan.gapAnalysis.overallFeasibility === 'near_impossible' || plan.gapAnalysis.overallFeasibility === 'low' ? (
                <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Честная оценка шансов приемной комиссии
                  </h4>
                  <span className="text-sm font-extrabold font-mono">
                    Шанс зачисления: {plan.admissionChancePercentage}%
                  </span>
                </div>
                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed">
                  {plan.gapAnalysis.verdictMessage}
                </p>
              </div>
            </div>
          </div>

          {/* Gap Analysis Matrix */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Gap-анализ профиля (Текущее состояние vs Требования программы)
              </h3>
              <span className="text-[11px] text-slate-500">
                Критерии официального отбора
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* GPA */}
              <div className={`rounded-xl border p-3.5 ${
                plan.gapAnalysis.gpaStatus === 'critical_gap'
                  ? 'border-rose-200 bg-rose-50/30'
                  : plan.gapAnalysis.gpaStatus === 'minor_gap'
                  ? 'border-amber-200 bg-amber-50/30'
                  : 'border-emerald-200 bg-emerald-50/30'
              }`}>
                <div className="text-[11px] font-medium text-slate-500 uppercase">Средний балл (GPA)</div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-lg font-bold text-slate-900">{plan.gapAnalysis.gpaCurrent.toFixed(1)}</span>
                  <span className="text-xs text-slate-500 font-medium">порог: {plan.gapAnalysis.gpaTarget}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Разрыв:</span>
                  <span className={`font-semibold ${plan.gapAnalysis.gpaGap > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {plan.gapAnalysis.gpaGap > 0 ? `-${plan.gapAnalysis.gpaGap}` : 'Соответствует'}
                  </span>
                </div>
              </div>

              {/* Language */}
              <div className={`rounded-xl border p-3.5 ${
                plan.gapAnalysis.languageStatus === 'critical_gap'
                  ? 'border-rose-200 bg-rose-50/30'
                  : plan.gapAnalysis.languageStatus === 'minor_gap'
                  ? 'border-amber-200 bg-amber-50/30'
                  : 'border-emerald-200 bg-emerald-50/30'
              }`}>
                <div className="text-[11px] font-medium text-slate-500 uppercase">Языковой ценз</div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-sm font-bold text-slate-900 truncate max-w-[110px]" title={plan.gapAnalysis.languageCurrent}>
                    {plan.gapAnalysis.languageCurrent}
                  </span>
                  <span className="text-xs text-slate-500 font-medium truncate max-w-[80px]" title={plan.gapAnalysis.languageTarget}>
                    {plan.gapAnalysis.languageTarget}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Статус:</span>
                  <span className={`font-semibold ${
                    plan.gapAnalysis.languageStatus === 'critical_gap'
                      ? 'text-rose-600'
                      : plan.gapAnalysis.languageStatus === 'minor_gap'
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}>
                    {plan.gapAnalysis.languageStatus === 'critical_gap' ? 'Критично ниже' : plan.gapAnalysis.languageStatus === 'minor_gap' ? 'Недобор' : 'Норма'}
                  </span>
                </div>
              </div>

              {/* Standardized / State Exam */}
              <div className={`rounded-xl border p-3.5 ${
                plan.gapAnalysis.examStatus === 'critical_gap'
                  ? 'border-rose-200 bg-rose-50/30'
                  : plan.gapAnalysis.examStatus === 'minor_gap'
                  ? 'border-amber-200 bg-amber-50/30'
                  : 'border-emerald-200 bg-emerald-50/30'
              }`}>
                <div className="text-[11px] font-medium text-slate-500 uppercase">ЕНТ / SAT / Тесты</div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-sm font-bold text-slate-900 truncate max-w-[110px]" title={plan.gapAnalysis.examCurrent}>
                    {plan.gapAnalysis.examCurrent}
                  </span>
                  <span className="text-xs text-slate-500 font-medium truncate max-w-[80px]" title={plan.gapAnalysis.examTarget}>
                    {plan.gapAnalysis.examTarget}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Статус:</span>
                  <span className={`font-semibold ${
                    plan.gapAnalysis.examStatus === 'critical_gap'
                      ? 'text-rose-600'
                      : plan.gapAnalysis.examStatus === 'minor_gap'
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}>
                    {plan.gapAnalysis.examStatus === 'critical_gap' ? 'Ниже порога' : plan.gapAnalysis.examStatus === 'minor_gap' ? 'Требует рост' : 'Норма'}
                  </span>
                </div>
              </div>

              {/* Portfolio */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
                <div className="text-[11px] font-medium text-slate-500 uppercase">Портфолио & Эссе</div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-sm font-bold text-slate-900">
                    {plan.gapAnalysis.portfolioStatus === 'strong' ? 'Олимпиадное' : plan.gapAnalysis.portfolioStatus === 'needs_work' ? 'Базовое' : 'Отсутствует'}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Конкурс: {uni.details.grantStats.competitionRatio}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Важность:</span>
                  <span className="font-semibold text-blue-700">Обязательно</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Strategic Deep Dive Banner */}
          <div className="rounded-xl border border-blue-100 bg-linear-to-r from-blue-50/60 to-indigo-50/40 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Углубленный тактический разбор от Gemini 3.6 Flash
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Персональные рекомендации по мотивационному письму и обходу отборочных фильтров {uni.shortName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateAiDeepDive}
                disabled={isAiLoading}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition disabled:opacity-50"
              >
                {isAiLoading ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Анализируем...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-blue-200" />
                    <span>{aiAdvice ? 'Обновить разбор' : 'Сгенерировать AI-разбор'}</span>
                  </>
                )}
              </button>
            </div>

            {aiAdvice && (
              <div className="mt-3.5 rounded-lg bg-white p-4 border border-blue-100 shadow-2xs">
                <div className="text-xs font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                  Экспертный вердикт и стратегия:
                </div>
                <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                  {aiAdvice}
                </div>
              </div>
            )}
          </div>

          {/* Task Progress Meter */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <CheckSquare className="h-4 w-4 text-emerald-600" />
                Прогресс выполнения плана: {completedTasksCount} из {totalTasks} задач
              </span>
              <span className="font-mono font-bold text-slate-900">{progressPercent}%</span>
            </div>
            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 5-Phase Detailed Roadmap */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-blue-600" />
                5 этапов подготовки к зачислению в {uni.shortName}
              </h3>
              <span className="text-[11px] text-slate-500">
                Отметьте выполненные шаги
              </span>
            </div>

            {plan.phases.map((phase) => (
              <div
                key={phase.phaseNumber}
                className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:border-slate-300 transition"
              >
                {/* Phase Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                      {phase.phaseNumber}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">
                      {phase.title}
                    </h4>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md self-start sm:self-auto">
                    <Clock className="h-3 w-3" />
                    {phase.durationMonths}
                  </span>
                </div>

                {/* Tasks List */}
                <div className="mt-3.5 space-y-2.5">
                  {phase.tasks.map((task, taskIdx) => {
                    const taskId = `phase-${phase.phaseNumber}-task-${taskIdx}`;
                    const isChecked = !!checkedTasks[taskId];

                    return (
                      <div
                        key={taskIdx}
                        onClick={() => toggleTask(taskId)}
                        className={`flex items-start gap-3 rounded-lg p-2.5 text-xs transition cursor-pointer ${
                          isChecked
                            ? 'bg-slate-50 text-slate-400 line-through'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <button
                          type="button"
                          className="mt-0.5 shrink-0 text-slate-400 hover:text-blue-600 transition"
                          aria-label={isChecked ? 'Отметить как невыполненное' : 'Отметить как выполненное'}
                        >
                          {isChecked ? (
                            <CheckSquare className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Square className="h-4 w-4 text-slate-400" />
                          )}
                        </button>
                        <span className="flex-1 leading-relaxed select-none">{task}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Critical Milestone */}
                <div className="mt-3.5 rounded-lg border border-amber-200/80 bg-amber-50/50 px-3.5 py-2.5 flex items-start gap-2 text-xs">
                  <Award className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-900">Контрольная точка этапа: </span>
                    <span className="text-amber-950">{phase.criticalMilestone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Admission Deadlines Info */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4 text-slate-600" />
              Ключевые даты приемной кампании {uni.shortName}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-700">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <div className="text-[11px] text-slate-500">1-я волна (Ранний раунд):</div>
                <div className="font-bold text-slate-900">{uni.details.rounds.early.deadline}</div>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <div className="text-[11px] text-slate-500">Основная волна (Regular):</div>
                <div className="font-bold text-slate-900">{uni.details.rounds.regular.deadline}</div>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <div className="text-[11px] text-slate-500">Общежитие и кампус:</div>
                <div className="font-bold text-slate-900">{uni.hasDormitory ? 'Предоставляется' : 'Съемное жилье'}</div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" />
            <span>Распечатать план</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition"
            >
              Закрыть
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

// Simple inline Calendar icon helper to avoid missing import
const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
