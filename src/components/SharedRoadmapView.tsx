import React, { useEffect, useState } from 'react';
import { fetchPublicSharedData } from '../services/retention';

interface Props {
  shareToken: string;
  onExit: () => void;
}

export const SharedRoadmapView: React.FC<Props> = ({ shareToken, onExit }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      const result = await fetchPublicSharedData(shareToken);
      if (!isMounted) return;
      if (!result) {
        setError('Ссылка доступа недействительна или была отозвана абитуриентом.');
      } else {
        setData(result);
      }
      setLoading(false);
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [shareToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-600">Загрузка дорожной карты поступления...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-slate-200/80 space-y-4">
          <div className="text-4xl">🔒</div>
          <h3 className="text-lg font-bold text-slate-900">Доступ недоступен</h3>
          <p className="text-xs text-slate-500">{error || 'Не удалось загрузить данные'}</p>
          <button
            onClick={onExit}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
          >
            Перейти на главную AdmitRoute
          </button>
        </div>
      </div>
    );
  }

  const completedRoadmapCount = (data.roadmap || []).filter((s: any) => s.completed).length;
  const roadmapTotal = (data.roadmap || []).length;
  const roadmapPercent = roadmapTotal > 0 ? Math.round((completedRoadmapCount / roadmapTotal) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Read-only Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white py-3 px-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">👁️</span>
            <span className="font-semibold">Гостевой режим для родителей и ментора</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-mono">Только чтение</span>
          </div>
          <button
            onClick={onExit}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition"
          >
            Выйти на главную
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Header Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Дорожная карта поступления {data.targetYear}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Абитуриент: {data.studentName}
            </h1>
            <p className="text-xs text-slate-500">
              Специальность: <span className="font-semibold text-slate-700">{data.targetField || 'Не указана'}</span> • Индекс готовности: <span className="font-bold text-emerald-600">{data.overallReadinessScore}%</span>
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-700">Прогресс Roadmap</div>
              <div className="text-2xl font-black text-blue-600">{roadmapPercent}%</div>
              <div className="text-[11px] text-slate-400">{completedRoadmapCount} из {roadmapTotal} шагов</div>
            </div>
          </div>
        </div>

        {/* Selected Universities */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>🏛️</span> Выбранные университеты и программы ({data.selectedPrograms?.length || 0})
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(data.selectedPrograms || []).map((uni: any) => (
              <div
                key={uni.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    {uni.country}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1.5 leading-snug">{uni.name}</h3>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="text-slate-500">Шансы поступления:</span>
                  <span className="font-bold text-emerald-600">{uni.admissionChancePercentage || 75}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Roadmap Steps */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>📅</span> Контрольные этапы и дедлайны
          </h2>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm divide-y divide-slate-100">
            {(data.roadmap || []).map((step: any) => (
              <div key={step.id} className="py-3 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 text-base ${step.completed ? 'text-emerald-500' : 'text-slate-300'}`}>
                    {step.completed ? '✓' : '○'}
                  </span>
                  <div>
                    <h4 className={`text-xs font-bold ${step.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {step.title}
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono">Дедлайн: {step.deadlineDate}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${step.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                  {step.completed ? 'Выполнено' : 'В процессе'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
