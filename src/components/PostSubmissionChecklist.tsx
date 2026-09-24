import React, { useState } from 'react';
import type { PostSubmissionChecklistItem } from '../types';
import { DEFAULT_POST_SUBMISSION_CHECKLIST } from '../services/retention';

interface Props {
  checklist?: PostSubmissionChecklistItem[];
  onUpdateChecklist?: (updated: PostSubmissionChecklistItem[]) => void;
}

export const PostSubmissionChecklist: React.FC<Props> = ({
  checklist = DEFAULT_POST_SUBMISSION_CHECKLIST,
  onUpdateChecklist
}) => {
  const [items, setItems] = useState<PostSubmissionChecklistItem[]>(checklist);

  const handleToggle = (id: string) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setItems(updated);
    if (onUpdateChecklist) onUpdateChecklist(updated);
  };

  const completedCount = items.filter(i => i.completed).length;
  const progressPercent = Math.round((completedCount / items.length) * 100);

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'visa':
        return { label: 'Виза', color: 'bg-indigo-100 text-indigo-800' };
      case 'housing':
        return { label: 'Жильё', color: 'bg-amber-100 text-amber-800' };
      case 'enrollment':
        return { label: 'Зачисление', color: 'bg-emerald-100 text-emerald-800' };
      case 'medical':
        return { label: 'Здоровье', color: 'bg-rose-100 text-rose-800' };
      case 'logistics':
        return { label: 'Перелёт', color: 'bg-sky-100 text-sky-800' };
      default:
        return { label: 'Этап', color: 'bg-slate-100 text-slate-800' };
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-3xl border border-blue-100 p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-100/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Пост-подача: Ожидание решений и зачисление
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Контрольный чек-лист шагов после того, как все заявки в вузы официально отправлены.
          </p>
        </div>

        <div className="text-right flex items-center gap-3">
          <div>
            <div className="text-xs font-bold text-slate-800">
              Выполнено: {completedCount} из {items.length} ({progressPercent}%)
            </div>
            <div className="w-28 h-2 bg-slate-100 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map(item => {
          const badge = getCategoryBadge(item.category);
          return (
            <div
              key={item.id}
              onClick={() => handleToggle(item.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                item.completed
                  ? 'bg-emerald-50/60 border-emerald-200/90 text-emerald-950'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => handleToggle(item.id)}
                className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badge.color}`}>
                    {badge.label}
                  </span>
                  {item.deadline && (
                    <span className="text-[11px] font-semibold text-slate-500">
                      до {item.deadline}
                    </span>
                  )}
                </div>
                <h4 className={`text-xs font-bold ${item.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
