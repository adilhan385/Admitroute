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
}

export type MatchCategory = 'target' | 'reach' | 'safety';

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
  whyFits: string[];
  keyStrengths: string[];
  avgGraduateSalary: string;
  applicationDeadline: string;
  officialSiteUrl: string;
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
