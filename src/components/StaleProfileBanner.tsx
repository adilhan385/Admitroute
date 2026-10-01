import React from 'react';
import type { UserAccount } from '../types';
import { checkProfileStaleness } from '../services/retention';

interface Props {
  user: UserAccount | null;
  onEditProfile: () => void;
}

export const StaleProfileBanner: React.FC<Props> = ({ user, onEditProfile }) => {
  if (!user) return null;

  const { isStale, daysSinceUpdate } = checkProfileStaleness(user);
  if (!isStale) return null;

  return (
    <div className="border-l-2 border-amber-600 bg-amber-50 p-4 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5">⚠️</span>
        <div>
          <h4 className="font-bold text-sm sm:text-base">
            Ваш академический профиль не обновлялся {daysSinceUpdate} дней
          </h4>
          <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
            Вузы обновляют проходные баллы и конкурс на гранты. Проверьте актуальность вашего GPA, IELTS/ЕНТ, чтобы алгоритм скоринга показывал точные шансы поступления.
          </p>
        </div>
      </div>

      <button
        onClick={onEditProfile}
        className="border-b border-amber-700 px-1 py-2 text-amber-900 text-xs font-semibold transition whitespace-nowrap self-start sm:self-center"
      >
        Обновить данные профиля →
      </button>
    </div>
  );
};
