import type { UserProfile, UniversityProgram, ProfileDiagnosis, RoadmapStep, MatchCategory } from '../types';
import { UNIVERSITIES_DATABASE } from '../data/universities';

export function calculateDiagnosis(profile: UserProfile): ProfileDiagnosis {
  const strengths: string[] = [];
  const riskFactors: string[] = [];

  // Strengths
  if (profile.gpa >= 4.5) {
    strengths.push(`Высокий академический балл (GPA ${profile.gpa.toFixed(1)}/5.0) дает преимущество при конкурсном отборе`);
  } else {
    strengths.push(`Стабильная базовая успеваемость (GPA ${profile.gpa.toFixed(1)}/5.0) достаточна для большинства программ`);
  }

  if (profile.hasLanguageTest) {
    strengths.push(`Наличие подтвержденного языкового уровня (${profile.languageScore}) снимает барьер для англоязычных программ`);
  }

  if (profile.hasStateExam) {
    strengths.push(`Сдан профильный экзамен (${profile.stateExamScore}), что ускоряет оценку шансов на грант`);
  } else {
    strengths.push('Четкая профессиональная ориентация на раннем этапе подготовки');
  }

  // Risk Factors / Constraints
  if (!profile.hasLanguageTest && profile.targetRegion !== 'kazakhstan') {
    riskFactors.push('Отсутствие официального сертификата IELTS/TOEFL ограничивает подачу на зарубежные гранты');
  }

  if (profile.budget === 'full_grant') {
    riskFactors.push('Ограничение бюджетом «Только 100% грант» требует жесткой концентрации на конкурсных стипендиях');
  }

  if (profile.grade === 'grade_11' && !profile.hasStateExam && profile.targetRegion === 'kazakhstan') {
    riskFactors.push('Критически близкие сроки: до основного этапа ЕНТ и подачи документов осталось мало времени');
  }

  if (riskFactors.length === 0) {
    riskFactors.push('Высокая конкуренция среди претендентов с сопоставимыми академическими баллами');
  }

  // Overall readiness score
  let readiness = 50;
  if (profile.gpa >= 4.5) readiness += 15;
  else if (profile.gpa >= 4.0) readiness += 10;

  if (profile.hasLanguageTest) readiness += 15;
  if (profile.hasStateExam) readiness += 15;
  if (profile.grade === 'grade_9' || profile.grade === 'grade_10') readiness += 5; // time advantage

  // Goal
  const regionNames: Record<string, string> = {
    kazakhstan: 'ведущие вузы Казахстана',
    europe: 'университеты Европы со стипендией',
    asia: 'технологические институты Азии',
    usa: 'университеты США'
  };

  const fieldNames: Record<string, string> = {
    cs_it: 'Computer Science & IT',
    engineering: 'инженерию и робототехнику',
    business_econ: 'бизнес, финансы и экономику',
    medicine_bio: 'медицину и биомедицину',
    design_media: 'цифровой дизайн и медиа',
    social_law: 'международные отношения и право'
  };

  const primaryGoal = `Поступление на ${fieldNames[profile.field] || 'выбранную специальность'} в ${regionNames[profile.targetRegion] || 'целевые вузы'} с максимальным грантовым покрытием (${profile.targetYear} г.)`;

  const summary = `Профиль абитуриента ${profile.name || 'кандидата'} ориентирован на ${fieldNames[profile.field] || 'специальность'}. Академическая база позволяет претендовать на гранты при условии своевременного закрытия формальных требований.`;

  return {
    summary,
    strengths,
    riskFactors,
    primaryGoal,
    overallReadinessScore: Math.min(readiness, 95)
  };
}

/**
 * Честная, строгая и реалистичная оценка шансов поступления в конкретную программу (No False Hopes)
 */
export function evaluateUniversityProgram(
  uni: UniversityProgram,
  profile: UserProfile
): {
  matchCategory: MatchCategory;
  matchScore: number;
  admissionChancePercentage: number;
  realityCheckWarning?: string;
  whyFits: string[];
} {
  const gpaDiff = profile.gpa - uni.avgGpa;
  const isKZ = uni.region === 'kazakhstan';
  const rawAcceptance = parseFloat(uni.acceptanceRate.replace('%', '')) || 25;

  // Language check
  const requiresHighLang =
    uni.languageRequirement.toLowerCase().includes('6.5') ||
    uni.languageRequirement.toLowerCase().includes('7.0') ||
    uni.languageRequirement.toLowerCase().includes('7.5') ||
    uni.languageRequirement.toLowerCase().includes('b2');
  const missingLang = requiresHighLang && !profile.hasLanguageTest;

  // Budget check
  const isFreeOrFullGrant = uni.scholarshipAvailability === '100% гранты';

  let category: MatchCategory = 'target';
  let chance = 60;
  let warning: string | undefined = undefined;

  // --- Strict Anti-Illusion Rules ---
  // Elite/Ultra-Reach: Harvard/MIT, NUS, KAIST, NU, Tsinghua, Tokyo Tech, TUM (acceptance <= 16%)
  const isElite = rawAcceptance <= 16 || uni.id.includes('harvard') || uni.id.includes('nus') || uni.id.includes('tsinghua');

  if (isElite) {
    if (profile.gpa < 4.5 || missingLang || (isKZ && !profile.hasStateExam)) {
      category = 'unlikely';
      chance = Math.max(4, Math.min(12, Math.round(rawAcceptance * 0.5 + (profile.gpa / 5) * 5)));
      warning = `Критический риск отказа: академический порог программы (GPA от ${uni.avgGpa.toFixed(1)}, ${uni.languageRequirement}) существенно выше текущих данных. Поступление маловероятно (<${chance}%) без побед на международных олимпиадах или резкого роста баллов.`;
    } else if (profile.gpa < 4.85 || (!profile.hasStateExam && !isKZ)) {
      category = 'reach';
      chance = Math.min(32, Math.max(14, Math.round(rawAcceptance * 1.5 + gpaDiff * 25)));
      warning = `Высокая селективность: конкурс ${uni.details.grantStats.competitionRatio}. Риск отказа оценивается в ${100 - chance}%. Требуется сильное эссе и олимпиадный профиль.`;
    } else {
      category = 'reach';
      chance = Math.min(48, Math.max(25, Math.round(rawAcceptance * 2.2 + 15)));
    }
  } else if (rawAcceptance < 35) {
    // Competitive Tier: KBTU, AITU, PoliMi, HKUST, UNIST, Purdue, etc. (acceptance 17-34%)
    if (gpaDiff < -0.3 || missingLang) {
      if (gpaDiff < -0.6) {
        category = 'unlikely';
        chance = 15;
        warning = `Низкая вероятность зачисления: GPA отстает на ${Math.abs(gpaDiff).toFixed(1)} балла от среднего показателя (${uni.avgGpa}). Рекомендуется сосредоточиться на Target и Safety вузах.`;
      } else {
        category = 'reach';
        chance = Math.max(22, Math.round(38 + gpaDiff * 30));
        if (missingLang) {
          warning = `Для допуска к конкурсу требуется обязательный сертификат: ${uni.languageRequirement}.`;
        }
      }
    } else if (gpaDiff >= 0.2 && (!requiresHighLang || profile.hasLanguageTest)) {
      category = 'target';
      chance = Math.min(85, Math.round(68 + gpaDiff * 25));
    } else {
      category = 'target';
      chance = Math.min(76, Math.round(58 + gpaDiff * 20));
    }
  } else {
    // Accessible / Safety Tier: SDU, APU, Warsaw Tech, Satbayev, IITU, ASU, Charles Uni (acceptance 35%+)
    if (gpaDiff < -0.4) {
      category = 'reach';
      chance = 45;
    } else if (gpaDiff >= 0 || (profile.hasStateExam && isKZ)) {
      category = 'safety';
      chance = Math.min(95, Math.round(82 + gpaDiff * 15));
    } else {
      category = 'target';
      chance = 72;
    }
  }

  // Calculate Match Score
  let score = 65;
  if (uni.fields.includes(profile.field)) score += 18;
  if (uni.region === profile.targetRegion) score += 20;
  if (isFreeOrFullGrant && profile.budget === 'full_grant') score += 12;

  if (category === 'unlikely') score = Math.min(50, Math.max(30, chance + 15));
  else if (category === 'reach') score = Math.min(76, Math.max(62, chance + 30));
  else if (category === 'target') score = Math.min(95, Math.max(80, chance + 10));
  else score = Math.min(97, Math.max(86, chance + 5));

  // Dynamic whyFits tailored to candidate
  const dynamicWhyFits: string[] = [];
  if (category === 'safety') {
    dynamicWhyFits.push(`Высокая надежность (Safety): ваши баллы выше среднего порога программы (${uni.avgGpa})`);
  } else if (category === 'target') {
    dynamicWhyFits.push(`Оптимальная цель (Target): высокая сходимость профиля с проходными баллами`);
  } else if (category === 'reach') {
    dynamicWhyFits.push(`Амбициозная цель (Reach): сильная школа, требуется мобилизация на экзаменах`);
  } else {
    dynamicWhyFits.push(`Критический риск: баллы существенно ниже проходного порога, не делайте ставку`);
  }

  if (profile.budget === 'full_grant' && isFreeOrFullGrant) {
    dynamicWhyFits.push('100% возможность бесплатного обучения (госгрант / полная стипендия)');
  }
  dynamicWhyFits.push(uni.whyFits[0] || 'Высокая репутация диплома и востребованность выпускников');

  return {
    matchCategory: category,
    matchScore: score,
    admissionChancePercentage: chance,
    realityCheckWarning: warning,
    whyFits: dynamicWhyFits.slice(0, 3)
  };
}

export function recommendUniversities(
  profile: UserProfile,
  options?: { shuffleSeed?: number }
): UniversityProgram[] {
  // Pool prioritizing requested region, but including global options if pool is small
  const regionalPool = UNIVERSITIES_DATABASE.filter(u => u.region === profile.targetRegion);
  const otherPool = UNIVERSITIES_DATABASE.filter(u => u.region !== profile.targetRegion);

  // Score each university with our anti-illusion evaluator
  const evaluatedPool = (regionalPool.length >= 4 ? regionalPool : [...regionalPool, ...otherPool]).map((uni) => {
    const evaluation = evaluateUniversityProgram(uni, profile);
    return {
      ...uni,
      matchCategory: evaluation.matchCategory,
      matchScore: evaluation.matchScore,
      admissionChancePercentage: evaluation.admissionChancePercentage,
      realityCheckWarning: evaluation.realityCheckWarning,
      whyFits: evaluation.whyFits
    };
  });

  // Group by category
  const targets = evaluatedPool.filter(u => u.matchCategory === 'target').sort((a, b) => b.matchScore - a.matchScore);
  const safeties = evaluatedPool.filter(u => u.matchCategory === 'safety').sort((a, b) => b.matchScore - a.matchScore);
  // In reach: exclude 'unlikely' from default reach unless no other reach exists
  const reaches = evaluatedPool.filter(u => u.matchCategory === 'reach').sort((a, b) => b.matchScore - a.matchScore);
  const unlikelies = evaluatedPool.filter(u => u.matchCategory === 'unlikely').sort((a, b) => b.matchScore - a.matchScore);

  const selected: UniversityProgram[] = [];

  // Random rotation offset based on shuffleSeed
  const seed = options?.shuffleSeed || 0;

  // 1. Pick 1-2 Targets (with rotation if available)
  if (targets.length > 0) {
    const targetIdx = seed % targets.length;
    selected.push(targets[targetIdx]);
    const secondTargetIdx = (targetIdx + 1) % targets.length;
    if (targets.length > 1 && !selected.find(s => s.id === targets[secondTargetIdx].id)) {
      selected.push(targets[secondTargetIdx]);
    }
  }

  // 2. Pick 1-2 Safeties
  if (safeties.length > 0) {
    const safetyIdx = seed % safeties.length;
    selected.push(safeties[safetyIdx]);
    const secondSafetyIdx = (safetyIdx + 1) % safeties.length;
    if (safeties.length > 1 && !selected.find(s => s.id === safeties[secondSafetyIdx].id)) {
      selected.push(safeties[secondSafetyIdx]);
    }
  }

  // 3. Pick 1 Reach (if candidate is weak, don't give false hope, mark honestly)
  if (reaches.length > 0) {
    const reachIdx = seed % reaches.length;
    selected.push(reaches[reachIdx]);
  } else if (unlikelies.length > 0) {
    // Show one unlikely with prominent reality check warning so they see the gap
    selected.push(unlikelies[0]);
  }

  // Fill up to 5-6 options if needed
  for (const item of evaluatedPool.sort((a, b) => b.matchScore - a.matchScore)) {
    if (!selected.find(s => s.id === item.id)) {
      selected.push(item);
    }
    if (selected.length >= 6) break;
  }

  return selected;
}

export function generateRoadmap(profile: UserProfile): RoadmapStep[] {
  const isKZ = profile.targetRegion === 'kazakhstan';
  const isGrad11 = profile.grade === 'grade_11' || profile.grade === 'graduate';

  const steps: RoadmapStep[] = [];

  if (!profile.hasLanguageTest) {
    steps.push({
      id: 'step-lang',
      month: isGrad11 ? 'Март — Апрель' : 'Май — Июнь',
      title: 'Сдача языкового экзамена (IELTS / внутренний тест)',
      category: 'exams',
      description: 'Записаться на пробный тест и сдать официальный экзамен для подтверждения уровня (цель: IELTS 6.0–6.5+).',
      deadlineDate: isGrad11 ? '25 апреля 2026' : '15 июня 2026',
      completed: false,
      isCurrentNextAction: true
    });
  }

  if (isKZ) {
    steps.push({
      id: 'step-ent',
      month: 'Май — Июнь',
      title: 'Сдача профильного ЕНТ (Грантовый поток)',
      category: 'exams',
      description: profile.field === 'cs_it' || profile.field === 'engineering'
        ? 'Сфокусироваться на профильных предметах: Математика + Информатика/Физика. Целевой порог для гранта: 110+ баллов.'
        : 'Сдача профильных предметов ЕНТ с ориентацией на грантовый проходной балл выбранной специальности.',
      deadlineDate: '28 июня 2026',
      completed: false,
      isCurrentNextAction: profile.hasLanguageTest ? true : false
    });
  } else {
    steps.push({
      id: 'step-sat',
      month: 'Апрель — Май',
      title: 'Подготовка стандартизированных тестов (SAT / Внутренние испытания)',
      category: 'exams',
      description: 'Сдать SAT Reasoning (цель: 1300+) или профильные предметные экзамены выбранных зарубежных вузов.',
      deadlineDate: '10 мая 2026',
      completed: false,
      isCurrentNextAction: profile.hasLanguageTest ? true : false
    });
  }

  steps.push({
    id: 'step-docs',
    month: 'Май — Июнь',
    title: 'Подготовка пакета академических документов и эссе',
    category: 'documents',
    description: 'Заказать транскрипты/табель оценок в школе, получить 2 рекомендательных письма от учителей и финализировать мотивационное письмо (Personal Statement).',
    deadlineDate: '15 июня 2026',
    completed: false
  });

  steps.push({
    id: 'step-apply',
    month: 'Июнь — Июль',
    title: 'Подача заявок в приемные комиссии университетов',
    category: 'applications',
    description: 'Загрузить документы в университетские порталы (NU Admissions, eGov / Platonus для вузов РК, либо университетские системы приема).',
    deadlineDate: '10 июля 2026',
    completed: false
  });

  steps.push({
    id: 'step-scholarship',
    month: 'Июль — Август',
    title: 'Участие в конкурсе государственных и университетских грантов',
    category: 'scholarship',
    description: 'Подача заявления на республиканский конкурс грантов РК (13–20 июля) либо оформление региональных стипендий/финансовой помощи.',
    deadlineDate: '20 июля 2026',
    completed: false
  });

  steps.push({
    id: 'step-enrollment',
    month: 'Август',
    title: 'Зачисление, оформление общежития и студенческая ориентация',
    category: 'applications',
    description: 'Предоставить оригиналы документов, подписать договор на обучение и подать заявку на заселение в студенческий кампус.',
    deadlineDate: '25 августа 2026',
    completed: false
  });

  return steps;
}
