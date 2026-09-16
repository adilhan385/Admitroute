import { useState, useEffect } from 'react';
import type { UserProfile, RoadmapStep } from './types';
import { calculateDiagnosis, recommendUniversities, generateRoadmap } from './utils/engine';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Questionnaire } from './components/Questionnaire';
import { DiagnosticCard } from './components/DiagnosticCard';
import { Recommendations } from './components/Recommendations';
import { ComparisonModal } from './components/ComparisonModal';
import { RoadmapTimeline } from './components/RoadmapTimeline';
import { NextActionBanner } from './components/NextActionBanner';
import { Sparkles, SlidersHorizontal } from 'lucide-react';

const STORAGE_KEY_PROFILE = 'admitroute_profile_v1';
const STORAGE_KEY_ROADMAP = 'admitroute_roadmap_v1';

export const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);
  const [roadmap, setRoadmap] = useState<RoadmapStep[]>([]);

  // When profile updates, update roadmap and save to localStorage
  useEffect(() => {
    if (profile) {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
      const generated = generateRoadmap(profile);
      setRoadmap(generated);
    } else {
      localStorage.removeItem(STORAGE_KEY_PROFILE);
      localStorage.removeItem(STORAGE_KEY_ROADMAP);
    }
  }, [profile]);

  // Handle questionnaire submit
  const handleProfileSubmit = (newProfile: UserProfile) => {
    setProfile(newProfile);
    setIsEditing(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Preset scenarios for Jury testing
  const handlePresetSelect = (presetKey: 'kz_tech' | 'intl_cs' | 'kz_grant') => {
    let chosenProfile: UserProfile;

    if (presetKey === 'kz_tech') {
      chosenProfile = {
        name: 'Данияр',
        grade: 'grade_11',
        field: 'cs_it',
        gpa: 4.7,
        hasLanguageTest: true,
        languageScore: 'IELTS 6.5',
        hasStateExam: true,
        stateExamScore: 'ЕНТ 115 / 140',
        targetRegion: 'kazakhstan',
        budget: 'full_grant',
        targetYear: '2026'
      };
    } else if (presetKey === 'intl_cs') {
      chosenProfile = {
        name: 'Амина',
        grade: 'grade_10',
        field: 'cs_it',
        gpa: 4.9,
        hasLanguageTest: true,
        languageScore: 'IELTS 7.5',
        hasStateExam: true,
        stateExamScore: 'SAT 1420',
        targetRegion: 'europe',
        budget: 'full_grant',
        targetYear: '2027'
      };
    } else {
      chosenProfile = {
        name: 'Ернар',
        grade: 'grade_11',
        field: 'engineering',
        gpa: 4.2,
        hasLanguageTest: false,
        languageScore: '',
        hasStateExam: true,
        stateExamScore: 'ЕНТ 98 / 140',
        targetRegion: 'kazakhstan',
        budget: 'full_grant',
        targetYear: '2026'
      };
    }

    setProfile(chosenProfile);
    setIsEditing(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset all
  const handleReset = () => {
    setProfile(null);
    setIsEditing(false);
    setSelectedForCompare([]);
    localStorage.removeItem(STORAGE_KEY_PROFILE);
    localStorage.removeItem(STORAGE_KEY_ROADMAP);
  };

  // Compare toggles
  const handleToggleCompare = (id: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  };

  const handleRemoveFromCompare = (id: string) => {
    setSelectedForCompare((prev) => prev.filter((item) => item !== id));
  };

  // Toggle roadmap step completion
  const handleToggleStep = (stepId: string) => {
    setRoadmap((prev) =>
      prev.map((step) =>
        step.id === stepId ? { ...step, completed: !step.completed } : step
      )
    );
  };

  // Complete next step from banner
  const handleCompleteNextStep = (stepId: string) => {
    handleToggleStep(stepId);
  };

  // Calculated properties
  const diagnosis = profile ? calculateDiagnosis(profile) : null;
  const recommendedUnis = profile ? recommendUniversities(profile) : [];
  const nextUnfinishedStep = roadmap.find((s) => !s.completed) || null;
  const comparedUniversities = recommendedUnis.filter((u) =>
    selectedForCompare.includes(u.id)
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      {/* Header */}
      <Header onReset={handleReset} hasProfile={!!profile} />

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {!profile && !isEditing ? (
          <Hero
            onStart={() => setIsEditing(true)}
            onPresetSelect={handlePresetSelect}
          />
        ) : isEditing ? (
          <div className="space-y-6">
            <div className="text-center">
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Этап 02: Анкета профиля абитуриента</span>
              </span>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Настройка критериев поступления
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Заполните данные для генерации персонализированного маршрута
              </p>
            </div>

            <Questionnaire
              initialProfile={profile}
              onSubmit={handleProfileSubmit}
              onCancel={profile ? () => setIsEditing(false) : undefined}
            />
          </div>
        ) : (
          /* FULL SCENARIO DASHBOARD (Stages 3 to 7) */
          <div className="space-y-10">
            {/* Quick interactive banner to adjust inputs (Demonstrates Reactivity for Jury) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">
                    Маршрут построен под: {profile?.name} • {profile?.targetYear} г.
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    GPA: {profile?.gpa.toFixed(1)} | Экзамен: {profile?.hasStateExam ? profile.stateExamScore : 'Не указан'} | Регион: {profile?.targetRegion}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
                  <span>Скорректировать ответы</span>
                </button>
              </div>
            </div>

            {/* STAGE 7 (Prominent on top): Next Immediate Action */}
            <NextActionBanner
              nextStep={nextUnfinishedStep}
              onCompleteNextStep={handleCompleteNextStep}
              onEditProfile={() => setIsEditing(true)}
            />

            {/* STAGE 3: Profile Diagnostic */}
            {diagnosis && profile && (
              <DiagnosticCard
                diagnosis={diagnosis}
                profile={profile}
                onEditProfile={() => setIsEditing(true)}
              />
            )}

            {/* STAGE 4: University Recommendations (Target, Reach, Safety) */}
            <Recommendations
              universities={recommendedUnis}
              selectedForCompare={selectedForCompare}
              onToggleCompare={handleToggleCompare}
              onOpenCompareModal={() => setIsCompareOpen(true)}
            />

            {/* STAGE 6: Chronological Roadmap */}
            <RoadmapTimeline
              steps={roadmap}
              onToggleStep={handleToggleStep}
            />

            {/* STAGE 5: Comparison Modal */}
            <ComparisonModal
              isOpen={isCompareOpen}
              onClose={() => setIsCompareOpen(false)}
              selectedPrograms={comparedUniversities}
              onRemoveFromCompare={handleRemoveFromCompare}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-xs text-slate-500 sm:flex-row sm:px-6">
          <div>
            <span className="font-semibold text-slate-800">AdmitRoute</span> — LOCUS Startup Hackathon 2026 (Кейс 02)
          </div>
          <div className="flex items-center gap-4">
            <span>Код сабмита: <code className="font-mono font-medium text-slate-700">LOCUSCASE2</code></span>
            <span>•</span>
            <span>Дедлайн: 19 сентября 12:00</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
