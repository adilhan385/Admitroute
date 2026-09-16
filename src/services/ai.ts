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
