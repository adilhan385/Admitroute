export type StudyGrade = 'grade_9' | 'grade_10' | 'grade_11' | 'graduate';

export type FieldOfInterest =
  | 'cs_it'
  | 'engineering'
  | 'business_econ'
  | 'medicine_bio'
  | 'design_media'
  | 'social_law';

export type TargetRegion = 'kazakhstan' | 'europe' | 'asia' | 'usa';

export type BudgetTier = 'full_grant' | 'low_cost' | 'mid_cost' | 'any';

export interface UserProfile {
  name: string;
  grade: StudyGrade;
  field: FieldOfInterest;
  gpa: number; // e.g. 4.7 out of 5.0
  hasLanguageTest: boolean;
  languageScore: string; // e.g. "IELTS 7.0" or "B2"
  hasStateExam: boolean; // e.g. ЕНТ / SAT
  stateExamScore: string; // e.g. "122 / 140"
  targetRegion: TargetRegion;
  budget: BudgetTier;
  targetYear: string; // "2026" or "2027"
  portfolioText?: string; // внеучебные активности, проекты, олимпиады
}

export type MatchCategory = 'target' | 'reach' | 'safety' | 'unlikely';

export interface AdmissionRoundItem {
  name: string;
  deadline: string;
  description: string;
  recommendedFor: string;
}

export interface AdmissionRounds {
  early: AdmissionRoundItem;
  regular: AdmissionRoundItem;
  late: AdmissionRoundItem;
}

export interface GrantStatistics {
  lastYearGrantsCount: string;
  lastYearCutoff: string;
  competitionRatio: string;
  grantChanceSummary: string;
}

export interface UniversityDetails {
  aboutCampus: string;
  studentLife: string;
  livingCostsPerMonth: string;
  dormitoryDetails: string;
  topEmployers: string[];
  rounds: AdmissionRounds;
  grantStats: GrantStatistics;
}

export interface UniversityProgram {
  id: string;
  name: string;
  shortName: string;
  city: string;
  country: string;
  region: TargetRegion;
  fields: FieldOfInterest[];
  programTitle: string;
  degrees: string[];
  acceptanceRate: string;
  avgGpa: number;
  languageRequirement: string;
  examRequirement: string;
  tuitionYearKztOrUsd: string;
  scholarshipAvailability: '100% гранты' | 'Частичные стипендии' | 'Ограничено';
  hasDormitory: boolean;
  matchCategory: MatchCategory;
  matchScore: number; // 0 - 100
  admissionChancePercentage?: number; // 5 - 98%
  realityCheckWarning?: string; // Honest warning if candidate does not meet minimums
  isAiGenerated?: boolean;
  whyFits: string[];
  keyStrengths: string[];
  avgGraduateSalary: string;
  applicationDeadline: string;
  officialSiteUrl: string;
  details: UniversityDetails;
}

export interface RoadmapStep {
  id: string;
  month: string;
  title: string;
  category: 'exams' | 'documents' | 'portfolio' | 'applications' | 'scholarship';
  description: string;
  deadlineDate: string;
  completed: boolean;
  isCurrentNextAction?: boolean;
}

export interface ProfileDiagnosis {
  summary: string;
  strengths: string[];
  riskFactors: string[];
  primaryGoal: string;
  overallReadinessScore: number; // 0 - 100
}

export interface PortfolioAudit {
  rating: 'strong' | 'moderate' | 'basic';
  scoreOutOf100: number;
  abroadCompetitiveness: 'Высокая' | 'Умеренная' | 'Недостаточная без усиления';
  strongPoints: string[];
  criticalGaps: string[];
  honestVerdict: string;
  recommendedNextActivities: string[];
}

export interface ScholarshipItem {
  id: string;
  title: string;
  organization: string;
  coverage: string;
  eligibility: string;
  region: TargetRegion;
  deadline: string;
  officialUrl: string;
}

export interface EssayDraft {
  targetUniName: string;
  hook: string;
  academicBackground: string;
  whyUniversity: string;
  futureImpact: string;
}

// -------------------------------------------------------------
// USER ROLES, AUTH & ADMIN TYPES
// -------------------------------------------------------------
export type UserRole = 'guest' | 'customer' | 'admin';
export type SubscriptionTier = 'free' | 'pro';

export interface UserUsageStats {
  searchesCount: number;
  recalculationsCount: number;
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  isBanned: boolean;
  createdAt: string;
  usageStats: UserUsageStats;
  notes?: string;
}

export interface SupportMessage {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  reply?: string;
  repliedAt?: string;
}

export interface SiteSettings {
  announcementText: string;
  isAnnouncementActive: boolean;
  maintenanceMode: boolean;
}

