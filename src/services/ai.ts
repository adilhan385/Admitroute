import type { UserProfile, UniversityProgram, EssayDraft } from '../types';

/**
 * Сервис интеграции с Google Gemini API
 * Использует VITE_GEMINI_API_KEY из .env или переданный вручную ключ
 */

const MODEL_NAME = 'gemini-2.5-flash';

export async function getAiAdmissionsAdvice(
  profile: UserProfile,
  recommendations: UniversityProgram[],
  apiKey?: string
): Promise<{
  aiSummary?: string;
  strategicAdvice?: string[];
  essayTopics?: string[];
  extracurricularIdeas?: string[];
}> {
  const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
  if (!key || key.trim() === '') return {};

  const prompt = `Ты — строгий, честный и профессиональный эксперт по поступлению в университеты.
КРИТИЧЕСКОЕ ТРЕБОВАНИЕ: НЕ преувеличивай шансы абитуриента, не давай ложных надежд и не гарантируй поступление. Будь конструктивен, реалистичен и точен.

Профиль абитуриента:
- Имя: ${profile.name}
- Класс: ${profile.grade}
- Направление: ${profile.field}
- Средний балл (GPA): ${profile.gpa} / 5.0
- Языковой тест: ${profile.hasLanguageTest ? profile.languageScore : 'Нет сертификата'}
- Гос. экзамен: ${profile.hasStateExam ? profile.stateExamScore : 'Не сдан'}
- Целевой регион: ${profile.targetRegion}
- Бюджет: ${profile.budget}
- Год поступления: ${profile.targetYear}
- Портфолио и активности: ${profile.portfolioText || 'Не указаны'}

Рекомендованные программы:
${recommendations.map(u => `- ${u.name} (${u.programTitle}) [Категория: ${u.matchCategory}]`).join('\n')}

Сформируй ответ СТРОГО в формате валидного JSON без обратных кавычек:
{
  "aiSummary": "Честная оценка шансов в 1-2 предложениях с указанием главного барьера или преимущества",
  "strategicAdvice": ["реалистичный стратегический совет 1", "реалистичный стратегический совет 2", "реалистичный стратегический совет 3"],
  "essayTopics": ["тема эссе 1", "тема эссе 2"],
  "extracurricularIdeas": ["активность для закрытия слабых мест 1", "активность 2"]
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${key.trim()}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.4, // low temperature for grounded, non-hallucinatory output
          },
        }),
      }
    );

    if (!response.ok) return {};
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) return JSON.parse(text);
  } catch (e) {
    console.warn('Gemini API request failed, falling back:', e);
  }

  return {};
}

/**
 * Генерация структуры мотивационного письма под конкретный университет
 */
export async function generateEssayStructure(
  profile: UserProfile,
  targetUni: UniversityProgram,
  apiKey?: string
): Promise<EssayDraft> {
  const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY;

  if (key && key.trim() !== '') {
    const prompt = `Ты — эксперт по академическому письму для поступления.
Составь реалистичный и сильный каркас мотивационного письма (Personal Statement) для абитуриента.
Абитуриент: ${profile.name}, направление: ${profile.field}, GPA: ${profile.gpa}, Внеучебные активности: ${profile.portfolioText || 'базовые школьные интересы'}.
Целевой университет: ${targetUni.name}, программа: ${targetUni.programTitle}.

Верни ответ СТРОГО в формате валидного JSON:
{
  "targetUniName": "${targetUni.shortName}",
  "hook": "Конкретный открывающий абзац (личный триггер интереса к специальности без банальных клише)",
  "academicBackground": "Связка школьных успехов, любимых предметов и реальных проектов",
  "whyUniversity": "Почему именно ${targetUni.shortName} (назови конкретные черты программы, кафедры или лабораторий)",
  "futureImpact": "Конкретный карьерный план и польза, которую выпускник принесет обществу/индустрии"
}`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${key.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.5,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return JSON.parse(text);
      }
    } catch (e) {
      console.warn('AI essay generator fallback triggered:', e);
    }
  }

  // Fallback high-quality template
  return {
    targetUniName: targetUni.shortName,
    hook: `Мой интерес к направлению «${targetUni.programTitle}» сформировался не из абстрактных мечтаний, а из решения конкретных прикладных задач. В старших классах я осознал, что технологии и инженерный подход позволяют автоматизировать рутину и решать реальные проблемы людей.`,
    academicBackground: `Опираясь на сильную базу по профильным дисциплинам (мой текущий GPA ${profile.gpa.toFixed(1)}/5.0), я дополнительно развивал навыки через ${profile.portfolioText ? 'самостоятельные проекты: ' + profile.portfolioText.slice(0, 100) : 'школьные олимпиады, хакатоны и открытые курсы'}.`,
    whyUniversity: `Программа в ${targetUni.name} привлекает меня сбалансированным учебным планом, интеграцией с индустриальными партнерами (${targetUni.keyStrengths[0] || 'ведущие компании'}) и практическими исследовательскими лабораториями.`,
    futureImpact: `После завершения обучения я планирую применить полученные знания в разработке высоконагруженных и социально значимых продуктов, внося вклад в развитие технологической экосистемы.`
  };
}

/**
 * Динамический поиск или генерация любого университета мира через Google Gemini API
 * С точной проверкой требований, 3 волнами дедлайнов и честным расчетом шансов под профиль
 */
export async function searchOrGenerateUniversityWithAi(
  query: string,
  profile: UserProfile,
  apiKey?: string
): Promise<UniversityProgram | null> {
  const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
  if (!key || key.trim() === '') {
    return null;
  }

  const prompt = `Ты — строгий, честный и осведомленный эксперт международной приемной комиссии.
Пользователь ищет информацию по университету: "${query}".

Профиль абитуриента:
- Имя: ${profile.name}
- Класс: ${profile.grade}
- Специальность: ${profile.field}
- GPA: ${profile.gpa} / 5.0
- Языковой тест: ${profile.hasLanguageTest ? profile.languageScore : 'Нет теста'}
- Экзамены / SAT / ЕНТ: ${profile.hasStateExam ? profile.stateExamScore : 'Не сдан'}
- Бюджет: ${profile.budget}
- Год поступления: ${profile.targetYear}
- Портфолио: ${profile.portfolioText || 'Базовое школьное'}

КРИТИЧЕСКИЕ ТРЕБОВАНИЯ:
1. НЕ ПРЕУВЕЛИЧИВАЙ шансы! Если вуз супер-селективный (MIT, Harvard, Oxford, KAIST, NU, NUS, TUM, SNU и т.д.), а у абитуриента GPA < 4.7 или нет подтвержденного языка/SAT, категория ОБЯЗАНА быть "unlikely" с шансом 4-14% и четким предупреждением realityCheckWarning.
2. Сгенерируй ТОЧНЫЕ и РЕАЛЬНЫЕ данные по университету: город, страна, язык, требования, 3 волны дедлайнов (ранняя, регулярная, поздний добор) и прошлогоднюю статистику грантов.

Верни ответ СТРОГО в формате валидного JSON без markdown-блоков:
{
  "id": "ai-${Date.now()}",
  "name": "Официальное название университета",
  "shortName": "Аббревиатура (напр. SDU, MIT, Тренто, МУИТ)",
  "city": "Город",
  "country": "Страна",
  "region": "${profile.targetRegion}",
  "fields": ["${profile.field}"],
  "programTitle": "Название подходящей программы бакалавриата",
  "degrees": ["Бакалавриат (3-4 года)"],
  "acceptanceRate": "Реальный процент зачисления (напр. 15%)",
  "avgGpa": 4.5,
  "languageRequirement": "IELTS 6.5 / B2",
  "examRequirement": "SAT / ЕНТ / аттестат",
  "tuitionYearKztOrUsd": "Стоимость в год или грант",
  "scholarshipAvailability": "100% гранты",
  "hasDormitory": true,
  "matchCategory": "target",
  "matchScore": 85,
  "admissionChancePercentage": 65,
  "realityCheckWarning": "",
  "whyFits": [
    "Причина соответствия 1",
    "Причина 2",
    "Причина 3"
  ],
  "keyStrengths": ["Преимущество 1", "Преимущество 2", "Преимущество 3"],
  "avgGraduateSalary": "Средняя зарплата выпускника",
  "applicationDeadline": "Ближайший дедлайн",
  "officialSiteUrl": "https://...",
  "details": {
    "aboutCampus": "Описание кампуса",
    "studentLife": "Студенческая жизнь",
    "livingCostsPerMonth": "Расходы на жизнь в месяц",
    "dormitoryDetails": "Общежитие",
    "topEmployers": ["Компания 1", "Компания 2", "Компания 3"],
    "rounds": {
      "early": {
        "name": "Ранняя подача",
        "deadline": "Дедлайн",
        "description": "Описание",
        "recommendedFor": "Кому рекомендуется"
      },
      "regular": {
        "name": "Основной поток",
        "deadline": "Дедлайн",
        "description": "Описание",
        "recommendedFor": "Кому рекомендуется"
      },
      "late": {
        "name": "Поздний добор",
        "deadline": "Дедлайн",
        "description": "Описание",
        "recommendedFor": "Кому рекомендуется"
      }
    },
    "grantStats": {
      "lastYearGrantsCount": "Число грантов в прошлом году",
      "lastYearCutoff": "Проходной порог",
      "competitionRatio": "Конкурс на 1 место",
      "grantChanceSummary": "Честная сводка шансов"
    }
  }
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${key.trim()}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        }),
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    const parsed = JSON.parse(text) as UniversityProgram;
    parsed.isAiGenerated = true;
    return parsed;
  } catch (e) {
    console.error('Failed to search university via Gemini API:', e);
    return null;
  }
}

/**
 * Генерация свежих персонализированных рекомендаций университетов из сети через Gemini API
 */
export async function generateAiUniversityRecommendations(
  profile: UserProfile,
  existingIds: string[],
  apiKey?: string
): Promise<UniversityProgram[]> {
  const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
  if (!key || key.trim() === '') return [];

  const prompt = `Ты — международный эксперт по подбору университетов.
Подбери 3 РЕАЛЬНЫХ университета из региона "${profile.targetRegion}" или мировых, которых НЕТ в списке: ${existingIds.slice(0, 10).join(', ')}.

Профиль абитуриента:
- Имя: ${profile.name}
- Направление: ${profile.field}
- GPA: ${profile.gpa} / 5.0
- Языковой тест: ${profile.hasLanguageTest ? profile.languageScore : 'Нет сертификата'}
- Экзамен / ЕНТ / SAT: ${profile.hasStateExam ? profile.stateExamScore : 'Не сдан'}
- Бюджет: ${profile.budget}

ТРЕБОВАНИЯ:
1. НЕ ПРЕУВЕЛИЧИВАЙ шансы! Подбери реальные варианты: 1 Target, 1 Safety и 1 разумный Reach.
2. Включи детальные 3 раунда (early, regular, late) и грантовую статистику.

Верни ответ СТРОГО в формате валидного JSON-массива [ {...}, {...}, {...} ] без markdown:
[
  {
    "id": "ai-rec-${Date.now()}-1",
    "name": "Название университета",
    "shortName": "Аббревиатура",
    "city": "Город",
    "country": "Страна",
    "region": "${profile.targetRegion}",
    "fields": ["${profile.field}"],
    "programTitle": "Название программы",
    "degrees": ["Бакалавриат (4 года)"],
    "acceptanceRate": "Процент приема",
    "avgGpa": 4.4,
    "languageRequirement": "Требования языка",
    "examRequirement": "Требования экзаменов",
    "tuitionYearKztOrUsd": "Стоимость или грант",
    "scholarshipAvailability": "100% гранты",
    "hasDormitory": true,
    "matchCategory": "target",
    "matchScore": 90,
    "admissionChancePercentage": 75,
    "realityCheckWarning": "",
    "whyFits": ["причина 1", "причина 2", "причина 3"],
    "keyStrengths": ["плюс 1", "плюс 2", "плюс 3"],
    "avgGraduateSalary": "Зарплата",
    "applicationDeadline": "Дедлайн",
    "officialSiteUrl": "https://...",
    "details": {
      "aboutCampus": "Кампус",
      "studentLife": "Студ. жизнь",
      "livingCostsPerMonth": "Расходы в месяц",
      "dormitoryDetails": "Общежитие",
      "topEmployers": ["Компания 1", "Компания 2"],
      "rounds": {
        "early": { "name": "Ранняя волна", "deadline": "Дедлайн", "description": "Описание", "recommendedFor": "Кому" },
        "regular": { "name": "Основная волна", "deadline": "Дедлайн", "description": "Описание", "recommendedFor": "Кому" },
        "late": { "name": "Поздняя волна", "deadline": "Дедлайн", "description": "Описание", "recommendedFor": "Кому" }
      },
      "grantStats": {
        "lastYearGrantsCount": "Число грантов",
        "lastYearCutoff": "Проходной балл",
        "competitionRatio": "Конкурс",
        "grantChanceSummary": "Шансы"
      }
    }
  }
]`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${key.trim()}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.4,
          },
        }),
      }
    );

    if (!response.ok) return [];
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return [];

    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed.map((item, idx) => ({
        ...item,
        id: item.id || `ai-gen-${Date.now()}-${idx}`,
        isAiGenerated: true
      }));
    }
  } catch (e) {
    console.error('Failed to generate AI recommendations:', e);
  }

  return [];
}

