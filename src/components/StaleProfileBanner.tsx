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
    <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white rounded-2xl p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5">⚠️</span>
        <div>
          <h4 className="font-bold text-sm sm:text-base">
            Ваш академический профиль не обновлялся {daysSinceUpdate} дней
          </h4>
          <p className="text-xs text-amber-100 mt-0.5 leading-relaxed">
            Вузы обновляют проходные баллы и конкурс на гранты. Проверьте актуальность вашего GPA, IELTS/ЕНТ, чтобы алгоритм скоринга показывал точные шансы поступления.
          </p>
        </div>
      </div>

      <button
        onClick={onEditProfile}
        className="px-4 py-2 bg-white hover:bg-amber-50 text-amber-900 rounded-xl text-xs font-bold transition whitespace-nowrap shadow-sm self-start sm:self-center"
      >
        Обновить данные профиля →
      </button>
    </div>
  );
};
