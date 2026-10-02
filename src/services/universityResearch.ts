import type { UserProfile, UniversityProgram } from '../types';
import { setSearchQuota, type SearchQuota } from './auth';

type ResearchResponse = {
  found?: boolean;
  university?: Record<string, unknown> | null;
  sources?: string[];
  quota?: SearchQuota;
  error?: string;
};

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('admitroute_auth_token_v1');
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

export async function refreshSearchQuota(): Promise<SearchQuota | null> {
  try {
    const response = await fetch('/api/university-search', { headers: authHeaders(), cache: 'no-store' });
    if (!response.ok) return null;
    const data = await response.json() as ResearchResponse;
    if (data.quota) setSearchQuota(data.quota);
    return data.quota || null;
  } catch {
    // The server remains the authority when it becomes reachable again.
    return null;
  }
}

export type ResearchResult = { kind: 'found'; university: UniversityProgram } | { kind: 'not_found' };

async function requestSearch(query: string, profile: UserProfile, mode: 'catalogue' | 'research'): Promise<ResearchResponse> {
  let response: Response;
  try {
    response = await fetch('/api/university-search', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ mode, query, profile: {
        field: profile.field, gpa: profile.gpa, gpaScale: profile.gpaScale,
        languageScore: profile.languageScore || '', stateExamScore: profile.stateExamScore || '',
        satScore: profile.satScore, budget: profile.budget, targetYear: profile.targetYear
      } })
    });
  } catch {
    throw new Error('Нет связи с AI-поиском. Попробуйте позже.');
  }
  let data: ResearchResponse;
  try {
    data = await response.json() as ResearchResponse;
  } catch {
    throw new Error('AI-поиск на сервере недоступен.');
  }
  if (data.quota) setSearchQuota(data.quota);
  if (!response.ok) throw new Error(data.error || 'Не удалось выполнить AI-поиск.');
  return data;
}

export async function consumeCatalogueSearch(query: string, profile: UserProfile): Promise<void> {
  await requestSearch(query, profile, 'catalogue');
}

export async function researchUniversity(query: string, profile: UserProfile): Promise<ResearchResult> {
  const data = await requestSearch(query, profile, 'research');
  if (!data.found || !data.university) return { kind: 'not_found' };

  const raw = data.university;
  const string = (key: string, fallback = 'Не подтверждено') =>
    typeof raw[key] === 'string' && (raw[key] as string).trim() ? (raw[key] as string).trim() : fallback;
  const list = (key: string) => Array.isArray(raw[key])
    ? (raw[key] as unknown[]).filter((item): item is string => typeof item === 'string').slice(0, 3) : [];
  const region = ['kazakhstan', 'europe', 'asia', 'usa'].includes(String(raw.region))
    ? raw.region as UniversityProgram['region'] : profile.targetRegion;
  const scholarship = ['100% гранты', 'Частичные стипендии', 'Ограничено'].includes(String(raw.scholarshipAvailability))
    ? raw.scholarshipAvailability as UniversityProgram['scholarshipAvailability'] : 'Ограничено';
  const officialSiteUrl = string('officialSiteUrl', '');
  const sourceUrls = (data.sources || []).filter(url => /^https:\/\//.test(url)).slice(0, 5);
  const evidence = raw.admissionsEvidence && typeof raw.admissionsEvidence === 'object'
    ? raw.admissionsEvidence as UniversityProgram['admissionsEvidence'] : undefined;

  const university: UniversityProgram = {
    id: `research-${crypto.randomUUID()}`,
    name: string('name', query), shortName: string('shortName', query),
    city: string('city'), country: string('country'), region,
    fields: [profile.field], programTitle: string('programTitle', 'Программа уточняется'),
    degrees: ['Бакалавриат'], acceptanceRate: string('acceptanceRate', 'Не опубликовано'),
    admissionsEvidence: evidence,
    avgGpa: typeof raw.avgGpa === 'number' && raw.avgGpa > 0 ? raw.avgGpa : 0,
    languageRequirement: string('languageRequirement'), examRequirement: string('examRequirement'),
    tuitionYearKztOrUsd: string('tuitionYearKztOrUsd'), scholarshipAvailability: scholarship,
    hasDormitory: raw.hasDormitory === true,
    matchCategory: 'reach', matchScore: 0, admissionChancePercentage: undefined,
    realityCheckWarning: 'Точный шанс зачисления нельзя определить по открытым данным. Проверьте требования программы на официальном сайте.',
    isAiGenerated: true, sourceUrls,
    whyFits: list('whyFits'), keyStrengths: list('keyStrengths'),
    avgGraduateSalary: 'Не опубликовано', applicationDeadline: string('applicationDeadline'), officialSiteUrl,
    details: {
      aboutCampus: 'Проверьте сведения о кампусе на официальном сайте университета.',
      studentLife: 'Не подтверждено', livingCostsPerMonth: 'Не подтверждено',
      dormitoryDetails: raw.hasDormitory === true ? 'Наличие подтверждено; условия уточняйте в университете.' : 'Не подтверждено',
      topEmployers: [],
      rounds: {
        early: { name: 'Ранний этап', deadline: 'Уточните на сайте', description: 'Данные не подтверждены.', recommendedFor: 'При наличии такого этапа.' },
        regular: { name: 'Основной этап', deadline: string('applicationDeadline', 'Уточните на сайте'), description: 'Проверьте правила приема.', recommendedFor: 'Абитуриентам.' },
        late: { name: 'Дополнительный этап', deadline: 'Уточните на сайте', description: 'Данные не подтверждены.', recommendedFor: 'При наличии такого этапа.' }
      },
      grantStats: {
        lastYearGrantsCount: 'Не опубликовано', lastYearCutoff: 'Не опубликовано',
        competitionRatio: 'Не опубликовано', grantChanceSummary: 'Без официальной статистики оценка шанса не выводится.'
      }
    }
  };
  return { kind: 'found', university };
}
