import { useState, useEffect } from 'react';
import type { UserProfile, RoadmapStep, UniversityProgram, EssayDraft } from './types';
import { calculateDiagnosis, recommendUniversities, generateRoadmap, evaluateUniversityProgram } from './utils/engine';
import { evaluatePortfolio } from './utils/portfolioEvaluator';
import { exportRoadmapToIcs } from './utils/calendar';
import { generateEssayStructure, generateAiUniversityRecommendations } from './services/ai';
import { UNIVERSITIES_DATABASE } from './data/universities';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Questionnaire } from './components/Questionnaire';
import { DiagnosticCard } from './components/DiagnosticCard';
import { PortfolioAuditCard } from './components/PortfolioAuditCard';
import { UniversitySearch } from './components/UniversitySearch';
import { Recommendations } from './components/Recommendations';
import { ComparisonModal } from './components/ComparisonModal';
import { RoadmapTimeline } from './components/RoadmapTimeline';
import { ScholarshipsSection } from './components/ScholarshipsSection';
import { NextActionBanner } from './components/NextActionBanner';
import { EssayAssistantModal } from './components/EssayAssistantModal';
import { UniversityDetailModal } from './components/UniversityDetailModal';
import { UniversityPlanModal } from './components/UniversityPlanModal';
import { AuthModal } from './components/AuthModal';
import { LiveChatWidget } from './components/LiveChatWidget';
import { AdminPanel } from './components/AdminPanel';
import { PricingModal } from './components/PricingModal';
import { getCurrentUser, logout as authLogout, getSiteSettings, recordActionUsage, saveUserProfileForUser } from './services/auth';
import type { UserAccount, SiteSettings } from './types';
import { Bell } from 'lucide-react';
import { Sparkles, SlidersHorizontal } from 'lucide-react';

const STORAGE_KEY_PROFILE = 'admitroute_profile_v1';
const STORAGE_KEY_ROADMAP = 'admitroute_roadmap_v1';

export const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);
  const [roadmap, setRoadmap] = useState<RoadmapStep[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ROADMAP);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Diversity & AI Recommendations state
  const [customUniversities, setCustomUniversities] = useState<UniversityProgram[]>([]);
  const [shuffleSeed, setShuffleSeed] = useState<number>(0);
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);

  // University Detail Modal state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedDetailUni, setSelectedDetailUni] = useState<UniversityProgram | null>(null);

  // University Preparation Plan state
  const [selectedPlanUni, setSelectedPlanUni] = useState<UniversityProgram | null>(null);

  // Essay Assistant state
  const [isEssayModalOpen, setIsEssayModalOpen] = useState<boolean>(false);
  const [essayTargetUni, setEssayTargetUni] = useState<UniversityProgram | null>(null);
  const [essayDraft, setEssayDraft] = useState<EssayDraft | null>(null);

  // Authentication and Roles State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);
  const [supportTopic, setSupportTopic] = useState<string>('PRO');
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(false);
  const [adminInitialTab, setAdminInitialTab] = useState<'users' | 'messages' | 'settings'>('users');
  const [adminInitialThreadId, setAdminInitialThreadId] = useState<string | undefined>(undefined);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState<boolean>(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => getSiteSettings());

  // Listen to live chat and auth updates (e.g. when admin activates PRO)
  useEffect(() => {
    const handleSync = () => {
      setCurrentUser(getCurrentUser());
      setSiteSettings(getSiteSettings());
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('admitroute_chat_update', handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('admitroute_chat_update', handleSync);
    };
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleOpenSupport = (topic: string = 'PRO') => {
    setSupportTopic(topic);
    setIsSupportModalOpen(true);
  };

  const handleOpenAdmin = (tab: 'users' | 'messages' | 'settings' = 'users', threadId?: string) => {
    setAdminInitialTab(tab);
    setAdminInitialThreadId(threadId);
    setIsAdminPanelOpen(true);
  };

  const handleLogout = () => {
    authLogout();
    setCurrentUser(null);
    setIsAdminPanelOpen(false);
  };

  // When profile updates, save to localStorage
  useEffect(() => {
    if (profile) {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    } else {
      localStorage.removeItem(STORAGE_KEY_PROFILE);
      localStorage.removeItem(STORAGE_KEY_ROADMAP);
    }
  }, [profile]);

  // Handle questionnaire submit
  const handleProfileSubmit = (newProfile: UserProfile) => {
    recordActionUsage('recalculation');
    setProfile(newProfile);
    setRoadmap(generateRoadmap(newProfile));
    setIsEditing(false);
    setCustomUniversities([]);
    if (currentUser) {
      saveUserProfileForUser(currentUser.id, newProfile);
      setCurrentUser(getCurrentUser());
    }
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
        targetYear: '2026',
        portfolioText: '2 место на городском хакатоне по веб-разработке, создал Telegram-бота расписания для лицея (300 пользователей), капитан школьного IT-клуба, 25 часов волонтерства на выставке робототехники.'
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
        targetYear: '2027',
        portfolioText: 'Призер областной олимпиады по информатике, разработала открытый AI-проект по анализу данных на GitHub (45 звёзд), 2 года капитан школьного дебатного клуба, организатор благотворительной IT-ярмарки.'
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
        targetYear: '2026',
        portfolioText: 'Участник школьного кружка моделирования и робототехники, помогал в оцифровке архивов школьной библиотеки.'
      };
    }

    setProfile(chosenProfile);
    setRoadmap(generateRoadmap(chosenProfile));
    setIsEditing(false);
    setCustomUniversities([]);
    if (currentUser) {
      saveUserProfileForUser(currentUser.id, chosenProfile);
      setCurrentUser(getCurrentUser());
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset all
  const handleReset = () => {
    setProfile(null);
    setRoadmap([]);
    setIsEditing(false);
    setSelectedForCompare([]);
    setCustomUniversities([]);
    setShuffleSeed(0);
    localStorage.removeItem(STORAGE_KEY_PROFILE);
    localStorage.removeItem(STORAGE_KEY_ROADMAP);
  };

  // Export to calendar
  const handleExportCalendar = () => {
    if (profile && roadmap.length > 0) {
      exportRoadmapToIcs(roadmap, profile.name);
    }
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

  // Open Essay Structure modal
  const handleOpenEssayModal = async (uni: UniversityProgram) => {
    if (!profile) return;
    setEssayTargetUni(uni);
    setIsEssayModalOpen(true);
    const draft = await generateEssayStructure(uni, profile);
    setEssayDraft(draft);
  };

  // Open University Preparation Plan modal
  const handleOpenPlanModal = (uni: UniversityProgram) => {
    setSelectedPlanUni(uni);
  };

  // Rotation / Refresh handler
  const handleRefreshVariants = () => {
    setShuffleSeed(prev => prev + 1);
  };

  // Request fresh AI recommendations via Gemini
  const handleRequestAiVariants = async () => {
    if (!profile) return;
    setIsAiGenerating(true);
    try {
      const existingIds = [
        ...customUniversities.map(u => u.id),
        ...UNIVERSITIES_DATABASE.map(u => u.id)
      ];
      const aiUnis = await generateAiUniversityRecommendations(profile, existingIds);
      if (aiUnis && aiUnis.length > 0) {
        setCustomUniversities(prev => [...aiUnis, ...prev]);
      }
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Add custom university from Search component
  const handleAddCustomUniversity = (uni: UniversityProgram) => {
    setCustomUniversities(prev => [uni, ...prev.filter(u => u.id !== uni.id)]);
  };

  // Calculated properties
  const diagnosis = profile ? calculateDiagnosis(profile) : null;
  const portfolioAudit = profile ? evaluatePortfolio(profile) : null;

  // Base recommendations with anti-illusion calculation and rotation
  const baseRecommendedUnis = profile ? recommendUniversities(profile, { shuffleSeed }) : [];
  const recommendedUnis = [
    ...customUniversities,
    ...baseRecommendedUnis.filter(b => !customUniversities.some(c => c.id === b.id))
  ];

  const nextUnfinishedStep = roadmap.find((s) => !s.completed) || null;

  // Build compared list from all possible sources (recommended, custom, or full DB)
  const comparedUniversities = selectedForCompare
    .map(id => {
      const foundInRec = recommendedUnis.find(u => u.id === id);
      if (foundInRec) return foundInRec;
      const foundInDb = UNIVERSITIES_DATABASE.find(u => u.id === id);
      if (foundInDb && profile) {
        const ev = evaluateUniversityProgram(foundInDb, profile);
        return {
          ...foundInDb,
          matchCategory: ev.matchCategory,
          matchScore: ev.matchScore,
          admissionChancePercentage: ev.admissionChancePercentage,
          realityCheckWarning: ev.realityCheckWarning,
          whyFits: ev.whyFits
        };
      }
      return null;
    })
    .filter((u): u is UniversityProgram => u !== null);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      {/* Header */}
      <Header
        onReset={handleReset}
        hasProfile={!!profile}
        onExportCalendar={profile ? handleExportCalendar : undefined}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onOpenAdmin={handleOpenAdmin}
        onOpenSupport={handleOpenSupport}
        onOpenPricing={() => setIsPricingModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Global Announcement Banner from Admin Settings */}
      {siteSettings.isAnnouncementActive && siteSettings.announcementText && (
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 py-2 px-4 text-center text-xs font-semibold text-white shadow-xs">
          <div className="mx-auto flex max-w-5xl items-center justify-center gap-2">
            <Bell className="h-3.5 w-3.5 text-amber-300 shrink-0" />
            <span>{siteSettings.announcementText}</span>
          </div>
        </div>
      )}

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
          /* FULL SCENARIO DASHBOARD (Stages 3 to 7 + Search + Enhancements) */
          <div className="space-y-10">
            {/* Quick interactive banner to adjust inputs */}
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

            {/* HONEST AI PORTFOLIO AUDIT (No Exaggeration) */}
            {portfolioAudit && profile && (
              <PortfolioAuditCard
                audit={portfolioAudit}
                profile={profile}
                onEditPortfolio={() => setIsEditing(true)}
              />
            )}

            {/* CUSTOM SEARCH & EVALUATION COMPONENT */}
            {profile && (
              <UniversitySearch
                profile={profile}
                onSelectUniversity={(uni) => {
                  setSelectedDetailUni(uni);
                  setIsDetailModalOpen(true);
                }}
                onOpenEssayModal={handleOpenEssayModal}
                onOpenPlanModal={handleOpenPlanModal}
                selectedForCompare={selectedForCompare}
                onToggleCompare={handleToggleCompare}
                onAddCustomUniversity={handleAddCustomUniversity}
                onOpenAuth={handleOpenAuth}
                onOpenSupport={handleOpenSupport}
                onOpenPricing={() => setIsPricingModalOpen(true)}
              />
            )}

            {/* STAGE 4: University Recommendations (Target, Reach, Safety, Unlikely with Strict Reality Check) */}
            <Recommendations
              universities={recommendedUnis}
              selectedForCompare={selectedForCompare}
              onToggleCompare={handleToggleCompare}
              onOpenCompareModal={() => setIsCompareOpen(true)}
              onOpenEssayModal={handleOpenEssayModal}
              onOpenPlanModal={handleOpenPlanModal}
              onSelectUniversity={(uni) => {
                setSelectedDetailUni(uni);
                setIsDetailModalOpen(true);
              }}
              onRefreshVariants={handleRefreshVariants}
              onRequestAiVariants={handleRequestAiVariants}
              isAiGenerating={isAiGenerating}
            />

            {/* SCHOLARSHIPS FINDER */}
            <ScholarshipsSection />

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

            {/* UNIVERSITY DETAIL MODAL (3 Waves, Grant Stats, Campus) */}
            <UniversityDetailModal
              isOpen={isDetailModalOpen}
              onClose={() => setIsDetailModalOpen(false)}
              university={selectedDetailUni}
              onOpenEssayModal={handleOpenEssayModal}
              onOpenPlanModal={handleOpenPlanModal}
              isCompared={selectedDetailUni ? selectedForCompare.includes(selectedDetailUni.id) : false}
              onToggleCompare={handleToggleCompare}
            />

            {/* UNIVERSITY PREPARATION PLAN MODAL (Step-by-step roadmap & Gap Analysis) */}
            {selectedPlanUni && profile && (
              <UniversityPlanModal
                uni={selectedPlanUni}
                profile={profile}
                onClose={() => setSelectedPlanUni(null)}
              />
            )}

            {/* ESSAY STRUCTURE ASSISTANT MODAL */}
            <EssayAssistantModal
              isOpen={isEssayModalOpen}
              onClose={() => setIsEssayModalOpen(false)}
              essayDraft={essayDraft}
              targetUni={essayTargetUni}
            />
          </div>
        )}
      </main>

      {/* Auth Modal (Login / Register / Quick Demo Login) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onAuthSuccess={user => {
          setCurrentUser(user);
          if (user.profile) {
            setProfile(user.profile);
            setRoadmap(generateRoadmap(user.profile));
          } else if (profile) {
            saveUserProfileForUser(user.id, profile);
          }
        }}
      />

      {/* Live In-App Chat & In-Site Purchase Widget */}
      <LiveChatWidget
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        isOpenExternal={isSupportModalOpen}
        onCloseExternal={() => setIsSupportModalOpen(false)}
        initialTopic={supportTopic}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Pricing Comparison Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        onProceedToChat={() => {
          setIsPricingModalOpen(false);
          setSupportTopic('PRO');
          setIsSupportModalOpen(true);
        }}
        isPro={currentUser?.subscriptionTier === 'pro'}
      />

      {/* Admin Panel (Accessible by adilhananuar426@gmail.com) */}
      {currentUser && (
        <AdminPanel
          isOpen={isAdminPanelOpen}
          onClose={() => {
            setIsAdminPanelOpen(false);
            setSiteSettings(getSiteSettings());
          }}
          currentUser={currentUser}
          initialTab={adminInitialTab}
          initialThreadId={adminInitialThreadId}
        />
      )}

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
