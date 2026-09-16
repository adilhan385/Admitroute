import type { UniversityProgram } from '../types';
import { X, Scale, Check } from 'lucide-react';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPrograms: UniversityProgram[];
  onRemoveFromCompare: (id: string) => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  selectedPrograms,
  onRemoveFromCompare
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Scale className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                  Этап 05: Сравнительный анализ
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500">Выбрано: {selectedPrograms.length}</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                Сопоставление выбранных программ
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {selectedPrograms.length < 2 ? (
          <div className="py-12 text-center">
            <Scale className="mx-auto h-8 w-8 text-slate-300" />
            <h3 className="mt-2 text-sm font-semibold text-slate-800">
              Недостаточно программ для сравнения
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Пожалуйста, отметьте галочкой «Добавить к сравнению» минимум 2 университета в списке рекомендаций.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-slate-800 transition"
            >
              Вернуться к рекомендациям
            </button>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="w-1/4 pb-3 font-semibold uppercase tracking-wider text-slate-500">
                    Параметр
                  </th>
                  {selectedPrograms.map((prog) => (
                    <th key={prog.id} className="pb-3 px-3 font-semibold text-slate-900">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold">{prog.shortName}</div>
                          <div className="text-[11px] font-normal text-slate-500 line-clamp-1">{prog.programTitle}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveFromCompare(prog.id)}
                          className="text-slate-400 hover:text-slate-600 p-1"
                          title="Удалить из сравнения"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 font-medium text-slate-600">Стратегическая корзина</td>
                  {selectedPrograms.map((prog) => (
                    <td key={prog.id} className="py-3 px-3 font-semibold">
                      <span className="uppercase text-[11px] font-mono tracking-wide text-slate-800">
                        {prog.matchCategory}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 font-medium text-slate-600">Город и страна</td>
                  {selectedPrograms.map((prog) => (
                    <td key={prog.id} className="py-3 px-3 text-slate-700">
                      {prog.city}, {prog.country}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 font-medium text-slate-600">Экзамены и пороги</td>
                  {selectedPrograms.map((prog) => (
                    <td key={prog.id} className="py-3 px-3 text-slate-800 font-medium">
                      {prog.examRequirement}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 font-medium text-slate-600">Требования к языку</td>
                  {selectedPrograms.map((prog) => (
                    <td key={prog.id} className="py-3 px-3 text-slate-700">
                      {prog.languageRequirement}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 font-medium text-slate-600">Финансирование и гранты</td>
                  {selectedPrograms.map((prog) => (
                    <td key={prog.id} className="py-3 px-3 text-slate-900 font-medium">
                      {prog.tuitionYearKztOrUsd}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 font-medium text-slate-600">Наличие общежития</td>
                  {selectedPrograms.map((prog) => (
                    <td key={prog.id} className="py-3 px-3 text-slate-700">
                      {prog.hasDormitory ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <Check className="h-3.5 w-3.5" />
                          <span>Предоставляется</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">Нет данных</span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 font-medium text-slate-600">Дедлайн подачи заявки</td>
                  {selectedPrograms.map((prog) => (
                    <td key={prog.id} className="py-3 px-3 font-mono font-medium text-slate-900">
                      {prog.applicationDeadline}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 font-medium text-slate-600">Ориентировочная зарплата</td>
                  {selectedPrograms.map((prog) => (
                    <td key={prog.id} className="py-3 px-3 text-slate-800 font-medium">
                      {prog.avgGraduateSalary}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-medium text-white shadow-xs hover:bg-slate-800 transition"
          >
            Закрыть сравнение
          </button>
        </div>
      </div>
    </div>
  );
};
