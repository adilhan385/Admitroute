import { describe, it, expect } from 'vitest';
import { parseExamScores, calculateDiagnosis, evaluateUniversityProgram } from '../utils/engine';
import type { UserProfile, UniversityProgram } from '../types';

describe('Scoring Engine Tests', () => {
  const sampleProfile: UserProfile = {
    name: 'Алишер',
    grade: 'grade_11',
    field: 'cs_it',
    gpa: 4.8,
    gpaScale: '5.0',
    hasLanguageTest: true,
    languageScore: 'IELTS 7.5',
    hasStateExam: true,
    stateExamScore: 'ЕНТ 125',
    hasSat: true,
    satScore: '1420',
    budget: 'full_grant',
    targetRegion: 'kazakhstan',
    targetYear: '2026'
  };

  const sampleUni: UniversityProgram = {
    id: 'kbtu-cs',
    name: 'Казахстанско-Британский технический университет (КБТУ)',
    shortName: 'КБТУ',
    city: 'Алматы',
    country: 'Казахстан',
    region: 'kazakhstan',
    fields: ['cs_it'],
    programTitle: 'Computer Science & Software Engineering',
    degrees: ['Бакалавриат'],
    acceptanceRate: '25%',
    avgGpa: 4.5,
    languageRequirement: 'IELTS 6.0',
    examRequirement: 'ЕНТ 110+',
    tuitionYearKztOrUsd: '2 800 000 ₸',
    scholarshipAvailability: '100% гранты',
    hasDormitory: true,
    matchCategory: 'target',
    matchScore: 85,
    admissionChancePercentage: 80,
    whyFits: ['Высокий балл ЕНТ', 'Отличный профиль по IT'],
    keyStrengths: ['Сильная школа программирования'],
    avgGraduateSalary: '600 000 ₸/мес',
    applicationDeadline: '20 июля',
    officialSiteUrl: 'https://kbtu.edu.kz',
    details: {
      aboutCampus: 'Историческое здание в центре Алматы.',
      studentLife: 'Более 30 студенческих клубов.',
      livingCostsPerMonth: '150 000 ₸',
      dormitoryDetails: 'Общежитие для первокурсников.',
      topEmployers: ['Kaspi.kz', 'Kolesa Group', 'EPAM'],
      rounds: {
        early: { name: 'Ранний прием', deadline: '30 апреля', description: 'Олимпиада КБТУ', recommendedFor: 'Призерам олимпиад' },
        regular: { name: 'Основной конкурс', deadline: '20 июля', description: 'Госгрант МНВО РК', recommendedFor: 'Всем абитуриентам' },
        late: { name: 'Платное отделение', deadline: '20 августа', description: 'Прием документов', recommendedFor: 'На платную основу' }
      },
      grantStats: {
        lastYearGrantsCount: '350 грантов',
        lastYearCutoff: '115 баллов',
        competitionRatio: '4.2 человека на место',
        grantChanceSummary: 'Высокие шансы при балле 120+'
      }
    }
  };

  it('correctly parses exam scores and scales', () => {
    const parsed = parseExamScores(sampleProfile);
    expect(parsed.gpa).toBe(4.8);
    expect(parsed.ielts).toBe(7.5);
    expect(parsed.unt).toBe(125);
    expect(parsed.sat).toBe(1420);
  });

  it('generates a valid profile diagnosis with realistic readiness index', () => {
    const diagnosis = calculateDiagnosis(sampleProfile);
    expect(diagnosis.overallReadinessScore).toBeGreaterThanOrEqual(0);
    expect(diagnosis.overallReadinessScore).toBeLessThanOrEqual(100);
    expect(diagnosis.strengths.length).toBeGreaterThan(0);
    expect(diagnosis.riskFactors).toBeDefined();
  });

  it('evaluates university program and returns valid match category', () => {
    const evaluation = evaluateUniversityProgram(sampleUni, sampleProfile);
    expect(['target', 'reach', 'safety', 'unlikely']).toContain(evaluation.matchCategory);
    expect(evaluation.admissionChancePercentage).toBeGreaterThanOrEqual(0);
    expect(evaluation.admissionChancePercentage).toBeLessThanOrEqual(100);
    expect(evaluation.matchScore).toBeGreaterThanOrEqual(0);
  });
});
