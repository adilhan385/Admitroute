import type {
  UserProfile,
  UniversityProgram,
  ProfileDiagnosis,
  RoadmapStep,
  MatchCategory,
  UniversityPreparationPlan,
  PrepPlanPhase
} from '../types';
import { UNIVERSITIES_DATABASE } from '../data/universities';

/**
 * Извлечение и нормализация числовых и качественных показателей из профиля кандидата
 */
export function parseExamScores(profile: UserProfile) {
  const gpa = Number(profile.gpa) || 3.0;

  // 1. Language score parsing (IELTS / TOEFL / Duolingo)
  let ielts: number | null = null;
  let toefl: number | null = null;
  let duolingo: number | null = null;

  if (profile.hasLanguageTest && profile.languageScore) {
    const raw = profile.languageScore.trim().toLowerCase();

    const ieltsMatch = raw.match(/ielts\s*([0-9]+(?:\.[0-9]+)?)/i);
    const toeflMatch = raw.match(/toefl\s*([0-9]+)/i);
    const duoMatch = raw.match(/(?:duolingo|det)\s*([0-9]+)/i);

    if (ieltsMatch) {
      ielts = parseFloat(ieltsMatch[1]);
    } else if (toeflMatch) {
      toefl = parseInt(toeflMatch[1], 10);
    } else if (duoMatch) {
      duolingo = parseInt(duoMatch[1], 10);
    } else {
      // Just a number in string
      const numMatch = raw.match(/([0-9]+(?:\.[0-9]+)?)/);
      if (numMatch) {
        const val = parseFloat(numMatch[1]);
        if (val <= 9.0) {
          ielts = val;
        } else if (val <= 120) {
          toefl = Math.round(val);
        } else if (val <= 160) {
          duolingo = Math.round(val);
        }
      }
    }
  }

  // 2. State exam score parsing (ЕНТ / SAT)
  let unt: number | null = null;
  let sat: number | null = null;

  if (profile.hasStateExam && profile.stateExamScore) {
    const raw = profile.stateExamScore.trim().toLowerCase();

    const untMatch = raw.match(/(?:ент|unt)\s*([0-9]+)/i);
    const untSlashMatch = raw.match(/([0-9]+)\s*(?:\/|\s*из)\s*140/i);
    const satMatch = raw.match(/sat\s*([0-9]+)/i);

    if (untMatch) {
      unt = parseInt(untMatch[1], 10);
    } else if (untSlashMatch) {
      unt = parseInt(untSlashMatch[1], 10);
    } else if (satMatch) {
      sat = parseInt(satMatch[1], 10);
    } else {
      const numMatch = raw.match(/([0-9]+)/);
      if (numMatch) {
        const val = parseInt(numMatch[1], 10);
        if (val <= 140) {
          unt = val;
        } else if (val >= 400 && val <= 1600) {
          sat = val;
        }
      }
    }
  }

  // 3. Portfolio evaluation
  const pText = (profile.portfolioText || '').trim();
  let portfolioRating: 'empty' | 'weak' | 'moderate' | 'strong' = 'empty';
  if (pText.length >= 15) {
    const pKeywords = [
      'олимпиад', 'хакатон', 'проект', 'разработ', 'призер', 'победител',
      'волонтер', 'капитан', 'стартап', 'github', 'робототехник', 'конкурс',
      'наград', 'диплом', 'дебат', 'исследован', 'стать'
    ];
    const lowerP = pText.toLowerCase();
    const hits = pKeywords.filter(k => lowerP.includes(k)).length;
    if (hits >= 3 || (pText.length > 80 && hits >= 2)) {
      portfolioRating = 'strong';
    } else if (hits >= 1 || pText.length > 35) {
      portfolioRating = 'moderate';
    } else {
      portfolioRating = 'weak';
    }
  }

  return {
    gpa,
    ielts,
    toefl,
    duolingo,
    unt,
    sat,
    portfolioRating
  };
}

/**
 * Честный, строгий и реалистичный расчет профильной диагностики (No False Hopes / Anti-Illusion)
 */
export function calculateDiagnosis(profile: UserProfile): ProfileDiagnosis {
  const parsed = parseExamScores(profile);
  const strengths: string[] = [];
  const riskFactors: string[] = [];
  const criticalWarnings: string[] = [];

  const { gpa, ielts, toefl, duolingo, unt, sat, portfolioRating } = parsed;

  // --- 1. GPA EVALUATION ---
  if (gpa >= 4.7) {
    strengths.push(`Отличный средний балл (GPA ${gpa.toFixed(1)}/5.0) — подтверждает высокую академическую дисциплину`);
  } else if (gpa >= 4.3) {
    strengths.push(`Хорошая академическая база (GPA ${gpa.toFixed(1)}/5.0) проходит квалификационный порог большинства вузов`);
  } else if (gpa < 3.5) {
    riskFactors.push(`Критически низкий средний балл (GPA ${gpa.toFixed(1)}/5.0): троечный аттестат отсекает 95% программ со стипендиями`);
    criticalWarnings.push(`Средний балл ${gpa.toFixed(1)}/5.0 находится на уровне «удовлетворительно» (троечник). Ведущие университеты требуют от 3.8–4.2 для рассмотрения на грант.`);
  } else {
    riskFactors.push(`Средний балл (GPA ${gpa.toFixed(1)}/5.0) находится в пограничной зоне: для престижных программ потребуется компенсация высокими тестами`);
  }

  // --- 2. LANGUAGE TEST EVALUATION ---
  if (ielts !== null) {
    if (ielts >= 7.5) {
      strengths.push(`Выдающийся результат IELTS (${ielts.toFixed(1)}) — свободное владение английским (C1/C2) снимает любые языковые барьеры`);
    } else if (ielts >= 6.5) {
      strengths.push(`Подтвержденный языковой уровень (IELTS ${ielts.toFixed(1)}) открывает подачу на большинство международных программ`);
    } else if (ielts >= 5.5) {
      riskFactors.push(`Пограничный балл IELTS (${ielts.toFixed(1)}): большинство вузов требуют от 6.0–6.5 для прямого зачисления без Foundation`);
    } else {
      // ielts < 5.5 (включая критический балл 1.0)
      riskFactors.push(`Критический языковой барьер: балл IELTS ${ielts.toFixed(1)} означает практическое отсутствие английского языка (A1). Необходима подготовка с нуля.`);
      criticalWarnings.push(`IELTS ${ielts.toFixed(1)} — абсолютно непроходной результат для высшего образования. Мировой ценз прямого зачисления — от 6.0, грантов США/Европы — от 6.5–7.5.`);
    }
  } else if (toefl !== null) {
    if (toefl >= 95) strengths.push(`Высокий балл TOEFL (${toefl}) соответствует уровню селективных вузов`);
    else if (toefl >= 79) strengths.push(`Балл TOEFL (${toefl}) достаточен для большинства стандартных программ`);
    else {
      riskFactors.push(`Балл TOEFL (${toefl}) ниже проходного минимума большинства программ (от 79–80)`);
      criticalWarnings.push(`Балл TOEFL ${toefl} не позволяет претендовать на прямое зачисление.`);
    }
  } else if (duolingo !== null) {
    if (duolingo >= 120) strengths.push(`Высокий балл Duolingo (${duolingo}) подтверждает свободный английский`);
    else if (duolingo >= 105) strengths.push(`Балл Duolingo (${duolingo}) достаточен для партнерских вузов`);
    else riskFactors.push(`Балл Duolingo (${duolingo}) ниже стандартного порога (105–115)`);
  } else {
    if (profile.targetRegion !== 'kazakhstan') {
      riskFactors.push('Отсутствие сертификата IELTS/TOEFL блокирует подачу на зарубежные гранты');
    }
  }

  // --- 3. STATE EXAM / STANDARDIZED TEST EVALUATION ---
  if (unt !== null) {
    if (unt >= 125) {
      strengths.push(`Высокий результат ЕНТ (${unt}/140) гарантирует сильнейшую позицию в республиканском конкурсе грантов`);
    } else if (unt >= 105) {
      strengths.push(`Хороший результат ЕНТ (${unt}/140) позволяет претендовать на гранты в технических и региональных вузах`);
    } else if (unt >= 50) {
      riskFactors.push(`ЕНТ (${unt}/140) преодолевает лишь минимальный порог платного отделения (50). Шансы на бесплатный грант крайне малы.`);
    } else {
      // unt < 50 (включая критический балл 1 из 140)
      riskFactors.push(`ЕНТ не сдан (${unt}/140): балл ниже национального порога допуска (50). Зачисление в вузы РК законодательно запрещено.`);
      criticalWarnings.push(`ЕНТ ${unt}/140 — экзамен провален. В Казахстане пороговый ценз допуска к высшему образованию составляет 50 баллов (для национальных вузов — 65). При таком балле зачисление невозможно даже на коммерческую основу.`);
    }
  } else if (sat !== null) {
    if (sat >= 1400) strengths.push(`Конкурентный балл SAT (${sat}/1600) открывает доступ к селективным международным вузам`);
    else if (sat >= 1200) strengths.push(`Результат SAT (${sat}/1600) достаточен для европейских и азиатских программ`);
    else riskFactors.push(`Балл SAT (${sat}) ниже среднего уровня для стипендиальных программ`);
  } else {
    if (profile.grade === 'grade_11' && profile.targetRegion === 'kazakhstan') {
      riskFactors.push('Критически близкие сроки: ЕНТ еще не сдан, до грантового потока осталось мало времени');
    }
  }

  // --- 4. PORTFOLIO EVALUATION ---
  if (portfolioRating === 'strong') {
    strengths.push('Убедительное портфолио: олимпиады и практические проекты дают преимущество в конкурсе');
  } else if (portfolioRating === 'empty') {
    if (profile.targetRegion === 'usa' || profile.budget === 'full_grant') {
      riskFactors.push('Полное отсутствие внеучебного портфолио: для вузов США и грантов это лишает заявку конкурентоспособности');
      criticalWarnings.push('Вузы США и международные фонды оценивают Extracurriculars (активности) на 30–40% веса заявки. Пустое портфолио не оставляет шансов на стипендию.');
    }
  }

  // --- 5. BUDGET & REALITY CHECK ---
  if (profile.budget === 'full_grant') {
    if (gpa < 4.0 || (ielts !== null && ielts < 6.5) || (unt !== null && unt < 100)) {
      riskFactors.push('Нереалистичная цель финансирования: заявлен «100% грант», но академические баллы не дотягивают до грантовых конкурсов');
    }
  }

  // --- 6. READINESS CALCULATION (0 - 100%) ---
  let readiness = 0;

  // GPA (0 to 25)
  if (gpa >= 4.8) readiness += 25;
  else if (gpa >= 4.5) readiness += 20;
  else if (gpa >= 4.0) readiness += 15;
  else if (gpa >= 3.6) readiness += 8;
  else if (gpa >= 3.3) readiness += 4;
  else readiness += 1; // 3.0 gives 1 pt

  // Language (0 to 25)
  if (ielts !== null) {
    if (ielts >= 7.5) readiness += 25;
    else if (ielts >= 7.0) readiness += 22;
    else if (ielts >= 6.5) readiness += 18;
    else if (ielts >= 6.0) readiness += 12;
    else if (ielts >= 5.5) readiness += 6;
    else if (ielts >= 5.0) readiness += 2;
    else readiness += 0; // IELTS 1.0 gets 0 points!
  } else if (toefl !== null) {
    if (toefl >= 100) readiness += 25;
    else if (toefl >= 85) readiness += 18;
    else if (toefl >= 70) readiness += 10;
    else readiness += 0;
  } else if (duolingo !== null) {
    if (duolingo >= 125) readiness += 25;
    else if (duolingo >= 105) readiness += 16;
    else if (duolingo >= 90) readiness += 8;
    else readiness += 0;
  } else {
    if (profile.grade === 'grade_9' || profile.grade === 'grade_10') readiness += 5;
    else readiness += 0;
  }

  // State Exam (0 to 25)
  if (unt !== null) {
    if (unt >= 125) readiness += 25;
    else if (unt >= 110) readiness += 20;
    else if (unt >= 90) readiness += 14;
    else if (unt >= 70) readiness += 8;
    else if (unt >= 50) readiness += 4;
    else readiness += 0; // UNT 1 gets 0 points!
  } else if (sat !== null) {
    if (sat >= 1450) readiness += 25;
    else if (sat >= 1350) readiness += 20;
    else if (sat >= 1200) readiness += 14;
    else if (sat >= 1050) readiness += 6;
    else readiness += 0;
  } else {
    if (profile.grade === 'grade_9' || profile.grade === 'grade_10') readiness += 5;
    else readiness += 0;
  }

  // Portfolio (0 to 15)
  if (portfolioRating === 'strong') readiness += 15;
  else if (portfolioRating === 'moderate') readiness += 8;
  else if (portfolioRating === 'weak') readiness += 3;
  else readiness += 0;

  // Grade timeline (0 to 10)
  if (profile.grade === 'grade_9') readiness += 10;
  else if (profile.grade === 'grade_10') readiness += 7;
  else if (profile.grade === 'grade_11') readiness += 3;
  else readiness += 2;

  // Determine readiness level
  let readinessLevel: 'critical' | 'low' | 'moderate' | 'high' = 'high';
  if (readiness < 20) readinessLevel = 'critical';
  else if (readiness < 45) readinessLevel = 'low';
  else if (readiness < 70) readinessLevel = 'moderate';

  // If no strengths, be completely honest
  if (strengths.length === 0) {
    strengths.push('Конкурентные преимущества отсутствуют: текущие баллы находятся ниже минимальных проходных цензов. Необходима базовая подготовка.');
  }

  const regionNames: Record<string, string> = {
    kazakhstan: 'ведущие вузы Казахстана',
    europe: 'университеты Европы',
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

  // Dynamic Honest Summary
  let summary = '';
  if (readinessLevel === 'critical') {
    summary = `🚨 КРИТИЧЕСКИЙ УРОВЕНЬ РИСКА: При текущих показателях (GPA ${gpa.toFixed(1)}, ${profile.languageScore || 'без языка'}, ${profile.stateExamScore || 'без тестов'}, без портфолио) поступление в вузы ${regionNames[profile.targetRegion] || 'выбранного региона'} со 100% грантом АБСОЛЮТНО НЕВОЗМОЖНО. Профиль не преодолевает даже минимальный отсевочный порог. Вам необходима фундаментальная подготовка с нуля минимум на 1–2 года: пересдача тестов и вытягивание успеваемости.`;
  } else if (readinessLevel === 'low') {
    summary = `⚠️ СУЩЕСТВЕННЫЙ ДЕФИЦИТ БАЛЛОВ: Академический профиль имеет критические пробелы по языку или профильным тестам. Поступление на гранты сопряжено с риском отказа выше 85%. Рекомендуется сосредоточиться на экстренной пересдаче тестов либо выбирать коммерческие отделения без высокого конкурса.`;
  } else if (readinessLevel === 'moderate') {
    summary = `БАЗОВЫЙ ПРОФИЛЬ С ПОТЕНЦИАЛОМ: Вы преодолеваете минимальные квалификационные пороги, но для победы в конкурсе на 100% стипендию требуется точечное усиление слабых сторон (поднятие балла тестов и оформление портфолио).`;
  } else {
    summary = `ВЫСОКАЯ КОНКУРЕНТОСПОСОБНОСТЬ: Академические и тестовые результаты обеспечивают сильные позиции в рейтинговых списках. Основной упор — на соблюдение дедлайнов ранней подачи и сильные мотивационные эссе.`;
  }

  const primaryGoal = `Поступление на ${fieldNames[profile.field] || 'выбранную специальность'} в ${regionNames[profile.targetRegion] || 'целевые вузы'} (${profile.targetYear} г.)`;

  return {
    summary,
    strengths,
    riskFactors,
    criticalWarnings,
    primaryGoal,
    readinessLevel,
    overallReadinessScore: Math.max(1, Math.min(readiness, 98))
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
  const parsed = parseExamScores(profile);
  const { gpa, ielts, unt } = parsed;
  const isKZ = uni.region === 'kazakhstan';
  const gpaDiff = gpa - uni.avgGpa;
  const rawAcceptance = parseFloat(uni.acceptanceRate.replace('%', '')) || 25;
  const isFreeOrFullGrant = uni.scholarshipAvailability === '100% гранты';

  let category: MatchCategory = 'target';
  let chance = 60;
  let warning: string | undefined = undefined;

  // 1. HARD BLOCKER: Language Failure (e.g. IELTS 1.0 vs 6.5)
  const requiresLang = uni.languageRequirement.toLowerCase().includes('ielts') || uni.languageRequirement.toLowerCase().includes('6.');
  const isLangCriticallyLow = ielts !== null && ielts < 5.0;

  if (isLangCriticallyLow && requiresLang) {
    category = 'unlikely';
    chance = Math.max(1, Math.min(3, Math.round(ielts * 2)));
    warning = `🚨 Дисквалификация по языку: программа требует ${uni.languageRequirement}. С результатом «${profile.languageScore}» заявка будет отклонена еще до рассмотрения приемной комиссией.`;
  }
  // 2. HARD BLOCKER: UNT Failure in Kazakhstan (UNT < 50)
  else if (isKZ && unt !== null && unt < 50) {
    category = 'unlikely';
    chance = 0;
    warning = `🚨 Законодательный запрет на зачисление: в Казахстане минимальный пороговый балл ЕНТ для вузов составляет 50 (для нацвузов — 65). С результатом «${profile.stateExamScore}» зачисление в ${uni.shortName} юридически невозможно даже на платное отделение.`;
  }
  // 3. HARD BLOCKER: Critical GPA Deficit (e.g. 3.0 vs 4.2)
  else if (gpaDiff <= -0.8) {
    category = 'unlikely';
    chance = Math.min(8, Math.max(1, Math.round(rawAcceptance * 0.2 + (gpa / 5) * 5)));
    warning = `🚨 Критический академический дефицит: средний балл (GPA ${gpa.toFixed(1)}) отстает на ${Math.abs(gpaDiff).toFixed(1)} от среднего проходного (${uni.avgGpa}). Вуз отсекает абитуриентов с троечным аттестатом.`;
  }
  // 4. ELITE / HIGHLY SELECTIVE TIER (acceptance <= 18% or Harvard, NUS, TUM, KAIST, NU)
  else if (rawAcceptance <= 18 || uni.id.includes('harvard') || uni.id.includes('nus') || uni.id.includes('tsinghua')) {
    if (gpa < 4.5 || (ielts !== null && ielts < 6.5) || (isKZ && unt !== null && unt < 115)) {
      category = 'unlikely';
      chance = Math.min(10, Math.max(2, Math.round(rawAcceptance * 0.4)));
      warning = `Экстремально высокая селективность: конкурс ${uni.details.grantStats.competitionRatio}. Текущих баллов недостаточно для преодоления первого отборочного тура.`;
    } else if (gpa < 4.85) {
      category = 'reach';
      chance = Math.min(28, Math.max(12, Math.round(rawAcceptance * 1.2 + gpaDiff * 20)));
      warning = `Амбициозная цель (Reach): сильный конкурс. Риск отказа оценивается в ${100 - chance}%. Требуется олимпиадное портфолио.`;
    } else {
      category = 'reach';
      chance = Math.min(45, Math.max(22, Math.round(rawAcceptance * 2.0 + 10)));
    }
  }
  // 5. COMPETITIVE TIER (acceptance 19% - 35%)
  else if (rawAcceptance < 35) {
    if (gpaDiff < -0.4 || (ielts !== null && ielts < 6.0)) {
      category = 'reach';
      chance = Math.max(15, Math.round(30 + gpaDiff * 25));
      warning = `Баллы ниже среднего уровня поступивших. Рекомендуется подавать в Target и Safety программы.`;
    } else if (gpaDiff >= 0.2 && (ielts === null || ielts >= 6.5)) {
      category = 'target';
      chance = Math.min(80, Math.round(65 + gpaDiff * 25));
    } else {
      category = 'target';
      chance = Math.min(70, Math.round(52 + gpaDiff * 20));
    }
  }
  // 6. ACCESSIBLE / SAFETY TIER (acceptance >= 35%)
  else {
    if (gpaDiff < -0.5 || (ielts !== null && ielts < 5.5)) {
      category = 'reach';
      chance = Math.max(20, Math.round(35 + gpaDiff * 20));
      warning = `Для зачисления необходимо подтянуть базовые академические требования программы.`;
    } else if (gpaDiff >= 0 && (unt === null || unt >= 70) && (ielts === null || ielts >= 6.0)) {
      category = 'safety';
      chance = Math.min(92, Math.round(80 + gpaDiff * 15));
    } else {
      category = 'target';
      chance = 60;
    }
  }

  // If candidate wants 100% grant, check if grant is feasible
  if (profile.budget === 'full_grant' && chance > 10) {
    if (isKZ && unt !== null && unt < 100) {
      warning = `Платное зачисление возможно, но государственный грант при балле ЕНТ ${unt} маловероятен (проходной прошлого года: ${uni.details.grantStats.lastYearCutoff}).`;
      chance = Math.min(chance, 25);
    }
  }

  // Calculate Match Score
  let score = 50;
  if (uni.fields.includes(profile.field)) score += 20;
  if (uni.region === profile.targetRegion) score += 20;
  if (isFreeOrFullGrant && profile.budget === 'full_grant') score += 10;

  if (category === 'unlikely') score = Math.min(40, Math.max(15, chance + 10));
  else if (category === 'reach') score = Math.min(72, Math.max(50, chance + 25));
  else if (category === 'target') score = Math.min(92, Math.max(75, chance + 10));
  else score = Math.min(98, Math.max(82, chance + 5));

  // Dynamic whyFits tailored to candidate
  const dynamicWhyFits: string[] = [];
  if (category === 'safety') {
    dynamicWhyFits.push(`Высокая надежность (Safety): ваши показатели соответствуют требованиям зачисления (${uni.avgGpa})`);
  } else if (category === 'target') {
    dynamicWhyFits.push(`Оптимальная цель (Target): хорошая сходимость профиля с проходными порогами`);
  } else if (category === 'reach') {
    dynamicWhyFits.push(`Амбициозная цель (Reach): высокая планка, требуется максимальная мобилизация на экзаменах`);
  } else {
    dynamicWhyFits.push(`Критический риск (Unlikely): текущие баллы не преодолевают отбор, не делайте ставку`);
  }

  if (profile.budget === 'full_grant' && isFreeOrFullGrant && chance >= 30) {
    dynamicWhyFits.push('Возможность обучения на гранте при успешной сдаче профильных испытаний');
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
  const regionalPool = UNIVERSITIES_DATABASE.filter(u => u.region === profile.targetRegion);
  const otherPool = UNIVERSITIES_DATABASE.filter(u => u.region !== profile.targetRegion);

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

  const targets = evaluatedPool.filter(u => u.matchCategory === 'target').sort((a, b) => b.matchScore - a.matchScore);
  const safeties = evaluatedPool.filter(u => u.matchCategory === 'safety').sort((a, b) => b.matchScore - a.matchScore);
  const reaches = evaluatedPool.filter(u => u.matchCategory === 'reach').sort((a, b) => b.matchScore - a.matchScore);
  const unlikelies = evaluatedPool.filter(u => u.matchCategory === 'unlikely').sort((a, b) => b.matchScore - a.matchScore);

  const selected: UniversityProgram[] = [];
  const seed = options?.shuffleSeed || 0;

  // If candidate is critically low (e.g. UNT 1, IELTS 1), show Unlikely openly with warnings!
  if (unlikelies.length > 0 && targets.length === 0 && safeties.length === 0) {
    selected.push(...unlikelies.slice(0, 4));
  } else {
    if (targets.length > 0) {
      const targetIdx = seed % targets.length;
      selected.push(targets[targetIdx]);
      const secondTargetIdx = (targetIdx + 1) % targets.length;
      if (targets.length > 1 && !selected.find(s => s.id === targets[secondTargetIdx].id)) {
        selected.push(targets[secondTargetIdx]);
      }
    }

    if (safeties.length > 0) {
      const safetyIdx = seed % safeties.length;
      selected.push(safeties[safetyIdx]);
      const secondSafetyIdx = (safetyIdx + 1) % safeties.length;
      if (safeties.length > 1 && !selected.find(s => s.id === safeties[secondSafetyIdx].id)) {
        selected.push(safeties[secondSafetyIdx]);
      }
    }

    if (reaches.length > 0) {
      const reachIdx = seed % reaches.length;
      selected.push(reaches[reachIdx]);
    } else if (unlikelies.length > 0) {
      selected.push(unlikelies[0]);
    }
  }

  // Fill up to 5-6 options
  for (const item of evaluatedPool.sort((a, b) => b.matchScore - a.matchScore)) {
    if (!selected.find(s => s.id === item.id)) {
      selected.push(item);
    }
    if (selected.length >= 6) break;
  }

  return selected;
}

export function generateRoadmap(profile: UserProfile): RoadmapStep[] {
  const parsed = parseExamScores(profile);
  const { gpa, ielts, unt } = parsed;
  const isKZ = profile.targetRegion === 'kazakhstan';
  const isGrad11 = profile.grade === 'grade_11' || profile.grade === 'graduate';

  const steps: RoadmapStep[] = [];

  // If in critical failure mode (e.g. IELTS 1 or UNT 1), roadmap is an EMERGENCY REMEDIATION ROADMAP!
  const isEmergency = (ielts !== null && ielts < 5.0) || (unt !== null && unt < 50) || gpa < 3.5;

  if (isEmergency) {
    steps.push({
      id: 'step-remedial-lang',
      month: 'Месяц 1 — 3',
      title: '🚨 Экстренная ликвидация языкового дефицита (с нуля до A2/B1)',
      category: 'exams',
      description: `Текущий уровень (${profile.languageScore || 'IELTS 1.0'}) не позволяет подавать документы в вузы. Ежедневные занятия 2–3 часа, фокус на грамматику и словарный запас 2000+ слов. Цель первого этапа: пробный тест 5.0+`,
      deadlineDate: '30 апреля 2026',
      completed: false,
      isCurrentNextAction: true
    });

    if (isKZ) {
      steps.push({
        id: 'step-remedial-ent',
        month: 'Месяц 2 — 4',
        title: '🚨 Базовая подготовка к пересдаче ЕНТ (Преодоление порога 50 баллов)',
        category: 'exams',
        description: `Текущий балл (${profile.stateExamScore || 'ЕНТ 1/140'}) лишает права зачисления. Изучение базовых формул и тем по обязательным предметам (Грамотность чтения, Математическая грамотность, История Казахстана). Цель: 65+ баллов.`,
        deadlineDate: '25 мая 2026',
        completed: false
      });
    }

    steps.push({
      id: 'step-remedial-gpa',
      month: 'Месяц 1 — 4',
      title: 'Поднятие успеваемости в школе/колледже (GPA)',
      category: 'academic' as any,
      description: `Улучшить четвертные оценки с текущих ${gpa.toFixed(1)}/5.0 минимум до 4.0. Обратиться к учителям за дополнительными заданиями и закрыть тройки.`,
      deadlineDate: '15 мая 2026',
      completed: false
    });

    steps.push({
      id: 'step-remedial-retest',
      month: 'Месяц 5 — 6',
      title: 'Повторная сдача экзаменов и оценка динамики',
      category: 'exams',
      description: 'Сдать официальный пробный экзамен IELTS (ориентир: 6.0+) и повторный поток ЕНТ. По результатам скорректировать список вузов.',
      deadlineDate: '20 июня 2026',
      completed: false
    });

    steps.push({
      id: 'step-remedial-apply',
      month: 'Июль — Август',
      title: 'Подача на программы Foundation / Колледжи / Резервный поток',
      category: 'applications',
      description: 'В случае недобора баллов на прямой бакалавриат — подача на годичные подготовительные программы (Foundation Year) или колледж-партнер.',
      deadlineDate: '15 июля 2026',
      completed: false
    });

    return steps;
  }

  // Standard progressive roadmap
  if (!profile.hasLanguageTest || (ielts !== null && ielts < 6.5)) {
    steps.push({
      id: 'step-lang',
      month: isGrad11 ? 'Март — Апрель' : 'Май — Июнь',
      title: 'Сдача официального языкового экзамена (IELTS 6.5+)',
      category: 'exams',
      description: 'Записаться на тест в официальном центре (British Council/IDP) и подтвердить языковой ценз для международных грантов.',
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
        ? 'Сфокусироваться на профильных предметах: Математика + Информатика/Физика. Целевой ориентир для гранта: 115+ баллов.'
        : 'Сдача профильных предметов ЕНТ с ориентацией на грантовый проходной балл выбранной специальности.',
      deadlineDate: '28 июня 2026',
      completed: false,
      isCurrentNextAction: profile.hasLanguageTest ? true : false
    });
  } else {
    steps.push({
      id: 'step-sat',
      month: 'Апрель — Май',
      title: 'Сдача стандартизированных тестов (SAT / Вступительные испытания)',
      category: 'exams',
      description: 'Сдать SAT Reasoning (цель: 1350+) либо внутренние предметные тесты выбранных зарубежных вузов.',
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
    description: 'Загрузить документы в университетские порталы (NU Admissions, eGov / Platonus для вузов РК, либо международные порталы вузов).',
    deadlineDate: '10 июля 2026',
    completed: false
  });

  steps.push({
    id: 'step-scholarship',
    month: 'Июль — Август',
    title: 'Участие в конкурсе государственных и университетских грантов',
    category: 'scholarship',
    description: 'Подача заявления на республиканский конкурс грантов РК (13–20 июля) либо оформление зарубежных стипендий и скидок.',
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

/**
 * Генерация персонального пошагового плана подготовки к КОНКРЕТНОМУ университету с Gap-анализом
 */
export function generateUniversityPreparationPlan(
  uni: UniversityProgram,
  profile: UserProfile
): UniversityPreparationPlan {
  const parsed = parseExamScores(profile);
  const evaluation = evaluateUniversityProgram(uni, profile);

  const { gpa, ielts, unt } = parsed;

  // 1. GPA Gap
  const gpaGap = Number((uni.avgGpa - gpa).toFixed(1));
  let gpaStatus: 'met' | 'minor_gap' | 'critical_gap' = 'met';
  if (gpaGap > 0.5) gpaStatus = 'critical_gap';
  else if (gpaGap > 0.1) gpaStatus = 'minor_gap';

  // 2. Language Gap
  let languageStatus: 'met' | 'minor_gap' | 'critical_gap' = 'met';
  if (ielts !== null) {
    if (ielts < 5.0) languageStatus = 'critical_gap';
    else if (ielts < 6.5 && uni.languageRequirement.includes('6.5')) languageStatus = 'minor_gap';
  } else if (!profile.hasLanguageTest && uni.region !== 'kazakhstan') {
    languageStatus = 'critical_gap';
  }

  // 3. Exam Gap
  let examStatus: 'met' | 'minor_gap' | 'critical_gap' = 'met';
  if (uni.region === 'kazakhstan') {
    if (unt !== null) {
      if (unt < 50) examStatus = 'critical_gap';
      else if (unt < 105 && uni.scholarshipAvailability === '100% гранты') examStatus = 'minor_gap';
    } else {
      examStatus = 'minor_gap';
    }
  }

  // 4. Portfolio Status
  const portfolioStatus: 'strong' | 'needs_work' | 'empty' =
    parsed.portfolioRating === 'strong' ? 'strong' : parsed.portfolioRating === 'empty' ? 'empty' : 'needs_work';

  // Overall Feasibility
  let overallFeasibility: 'high' | 'moderate' | 'low' | 'near_impossible' = 'high';
  let estimatedPrepMonths = 3;

  if (languageStatus === 'critical_gap' || examStatus === 'critical_gap' || gpaStatus === 'critical_gap') {
    if (gpa < 3.5 && (ielts !== null && ielts < 5.0)) {
      overallFeasibility = 'near_impossible';
      estimatedPrepMonths = 18;
    } else {
      overallFeasibility = 'low';
      estimatedPrepMonths = 9;
    }
  } else if (evaluation.matchCategory === 'reach') {
    overallFeasibility = 'moderate';
    estimatedPrepMonths = 6;
  }

  // Verdict Message
  let verdictMessage = '';
  if (overallFeasibility === 'near_impossible') {
    verdictMessage = `Критический разрыв с требованиями ${uni.shortName}: при текущих показателях (GPA ${gpa.toFixed(1)}, ${profile.languageScore || 'без языка'}, ${profile.stateExamScore || 'без тестов'}) поступление на грант в этом сезоне невозможно. Для преодоления планки ${uni.name} потребуется минимум ${estimatedPrepMonths} месяцев интенсивных занятий с репетиторами.`;
  } else if (overallFeasibility === 'low') {
    verdictMessage = `Высокая сложность поступления: у вас есть существенный дефицит по ключевым экзаменам программы. Шансы оцениваются в ${evaluation.admissionChancePercentage}%. Необходима мобилизация по слабым метрикам.`;
  } else if (overallFeasibility === 'moderate') {
    verdictMessage = `Реалистичная, но требующая усилий цель (Reach): вы проходите базовые требования, но для гарантии стипендии требуется показать сильный результат на вступительных испытаниях и подготовить мотивационное письмо.`;
  } else {
    verdictMessage = `Высокая сходимость с программой (Target/Safety): ваши текущие показатели полностью соответствуют проходному профилю ${uni.shortName}. Главная задача — своевременно подать заявку на 1-ю волну.`;
  }

  // Generate 5 Concrete Phases Tailored to this Uni
  const phases: PrepPlanPhase[] = [
    {
      phaseNumber: 1,
      title: `Ликвидация академического долга и GPA под планку ${uni.shortName}`,
      durationMonths: 'Месяцы 1 — 3',
      focusArea: 'academic',
      tasks: [
        `Поднять средний балл с текущих ${gpa.toFixed(1)} до целевого показателя программы: ${uni.avgGpa.toFixed(1)} / 5.0`,
        `Сделать упор на профильные школьные предметы направления ${uni.programTitle} (математика, естественные науки, профильный язык)`,
        `Запросить в учебной части промежуточный транскрипт оценок и проверить корректность перевода в 5-балльную шкалу`
      ],
      criticalMilestone: `Табель без оценок ниже «4» и средний балл не менее ${Math.min(4.5, uni.avgGpa).toFixed(1)}`
    },
    {
      phaseNumber: 2,
      title: `Языковая квалификация под норматив ${uni.shortName} (${uni.languageRequirement})`,
      durationMonths: 'Месяцы 2 — 5',
      focusArea: 'language',
      tasks: [
        ielts !== null && ielts < 5.0
          ? `Экстренный подъем английского с уровня A1 до рабочего B2 (занятия 5 раз в неделю, фокус на General English + грамматика)`
          : `Отработка формата экзамена ${uni.languageRequirement.includes('IELTS') ? 'IELTS Academic' : 'языкового теста программы'}`,
        `Еженедельная сдача полных пробных Mock-тестов с таймингом на секции Writing и Speaking`,
        `Регистрация на официальный экзамен с датой сдачи минимум за 1 месяц до дедлайна подачи в ${uni.shortName}`
      ],
      criticalMilestone: `Официальный сертификат с баллом не ниже ${uni.languageRequirement}`
    },
    {
      phaseNumber: 3,
      title: `Подготовка к профильным тестам под критерии ${uni.shortName}`,
      durationMonths: 'Месяцы 4 — 7',
      focusArea: 'exams',
      tasks: [
        uni.region === 'kazakhstan'
          ? `Подготовка к ЕНТ с ориентацией на проходной балл прошлого года: ${uni.details.grantStats.lastYearCutoff}`
          : `Подготовка к международным тестам (SAT Reasoning или предметным вступительным экзаменам ${uni.shortName})`,
        `Устранение пробелов в решении сложных задач части B и C по профильным предметам`,
        `Прохождение пробных тестирований в условиях реального стресса и ограничения времени`
      ],
      criticalMilestone: `Стабильный результат пробников на уровне от ${uni.details.grantStats.lastYearCutoff}`
    },
    {
      phaseNumber: 4,
      title: `Внеучебное портфолио и эссе под специфику ${uni.name}`,
      durationMonths: 'Месяцы 3 — 8',
      focusArea: 'portfolio',
      tasks: [
        `Разработка прикладного проекта или участие в хакатоне/олимпиаде по специальности ${uni.programTitle}`,
        `Получение 2 академических рекомендательных писем от профильных преподавателей`,
        `Написание мотивационного письма (Personal Statement) с четким ответом: почему именно ${uni.name} и какую пользу принесет кандидат университету`
      ],
      criticalMilestone: `Готовое портфолио с 1–2 профильными достижениями и вычитанное эссе`
    },
    {
      phaseNumber: 5,
      title: `Подача заявления и отслеживание дедлайнов ${uni.shortName}`,
      durationMonths: 'Месяцы 7 — 10',
      focusArea: 'documents',
      tasks: [
        `Подача заявки на 1-ю волну (Ранний раунд): дедлайн ${uni.details.rounds.early.deadline} (максимальные шансы)`,
        `Подача на основную регулярную волну: дедлайн ${uni.details.rounds.regular.deadline}`,
        `Оформление заявки на финансовую помощь и гранты: ${uni.scholarshipAvailability}`,
        `Подтверждение зачисления (Acceptance of Offer) и подача заявки на общежитие (${uni.details.dormitoryDetails})`
      ],
      criticalMilestone: `Получение официального письма о зачислении (Offer Letter) от приемной комиссии ${uni.shortName}`
    }
  ];

  return {
    targetUniId: uni.id,
    targetUniName: uni.name,
    targetProgram: uni.programTitle,
    country: uni.country,
    city: uni.city,
    admissionChancePercentage: evaluation.admissionChancePercentage,
    matchCategory: evaluation.matchCategory,
    gapAnalysis: {
      gpaCurrent: gpa,
      gpaTarget: uni.avgGpa,
      gpaGap,
      gpaStatus,
      languageCurrent: profile.hasLanguageTest ? profile.languageScore : 'Не сдавался',
      languageTarget: uni.languageRequirement,
      languageStatus,
      examCurrent: profile.hasStateExam ? profile.stateExamScore : 'Не сдавался',
      examTarget: uni.examRequirement,
      examStatus,
      portfolioStatus,
      overallFeasibility,
      verdictMessage,
      estimatedPrepMonths
    },
    phases,
    createdAt: new Date().toISOString()
  };
}
