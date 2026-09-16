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

export function recommendUniversities(profile: UserProfile): UniversityProgram[] {
  // 1. Приоритетно выбираем вузы из региона, указанного пользователем!
  const regionalPool = UNIVERSITIES_DATABASE.filter(u => u.region === profile.targetRegion);
  const pool = regionalPool.length >= 3 ? regionalPool : UNIVERSITIES_DATABASE;

  // Расчет релевантности программ
  const scored = pool.map((uni) => {
    let score = 70;

    // Field match
    if (uni.fields.includes(profile.field)) {
      score += 20;
    }

    // Region preference
    if (uni.region === profile.targetRegion) {
      score += 25;
    }

    // Budget match
    if (profile.budget === 'full_grant' && uni.scholarshipAvailability === '100% гранты') {
      score += 10;
    }

    // Dynamic Category assignment based on GPA and Language
    let dynamicCategory: MatchCategory = 'target';
    const gpaDiff = profile.gpa - uni.avgGpa;

    if (gpaDiff < -0.15 || (uni.languageRequirement.includes('6.5') && !profile.hasLanguageTest)) {
      dynamicCategory = 'reach';
      score = Math.max(75, Math.min(score, 88));
    } else if (gpaDiff >= 0.25 || uni.acceptanceRate.includes('5') || uni.acceptanceRate.includes('6') || uni.acceptanceRate.includes('8')) {
      dynamicCategory = 'safety';
      score = Math.min(95, score + 5);
    } else {
      dynamicCategory = 'target';
      score = Math.min(96, score + 8);
    }

    // Tailor "whyFits" dynamically
    const dynamicWhyFits = [...uni.whyFits];
    if (profile.budget === 'full_grant' && uni.scholarshipAvailability === '100% гранты') {
      dynamicWhyFits.unshift(`Соответствует вашему запросу на 100% грантовое финансирование`);
    }
    if (profile.gpa >= uni.avgGpa) {
      dynamicWhyFits.push(`Ваш GPA (${profile.gpa.toFixed(1)}) превышает средний проходной показатель программы (${uni.avgGpa})`);
    }

    return {
      ...uni,
      matchCategory: dynamicCategory,
      matchScore: score,
      whyFits: dynamicWhyFits.slice(0, 3)
    };
  });

  // Sort by score
  scored.sort((a, b) => b.matchScore - a.matchScore);

  // Guarantee at least one Target, Reach, Safety for healthy strategy
  const targets = scored.filter(u => u.matchCategory === 'target');
  const reaches = scored.filter(u => u.matchCategory === 'reach');
  const safeties = scored.filter(u => u.matchCategory === 'safety');

  const selected: UniversityProgram[] = [];

  if (targets.length > 0) selected.push(targets[0]);
  if (reaches.length > 0) selected.push(reaches[0]);
  if (safeties.length > 0) selected.push(safeties[0]);

  // Fill up to 4-5 options from remainder
  for (const item of scored) {
    if (!selected.find(s => s.id === item.id)) {
      selected.push(item);
    }
    if (selected.length >= 4) break;
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
