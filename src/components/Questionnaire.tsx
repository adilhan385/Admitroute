import { useState } from 'react';
import type { UserProfile, StudyGrade, FieldOfInterest, TargetRegion, BudgetTier, GpaScale } from '../types';
import { ArrowLeft, ArrowRight, Check, Sparkles, Plus, Award, Globe, BookOpen } from 'lucide-react';

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
      gpaScale: '5.0',
      hasLanguageTest: true,
      languageScore: 'IELTS 6.5',
      hasStateExam: true,
      stateExamScore: 'ЕНТ 114 / 140',
      hasSat: false,
      satScore: 'SAT 1380 / 1600',
      targetRegion: 'kazakhstan',
      budget: 'full_grant',
      targetYear: '2026'
    }
  );

  // Local helper states for exam selectors
  const [gpaScale, setGpaScale] = useState<GpaScale>(formData.gpaScale || '5.0');

  const [langType, setLangType] = useState<'ielts' | 'toefl' | 'duolingo' | 'cefr'>(() => {
    const raw = (formData.languageScore || '').toLowerCase();
    if (raw.includes('toefl')) return 'toefl';
    if (raw.includes('duo') || raw.includes('det')) return 'duolingo';
    if (raw.includes('b1') || raw.includes('b2') || raw.includes('c1') || raw.includes('c2')) return 'cefr';
    return 'ielts';
  });

  const [isUntEnabled, setIsUntEnabled] = useState<boolean>(() => {
    if (!formData.hasStateExam) return false;
    const raw = (formData.stateExamScore || '').toLowerCase();
    return raw.includes('ент') || raw.includes('unt') || !raw.includes('sat');
  });

  const [untScore, setUntScore] = useState<number>(() => {
    const m = (formData.stateExamScore || '').match(/(?:ент|unt)?\s*([0-9]{2,3})/i);
    if (m) {
      const val = parseInt(m[1], 10);
      if (val >= 50 && val <= 140) return val;
    }
    return 114;
  });

  const [isSatEnabled, setIsSatEnabled] = useState<boolean>(() => {
    if (formData.hasSat) return true;
    const raw = (formData.stateExamScore || '').toLowerCase();
    return raw.includes('sat');
  });

  const [satScore, setSatScore] = useState<number>(() => {
    const raw = formData.satScore || formData.stateExamScore || '';
    const m = raw.match(/sat\s*([0-9]{3,4})/i) || raw.match(/([0-9]{4})/);
    if (m) {
      const val = parseInt(m[1], 10);
      if (val >= 800 && val <= 1600) return val;
    }
    return 1380;
  });

  const totalSteps = 3;

  // Handle GPA Scale toggle
  const handleScaleChange = (newScale: GpaScale) => {
    if (newScale === gpaScale) return;
    setGpaScale(newScale);
    if (newScale === '4.0') {
      // Convert from 5.0 to 4.0
      const converted = Math.max(1.5, Math.min(4.0, Number(((formData.gpa / 5.0) * 4.0).toFixed(2))));
      setFormData(prev => ({ ...prev, gpaScale: '4.0', gpa: converted }));
    } else {
      // Convert from 4.0 to 5.0
      const converted = Math.max(2.5, Math.min(5.0, Number(((formData.gpa / 4.0) * 5.0).toFixed(1))));
      setFormData(prev => ({ ...prev, gpaScale: '5.0', gpa: converted }));
    }
  };

  // Sync exams back to formData
  const updateExamScores = (untOn: boolean, untVal: number, satOn: boolean, satVal: number) => {
    let stateExamScore = 'Не сдавался';
    const hasStateExam = untOn || satOn;

    if (untOn && satOn) {
      stateExamScore = `ЕНТ ${untVal} / SAT ${satVal}`;
    } else if (untOn) {
      stateExamScore = `ЕНТ ${untVal} / 140`;
    } else if (satOn) {
      stateExamScore = `SAT ${satVal} / 1600`;
    }

    setFormData(prev => ({
      ...prev,
      hasStateExam,
      stateExamScore,
      hasSat: satOn,
      satScore: satOn ? `SAT ${satVal} / 1600` : undefined
    }));
  };

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

  // Preset lists for convenient clicking
  const gpaPresets5 = [3.0, 3.5, 4.0, 4.3, 4.5, 4.7, 4.85, 5.0];
  const gpaPresets4 = [2.5, 3.0, 3.3, 3.5, 3.7, 3.85, 4.0];

  const ieltsScores = ['5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0', '8.5', '9.0'];
  const toeflScores = ['65', '75', '85', '92', '100', '108', '115', '120'];
  const duolingoScores = ['95', '105', '115', '120', '125', '135', '145', '155'];
  const cefrScores = ['B1 (Pre-Intermediate)', 'B2 (Upper-Intermediate)', 'C1 (Advanced)', 'C2 (Fluent)'];

  const untPresets = [65, 85, 105, 114, 122, 130, 138];
  const satPresets = [1100, 1200, 1300, 1380, 1440, 1500, 1560];

  const portfolioPresets = [
    'Призер олимпиад (математика/физика)',
    'Хакатон & IT-проект в GitHub',
    '40+ часов волонтерства',
    'Дебатный клуб / лидерство',
    'КМС / спортивные победы',
    'Научное исследование / статья'
  ];

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Шаг {step} из {totalSteps}</span>
          <span>
            {step === 1 && 'Базовый профиль и интерес'}
            {step === 2 && 'Успеваемость, ЕНТ, SAT и язык'}
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

      {/* STEP 2: Academic Profile & Tests (NO-TYPE SELECTABLE SYSTEM) */}
      {step === 2 && (
        <div className="space-y-6">
          {/* 1. GPA WITH SCALE SELECTOR (4.0 vs 5.0) */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Средний балл аттестата (GPA)
                </label>
                <p className="text-[11px] text-slate-500">
                  Выберите систему оценивания и укажите ваш балл:
                </p>
              </div>

              {/* GPA Scale Toggle */}
              <div className="inline-flex rounded-xl bg-slate-200/70 p-1">
                <button
                  type="button"
                  onClick={() => handleScaleChange('5.0')}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                    gpaScale === '5.0'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Шкала 5.0 (РК / СНГ)
                </button>
                <button
                  type="button"
                  onClick={() => handleScaleChange('4.0')}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                    gpaScale === '4.0'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Шкала 4.0 (США / Global)
                </button>
              </div>
            </div>

            {/* Current Score Display */}
            <div className="mt-4 flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {gpaScale === '4.0' ? formData.gpa.toFixed(2) : formData.gpa.toFixed(1)}
                  <span className="text-sm font-medium text-slate-400"> / {gpaScale}</span>
                </span>
              </div>

              <div className="text-right">
                {gpaScale === '5.0' ? (
                  formData.gpa >= 4.7 ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                      Отлично (94%+)
                    </span>
                  ) : formData.gpa >= 4.2 ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                      Хорошо (Выше среднего)
                    </span>
                  ) : formData.gpa >= 3.5 ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                      Средний балл
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
                      Низкий балл (риск)
                    </span>
                  )
                ) : (
                  formData.gpa >= 3.8 ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                      High Honors (Топ-10%)
                    </span>
                  ) : formData.gpa >= 3.4 ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                      Honors (Хороший GPA)
                    </span>
                  ) : formData.gpa >= 2.8 ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                      Average GPA
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
                      Low GPA (риск)
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Slider */}
            <input
              type="range"
              min={gpaScale === '4.0' ? '1.5' : '2.5'}
              max={gpaScale === '4.0' ? '4.0' : '5.0'}
              step="0.05"
              value={formData.gpa}
              onChange={(e) => setFormData({ ...formData, gpa: parseFloat(e.target.value) })}
              className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-slate-900"
            />

            {/* Quick Preset Buttons */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-400">Быстрый выбор:</span>
              {(gpaScale === '5.0' ? gpaPresets5 : gpaPresets4).map((val) => {
                const isSelected = Math.abs(formData.gpa - val) < 0.03;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFormData({ ...formData, gpa: val })}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {val.toFixed(gpaScale === '4.0' ? 2 : 1)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. LANGUAGE CERTIFICATE SELECTOR (IELTS / TOEFL / DUOLINGO / CEFR) */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Языковой сертификат
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  IELTS, TOEFL, Duolingo или уровень по шкале CEFR
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasLanguageTest}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormData({
                      ...formData,
                      hasLanguageTest: checked,
                      languageScore: checked ? (formData.languageScore || 'IELTS 6.5') : 'Без теста'
                    });
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-xs font-semibold text-slate-800">Есть сертификат</span>
              </label>
            </div>

            {formData.hasLanguageTest ? (
              <div className="mt-4 space-y-3">
                {/* Exam Provider Tabs */}
                <div className="grid grid-cols-4 gap-1 rounded-xl bg-slate-200/70 p-1">
                  {[
                    { id: 'ielts', label: 'IELTS' },
                    { id: 'toefl', label: 'TOEFL iBT' },
                    { id: 'duolingo', label: 'Duolingo' },
                    { id: 'cefr', label: 'CEFR (B2/C1)' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setLangType(tab.id as any);
                        if (tab.id === 'ielts') setFormData({ ...formData, languageScore: 'IELTS 6.5' });
                        if (tab.id === 'toefl') setFormData({ ...formData, languageScore: 'TOEFL 92' });
                        if (tab.id === 'duolingo') setFormData({ ...formData, languageScore: 'Duolingo 120' });
                        if (tab.id === 'cefr') setFormData({ ...formData, languageScore: 'B2 (Upper-Intermediate)' });
                      }}
                      className={`rounded-lg py-1.5 text-center text-xs font-semibold transition ${
                        langType === tab.id
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Selected Score Highlight */}
                <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-3">
                  <span className="text-xs font-medium text-slate-500">Выбранный результат:</span>
                  <span className="text-sm font-bold text-blue-700 font-mono">
                    {formData.languageScore}
                  </span>
                </div>

                {/* Score Pills Selection */}
                <div>
                  <div className="text-[11px] font-medium text-slate-500 mb-1.5">
                    Выберите ваш балл в один клик:
                  </div>

                  {langType === 'ielts' && (
                    <div className="grid grid-cols-5 sm:grid-cols-9 gap-1.5">
                      {ieltsScores.map(score => {
                        const isSelected = formData.languageScore.includes(score);
                        return (
                          <button
                            key={score}
                            type="button"
                            onClick={() => setFormData({ ...formData, languageScore: `IELTS ${score}` })}
                            className={`rounded-lg border py-2 text-center text-xs font-bold transition ${
                              isSelected
                                ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {score}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {langType === 'toefl' && (
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                      {toeflScores.map(score => {
                        const isSelected = formData.languageScore.includes(score);
                        return (
                          <button
                            key={score}
                            type="button"
                            onClick={() => setFormData({ ...formData, languageScore: `TOEFL ${score}` })}
                            className={`rounded-lg border py-2 text-center text-xs font-bold transition ${
                              isSelected
                                ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {score}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {langType === 'duolingo' && (
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                      {duolingoScores.map(score => {
                        const isSelected = formData.languageScore.includes(score);
                        return (
                          <button
                            key={score}
                            type="button"
                            onClick={() => setFormData({ ...formData, languageScore: `Duolingo ${score}` })}
                            className={`rounded-lg border py-2 text-center text-xs font-bold transition ${
                              isSelected
                                ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {score}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {langType === 'cefr' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {cefrScores.map(score => {
                        const isSelected = formData.languageScore.includes(score.slice(0, 2));
                        return (
                          <button
                            key={score}
                            type="button"
                            onClick={() => setFormData({ ...formData, languageScore: score })}
                            className={`rounded-lg border py-2 px-2 text-center text-xs font-bold transition truncate ${
                              isSelected
                                ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {score.split(' ')[0]}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-white p-3 text-center text-xs text-slate-500">
                Языковой сертификат пока отсутствует. ИИ подберет вузы с внутренними языковыми курсами или программами на русском/казахском.
              </div>
            )}
          </div>

          {/* 3. UNT (ЕНТ КАЗАХСТАН) SELECTOR */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    ЕНТ (Казахстан)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Единое национальное тестирование для поступления в вузы РК
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUntEnabled}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsUntEnabled(checked);
                    updateExamScores(checked, untScore, isSatEnabled, satScore);
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-xs font-semibold text-slate-800">Сдаю ЕНТ</span>
              </label>
            </div>

            {isUntEnabled && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold font-mono text-slate-900">
                    {untScore} <span className="text-sm font-medium text-slate-400">/ 140 баллов</span>
                  </span>

                  <div>
                    {untScore >= 125 ? (
                      <span className="rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                        ТОП госгрант (КБТУ, МУИТ, AITU)
                      </span>
                    ) : untScore >= 105 ? (
                      <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                        Проходит на госгрант
                      </span>
                    ) : untScore >= 75 ? (
                      <span className="rounded-md bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                        Платное / Конкурс сельской квоты
                      </span>
                    ) : (
                      <span className="rounded-md bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
                        Ниже порогового балла
                      </span>
                    )}
                  </div>
                </div>

                {/* Range slider for UNT */}
                <input
                  type="range"
                  min="50"
                  max="140"
                  step="1"
                  value={untScore}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setUntScore(val);
                    updateExamScores(true, val, isSatEnabled, satScore);
                  }}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-emerald-600"
                />

                {/* Quick UNT Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-medium text-slate-400">Быстрый выбор:</span>
                  {untPresets.map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setUntScore(val);
                        updateExamScores(true, val, isSatEnabled, satScore);
                      }}
                      className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                        untScore === val
                          ? 'border-emerald-700 bg-emerald-700 text-white shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. SAT (SCHOLASTIC ASSESSMENT TEST) SELECTOR */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Экзамен SAT
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Scholastic Assessment Test для Назарбаев Университета, США, Европы и Азии
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSatEnabled}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsSatEnabled(checked);
                    updateExamScores(isUntEnabled, untScore, checked, satScore);
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-xs font-semibold text-slate-800">Сдаю SAT</span>
              </label>
            </div>

            {isSatEnabled && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold font-mono text-slate-900">
                    {satScore} <span className="text-sm font-medium text-slate-400">/ 1600 баллов</span>
                  </span>

                  <div>
                    {satScore >= 1500 ? (
                      <span className="rounded-md bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
                        Ivy League / MIT / Stanford
                      </span>
                    ) : satScore >= 1420 ? (
                      <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                        NU / Топ-50 мира / KAIST
                      </span>
                    ) : satScore >= 1250 ? (
                      <span className="rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                        Италия (DSU) / SDU / КБТУ
                      </span>
                    ) : (
                      <span className="rounded-md bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                        Базовый порог прямого зачисления
                      </span>
                    )}
                  </div>
                </div>

                {/* Range slider for SAT */}
                <input
                  type="range"
                  min="800"
                  max="1600"
                  step="10"
                  value={satScore}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setSatScore(val);
                    updateExamScores(isUntEnabled, untScore, true, val);
                  }}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-purple-600"
                />

                {/* Quick SAT Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-medium text-slate-400">Быстрый выбор:</span>
                  {satPresets.map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setSatScore(val);
                        updateExamScores(isUntEnabled, untScore, true, val);
                      }}
                      className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                        satScore === val
                          ? 'border-purple-700 bg-purple-700 text-white shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 5. PORTFOLIO & EXTRACURRICULARS */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Внеучебные активности и портфолио (Extracurriculars)
              </label>
              <span className="text-[11px] text-blue-600 font-medium">Для зарубежа и грантов</span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Нажмите на готовые достижения, чтобы добавить их, или опишите проекты своими словами:
            </p>

            {/* Quick Achievement Chips */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {portfolioPresets.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    const current = formData.portfolioText || '';
                    if (current.includes(tag)) return;
                    const updated = current ? `${current}, ${tag}` : tag;
                    setFormData({ ...formData, portfolioText: updated });
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 transition"
                >
                  <Plus className="h-3 w-3 text-blue-600" />
                  <span>{tag}</span>
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={formData.portfolioText || ''}
              onChange={(e) => setFormData({ ...formData, portfolioText: e.target.value })}
              placeholder="Например: Участвовал в городском хакатоне по AI, разработал мобильное приложение для школьной библиотеки, 1.5 года капитан дебатного клуба, 40 часов волонтерства..."
              className="mt-2.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none leading-relaxed"
            />
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
