import React, { useState } from 'react';
import type { ApplicationTracker, UniversityProgram } from '../types';
import { updateApplicationStage } from '../services/retention';

interface Props {
  selectedPrograms: UniversityProgram[];
  applications: ApplicationTracker[];
  onRefreshApplications: () => void;
  onBadgeEarned?: (badgeTitle: string) => void;
}

const STAGES_CONFIG = [
  { key: 'questionnaire', label: 'Анкета вуза', icon: '📝' },
  { key: 'essay', label: 'Мотивационное эссе', icon: '✍️' },
  { key: 'recommendations', label: 'Рекомендации', icon: '💌' },
  { key: 'tests_sent', label: 'Баллы ЕНТ / IELTS', icon: '📊' },
  { key: 'submitted', label: 'Заявка подана', icon: '🚀' },
  { key: 'decision', label: 'Решение комиссии', icon: '🎓' }
];

export const ApplicationTrackerKanban: React.FC<Props> = ({
  selectedPrograms,
  applications,
  onRefreshApplications,
  onBadgeEarned
}) => {
  const [updatingStage, setUpdatingStage] = useState<string | null>(null);

  if (selectedPrograms.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-500 shadow-sm">
        <p className="text-3xl mb-3">🏛️</p>
        <h4 className="text-base font-semibold text-slate-800 mb-1">Список программ пуст</h4>
        <p className="text-sm">Выберите целевые университеты в результатах подбора, чтобы отслеживать этапы подачи документов.</p>
      </div>
    );
  }

  const handleStageStatusChange = async (
    program: UniversityProgram,
    stageKey: string,
    newStatus: string
  ) => {
    const stageId = `${program.id}-${stageKey}`;
    setUpdatingStage(stageId);

    const res = await updateApplicationStage({
      programId: program.id,
      programName: program.name,
      country: program.country,
      stageKey,
      status: newStatus
    });

    setUpdatingStage(null);

    if (res.success) {
      onRefreshApplications();
      if (res.newBadgeEarned && onBadgeEarned) {
        onBadgeEarned('🚀 Первая заявка официально подана!');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>📋</span> Канбан-трекер статуса подачи документов
          </h3>
          <p className="text-xs text-slate-500">
            Контролируйте каждый этап по каждой выбранной программе — от черновика эссе до официального зачисления.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {selectedPrograms.map(uni => {
          const tracker = applications.find(a => a.programId === uni.id);
          const stages = tracker?.stages || {};

          // Count completed stages
          const completedStagesCount = STAGES_CONFIG.filter(
            s => stages[s.key]?.status === 'completed' || stages[s.key]?.status === 'accepted'
          ).length;
          const progressPercent = Math.round((completedStagesCount / STAGES_CONFIG.length) * 100);

          return (
            <div
              key={uni.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5"
            >
              {/* Program Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                    {uni.shortName.slice(0, 3)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                      {uni.name}
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <span>{uni.programTitle}</span>
                      <span>•</span>
                      <span>{uni.country}, {uni.city}</span>
                      <span>•</span>
                      <span className="font-medium text-blue-600">Дедлайн: {uni.applicationDeadline}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-700">Готовность: {progressPercent}%</span>
                    <div className="w-24 h-2 bg-slate-100 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      tracker?.status === 'accepted'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : tracker?.status === 'submitted'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {tracker?.status === 'accepted'
                      ? '🎉 Зачислен'
                      : tracker?.status === 'submitted'
                      ? '🚀 Документы поданы'
                      : tracker?.status === 'rejected'
                      ? 'Отклонено'
                      : 'В процессе подготовки'}
                  </span>
                </div>
              </div>

              {/* 6 Stages Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {STAGES_CONFIG.map(stage => {
                  const stageData = stages[stage.key];
                  const currentStatus = stageData?.status || 'not_started';
                  const isUpdating = updatingStage === `${uni.id}-${stage.key}`;

                  const isDone = currentStatus === 'completed' || currentStatus === 'accepted';
                  const isInProgress = currentStatus === 'in_progress';

                  return (
                    <div
                      key={stage.key}
                      className={`p-3 rounded-xl border text-xs transition-all ${
                        isDone
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                          : isInProgress
                          ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                          : 'bg-slate-50/70 border-slate-200/80 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-base">{stage.icon}</span>
                        {isDone && <span className="text-emerald-600 font-bold">✓</span>}
                      </div>

                      <div className="font-semibold mb-2 truncate" title={stage.label}>
                        {stage.label}
                      </div>

                      {stage.key === 'decision' ? (
                        <select
                          value={currentStatus}
                          disabled={isUpdating}
                          onChange={e => handleStageStatusChange(uni, stage.key, e.target.value)}
                          aria-label={`Статус решения комиссии для ${uni.name}`}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="not_started">Ожидается</option>
                          <option value="pending">На рассмотрении</option>
                          <option value="accepted">🎉 Принят!</option>
                          <option value="waitlist">Лист ожидания</option>
                          <option value="rejected">Отказ</option>
                        </select>
                      ) : (
                        <select
                          value={currentStatus}
                          disabled={isUpdating}
                          onChange={e => handleStageStatusChange(uni, stage.key, e.target.value)}
                          aria-label={`Статус этапа ${stage.label} для ${uni.name}`}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="not_started">Не начато</option>
                          <option value="in_progress">В процессе</option>
                          <option value="completed">Готово ✓</option>
                        </select>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
