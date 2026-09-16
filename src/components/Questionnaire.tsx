import { useState } from 'react';
import type { UserProfile, StudyGrade, FieldOfInterest, TargetRegion, BudgetTier } from '../types';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';

interface QuestionnaireProps {
  initialProfile?: UserProfile | null;
  onSubmit: (profile: UserProfile) => void;
  onCancel?: () => void;
}

export const Questionnaire: React.FC<QuestionnaireProps> = ({
  initialProfile,
  onSubmit,
  onCancel
}) => {
  const [step, setStep] = useState<number>(1);

  const [formData, setFormData] = useState<UserProfile>(
    initialProfile || {
      name: 'Абитуриент',
      grade: 'grade_11',
      field: 'cs_it',
      gpa: 4.6,
      hasLanguageTest: true,
      languageScore: 'IELTS 6.5',
      hasStateExam: true,
      stateExamScore: 'ЕНТ 114 / 140',
      targetRegion: 'kazakhstan',
      budget: 'full_grant',
      targetYear: '2026'
    }
  );

  const totalSteps = 3;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onSubmit(formData);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    } else if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Шаг {step} из {totalSteps}</span>
          <span>
            {step === 1 && 'Базовый профиль и интерес'}
            {step === 2 && 'Успеваемость и экзамены'}
            {step === 3 && 'География, бюджет и сроки'}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-slate-900 transition-all duration-300 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: Basic Profile & Field */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Ваше имя или никнейм
            </label>
            <div className="mt-2 relative">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-900 transition focus:border-slate-400 focus:bg-white focus:outline-none"
                placeholder="Например: Адиль"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Текущий класс / Статус обучения
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { key: 'grade_9', label: '9 класс' },
                { key: 'grade_10', label: '10 класс' },
                { key: 'grade_11', label: '11 класс' },
                { key: 'graduate', label: 'Выпускник' }
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFormData({ ...formData, grade: item.key as StudyGrade })}
                  className={`flex items-center justify-center rounded-xl border py-2.5 px-3 text-xs font-medium transition ${
                    formData.grade === item.key
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Желаемое направление обучения
            </label>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[
                { key: 'cs_it', label: 'IT, Программирование & AI', desc: 'Computer Science, Кибербезопасность' },
                { key: 'engineering', label: 'Инженерия & Робототехника', desc: 'Мехатроника, Энергетика, Автоматизация' },
                { key: 'business_econ', label: 'Бизнес, Финансы & Менеджмент', desc: 'Экономика, FinTech, Международный бизнес' },
                { key: 'medicine_bio', label: 'Медицина & Биотехнологии', desc: 'Общая медицина, Фармация, Биоинженерия' },
                { key: 'design_media', label: 'Дизайн & Цифровые медиа', desc: 'UI/UX, Геймдев, Графика, Архитектура' },
                { key: 'social_law', label: 'Право & Международные отношения', desc: 'Юриспруденция, Дипломатия, Политология' }
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFormData({ ...formData, field: item.key as FieldOfInterest })}
                  className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                    formData.field === item.key
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-semibold">{item.label}</span>
                  <span
                    className={`mt-0.5 text-[11px] ${
                      formData.field === item.key ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Academic Profile & Tests */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Средний балл аттестата (GPA)
              </label>
              <span className="text-sm font-semibold text-slate-900 font-mono">
                {formData.gpa.toFixed(1)} / 5.0
              </span>
            </div>
            <input
              type="range"
              min="3.0"
              max="5.0"
              step="0.1"
              value={formData.gpa}
              onChange={(e) => setFormData({ ...formData, gpa: parseFloat(e.target.value) })}
              className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-slate-900"
            />
            <div className="mt-1 flex justify-between text-[11px] text-slate-500">
              <span>3.0 (Удовлетворительно)</span>
              <span>4.0 (Хорошо)</span>
              <span>5.0 (Отлично)</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-900">Языковой сертификат (IELTS / TOEFL)</span>
                <p className="text-[11px] text-slate-500">Имеется ли официальное подтверждение знания языка?</p>
              </div>
              <input
                type="checkbox"
                checked={formData.hasLanguageTest}
                onChange={(e) => setFormData({ ...formData, hasLanguageTest: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
            </div>
            {formData.hasLanguageTest && (
              <div className="mt-3">
                <input
                  type="text"
                  value={formData.languageScore}
                  onChange={(e) => setFormData({ ...formData, languageScore: e.target.value })}
                  placeholder="Например: IELTS 6.5 или Duolingo 115"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
                />
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-900">Государственный экзамен (ЕНТ / SAT)</span>
                <p className="text-[11px] text-slate-500">Есть ли сданный пробный или итоговый результат?</p>
              </div>
              <input
                type="checkbox"
                checked={formData.hasStateExam}
                onChange={(e) => setFormData({ ...formData, hasStateExam: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
            </div>
            {formData.hasStateExam && (
              <div className="mt-3">
                <input
                  type="text"
                  value={formData.stateExamScore}
                  onChange={(e) => setFormData({ ...formData, stateExamScore: e.target.value })}
                  placeholder="Например: ЕНТ 114 баллов или SAT 1320"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: Geography, Budget & Timing */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Целевой регион поступления
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                { key: 'kazakhstan', label: 'Казахстан', desc: 'Астана, Алматы (гос. гранты РК)' },
                { key: 'europe', label: 'Европа', desc: 'Германия, Италия, стипендии DSU/DAAD' },
                { key: 'asia', label: 'Восточная Азия', desc: 'Южная Корея, Китай, гранты KAIST' },
                { key: 'usa', label: 'США & Канада', desc: 'Финансовая помощь, стипендии' }
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFormData({ ...formData, targetRegion: item.key as TargetRegion })}
                  className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                    formData.targetRegion === item.key
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-semibold">{item.label}</span>
                  <span
                    className={`mt-0.5 text-[11px] ${
                      formData.targetRegion === item.key ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Финансовый бюджет семьи на обучение
            </label>
            <div className="mt-2 space-y-2">
              {[
                { key: 'full_grant', label: 'Только 100% грант / полная стипендия', desc: 'Обучение за счет государства или фонда без оплаты за контракт' },
                { key: 'low_cost', label: 'До 1 500 000 ₸ (~$3 000) в год', desc: 'Допустимы умеренные платные программы или частичные гранты' },
                { key: 'any', label: 'Без строгих ограничений по бюджету', desc: 'Фокус исключительно на престиже вуза и карьерных перспективах' }
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFormData({ ...formData, budget: item.key as BudgetTier })}
                  className={`w-full flex items-center justify-between rounded-xl border p-3.5 text-left transition ${
                    formData.budget === item.key
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <span className="text-xs font-semibold">{item.label}</span>
                    <p
                      className={`text-[11px] ${
                        formData.budget === item.key ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {item.desc}
                    </p>
                  </div>
                  {formData.budget === item.key && <Check className="h-4 w-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Год планируемого поступления
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {['2026', '2027'].map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => setFormData({ ...formData, targetYear: year })}
                  className={`flex items-center justify-center rounded-xl border py-2.5 text-xs font-semibold transition ${
                    formData.targetYear === year
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Осень {year} года
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={handlePrev}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{step === 1 ? 'Отмена' : 'Назад'}</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-slate-800 transition"
        >
          <span>{step === totalSteps ? 'Сформировать маршрут' : 'Продолжить'}</span>
          {step === totalSteps ? <Sparkles className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
};
