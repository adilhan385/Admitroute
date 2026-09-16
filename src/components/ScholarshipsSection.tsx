import React, { useState } from 'react';
import { SCHOLARSHIPS_DATABASE } from '../data/scholarships';
import { Award, ExternalLink, Calendar } from 'lucide-react';

export const ScholarshipsSection: React.FC = () => {
  const [regionFilter, setRegionFilter] = useState<'all' | 'kazakhstan' | 'abroad'>('all');

  const filtered = SCHOLARSHIPS_DATABASE.filter((item) => {
    if (regionFilter === 'all') return true;
    if (regionFilter === 'kazakhstan') return item.region === 'kazakhstan';
    return item.region !== 'kazakhstan';
  });

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              <Award className="h-3 w-3" />
              <span>Каталог финансирования</span>
            </span>
          </div>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">
            Подходящие государственные и международные стипендии
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Программы полного и частичного покрытия стоимости обучения и проживания
          </p>
        </div>

        {/* Region Filter Buttons */}
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 text-xs font-medium text-slate-600 shadow-xs">
          <button
            type="button"
            onClick={() => setRegionFilter('all')}
            className={`rounded-md px-3 py-1 transition ${
              regionFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'hover:text-slate-900'
            }`}
          >
            Все
          </button>
          <button
            type="button"
            onClick={() => setRegionFilter('kazakhstan')}
            className={`rounded-md px-3 py-1 transition ${
              regionFilter === 'kazakhstan'
                ? 'bg-slate-900 text-white'
                : 'hover:text-slate-900'
            }`}
          >
            Казахстан
          </button>
          <button
            type="button"
            onClick={() => setRegionFilter('abroad')}
            className={`rounded-md px-3 py-1 transition ${
              regionFilter === 'abroad'
                ? 'bg-slate-900 text-white'
                : 'hover:text-slate-900'
            }`}
          >
            Зарубежье
          </button>
        </div>
      </div>

      {/* Grid of Scholarships */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/40 p-5 transition hover:border-slate-300 hover:bg-white"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-medium text-blue-700 uppercase tracking-wider">
                  {item.organization}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                  <Calendar className="h-3 w-3" />
                  {item.deadline}
                </span>
              </div>

              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                {item.title}
              </h3>

              <div className="mt-3 rounded-lg border border-emerald-200/80 bg-emerald-50/50 p-2.5 text-xs text-emerald-900">
                <strong className="font-semibold block text-[11px] uppercase tracking-wider text-emerald-800">
                  Покрытие:
                </strong>
                {item.coverage}
              </div>

              <div className="mt-3 text-xs text-slate-600">
                <strong className="font-semibold block text-[11px] uppercase tracking-wider text-slate-500 mb-0.5">
                  Кто может претендовать:
                </strong>
                {item.eligibility}
              </div>
            </div>

            <div className="mt-5 border-t border-slate-200/60 pt-3">
              <a
                href={item.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 transition"
              >
                <span>Официальные правила конкурса</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
