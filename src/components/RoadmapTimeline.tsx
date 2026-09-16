import React from 'react';
import type { RoadmapStep } from '../types';
import { CheckCircle2, Circle, Calendar, Clock, FileText, Award, BookOpen, AlertCircle } from 'lucide-react';

interface RoadmapTimelineProps {
  steps: RoadmapStep[];
  onToggleStep: (stepId: string) => void;
}

export const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({ steps, onToggleStep }) => {
  const getCategoryIcon = (category: RoadmapStep['category']) => {
    switch (category) {
      case 'exams':
        return <BookOpen className="h-3.5 w-3.5 text-blue-600" />;
      case 'documents':
        return <FileText className="h-3.5 w-3.5 text-slate-600" />;
      case 'applications':
        return <Clock className="h-3.5 w-3.5 text-emerald-600" />;
      case 'scholarship':
        return <Award className="h-3.5 w-3.5 text-amber-600" />;
      default:
        return <Calendar className="h-3.5 w-3.5 text-slate-600" />;
    }
  };

  const getCategoryName = (category: RoadmapStep['category']) => {
    switch (category) {
      case 'exams':
        return 'Экзамены и тесты';
      case 'documents':
        return 'Документы и эссе';
      case 'applications':
        return 'Подача заявок';
      case 'scholarship':
        return 'Гранты и стипендии';
      default:
        return 'Этап';
    }
  };

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100) || 0;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              Этап 06: Персональный Roadmap
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Выполнено: {completedCount} из {steps.length} ({progressPercent}%)
            </span>
          </div>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Пошаговый план и календарь дедлайнов
          </h2>
          <p className="text-xs text-slate-500">
            Хронологическая дорожная карта подготовки и подачи документов
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full sm:w-48">
          <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-1">
            <span>Прогресс маршрута</span>
            <span className="font-mono">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-slate-900 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="mt-8 relative border-l-2 border-slate-200 ml-4 space-y-8">
        {steps.map((step) => {
          return (
            <div key={step.id} className="relative pl-6 sm:pl-8">
              {/* Timeline marker */}
              <button
                type="button"
                onClick={() => onToggleStep(step.id)}
                className={`absolute -left-[17px] top-0 flex h-8 w-8 items-center justify-center rounded-full border-2 transition ${
                  step.completed
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                    : 'border-slate-300 bg-white text-slate-400 hover:border-slate-400'
                }`}
                title={step.completed ? 'Отметить как невыполненное' : 'Отметить как выполненное'}
              >
                {step.completed ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </button>

              {/* Step Card */}
              <div
                className={`rounded-xl border p-4 sm:p-5 transition ${
                  step.completed
                    ? 'border-slate-200/60 bg-slate-50/50 opacity-80'
                    : 'border-slate-200 bg-white shadow-xs'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      {getCategoryIcon(step.category)}
                      <span>{getCategoryName(step.category)}</span>
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      {step.month}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-medium text-slate-600 font-mono">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>Дедлайн: {step.deadlineDate}</span>
                  </div>
                </div>

                <h3
                  className={`mt-2 text-sm font-semibold ${
                    step.completed ? 'text-slate-600 line-through' : 'text-slate-900'
                  }`}
                >
                  {step.title}
                </h3>

                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {step.description}
                </p>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                  <button
                    type="button"
                    onClick={() => onToggleStep(step.id)}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800 transition"
                  >
                    {step.completed ? 'Отменить отметку' : 'Отметить выполнение'}
                  </button>

                  <span className="text-[11px] text-slate-400 font-mono">
                    {step.completed ? 'Статус: Выполнено' : 'Статус: Запланировано'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mandatory Disclaimer from Hackathon Brief */}
      <div className="mt-8 flex items-start gap-2.5 rounded-xl border border-slate-200/70 bg-slate-50 p-3.5 text-xs text-slate-500">
        <AlertCircle className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
        <p>
          <strong className="font-semibold text-slate-700">Официальная пометка:</strong> Все даты экзаменов, дедлайны подачи и проходные пороги носят ориентировочный и демонстрационный характер согласно правилам хакатона. Рекомендуется сверять финальные сроки с официальными правилами приемных комиссий вузов.
        </p>
      </div>
    </div>
  );
};
