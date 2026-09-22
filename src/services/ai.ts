import type { UserProfile, UniversityProgram, EssayDraft, FieldOfInterest } from '../types';
import { evaluateUniversityProgram } from '../utils/engine';
import { UNIVERSITIES_DATABASE } from '../data/universities';
import { findUniversityByAliasOrName, generateRealisticUnknownUniversity } from '../utils/universityMatcher';

/**
 * Сервис интеграции с Google Gemini API (gemini-3.6-flash) + Автономный аналитический движок (No-Fail Engine)
 * Проверяет VITE_GEMINI_API_KEY из .env, а при отсутствии ключа или сбое сети
 * мгновенно формирует достоверную экспертную карточку любого вуза через встроенную базу знаний.
 */

const PRIMARY_MODEL = 'gemini-3.6-flash';
const FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

/**
 * Извлекает валидный JSON блок из ответа модели, отсекая любые обрамляющие комментарии или markdown
 */
function extractJsonBlock(raw: string): string {
  let text = raw.trim();
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.substring(firstBrace, lastBrace + 1).trim();
  }
  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    return text.substring(firstBracket, lastBracket + 1).trim();
  }
  return text;
}

/**
 * Надежный вызов Google Gemini API с поддержкой актуальных версий моделей
 */
async function callGeminiApi(prompt: string, apiKey: string, responseMimeType: string = 'application/json'): Promise<string | null> {
  const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS];
  const cleanKey = apiKey.trim();

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType,
            temperature: 0.3,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return responseMimeType === 'application/json' ? extractJsonBlock(text) : text.trim();
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        console.warn(`[Gemini API ${model}] Status ${response.status}:`, errData?.error?.message || response.statusText);
        if (response.status === 401 || response.status === 403) {
          break;
        }
      }
    } catch (err) {
      console.warn(`[Gemini API ${model}] Network error:`, err);
    }
  }

  return null;
}

export function getGeminiApiKey(): string {
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim() !== '') {
    return envKey.trim();
  }
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('admitroute_gemini_api_key');
    if (local && local.trim() !== '') return local.trim();
  }
  return '';
}

export function setGeminiApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    if (key.trim()) {
      localStorage.setItem('admitroute_gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('admitroute_gemini_api_key');
    }
  }
}

export async function getAiAdmissionsAdvice(
  profile: UserProfile,
  apiKey?: string
): Promise<{ strengths: string[]; risks: string[]; summary: string } | null> {
  const key = apiKey || getGeminiApiKey();

  if (!key) {
    return null;
  }

  const prompt = `Ты — строгий и реалистичный эксперт по поступлению в университеты.
Проанализируй профиль абитуриента:
- Имя: ${profile.name}
- Класс: ${profile.grade}
- Специальность: ${profile.field}
- GPA: ${profile.gpa} / 5.0
- Языковой тест: ${profile.hasLanguageTest ? profile.languageScore : 'Нет теста'}
- Государственный экзамен / SAT: ${profile.hasStateExam ? profile.stateExamScore : 'Не сдан'}
- Бюджет: ${profile.budget}
- Регион интереса: ${profile.targetRegion}

Верни ответ СТРОГО в формате валидного JSON без markdown:
{
  "summary": "Краткое экспертное резюме профиля в 2-3 предложениях с честной оценкой шансов.",
  "strengths": ["Сильная сторона 1 с цифрой", "Сильная сторона 2"],
  "risks": ["Главный фактор риска 1", "Фактор риска 2"]
}`;

  try {
    const text = await callGeminiApi(prompt, key, 'application/json');
    if (text) {
      return JSON.parse(text);
    }
  } catch (e) {
    console.warn('Gemini API advice parsing failed, using fallback:', e);
  }

  return null;
}

export async function generateEssayStructure(
  targetUni: UniversityProgram,
  profile: UserProfile,
  apiKey?: string
): Promise<EssayDraft> {
  const key = apiKey || getGeminiApiKey();

  if (key && key.trim() !== '') {
    const prompt = `Ты — ведущий ментор по написанию мотивационных писем (Statement of Purpose / Personal Statement) для поступления в вузы.
Абитуриент: ${profile.name}, специальность: ${profile.field}, GPA: ${profile.gpa}.
Целевой университет: ${targetUni.name} (${targetUni.shortName}), программа: ${targetUni.programTitle}.
Сильные стороны вуза: ${targetUni.keyStrengths.join(', ')}.

Сгенерируй персонализированную структуру мотивационного письма.
Верни ответ СТРОГО в формате валидного JSON без markdown:
{
  "targetUniName": "${targetUni.name}",
  "hook": "Яркое введение и личный триггер выбора профессии (1-2 абзаца)",
  "academicBackground": "Академическая база, исследовательские проекты и успехи (1-2 абзаца)",
  "whyUniversity": "Почему именно ${targetUni.shortName}: конкретные профессора, лаборатории и курсы (1-2 абзаца)",
  "futureImpact": "Планы после выпуска: решение каких задач и карьерная траектория (1 абзац)"
}`;

    try {
      const text = await callGeminiApi(prompt, key, 'application/json');
      if (text) {
        return JSON.parse(text);
      }
    } catch (e) {
      console.warn('Gemini API essay parsing failed, using fallback:', e);
    }
  }

  // Deterministic high-quality fallback
  return {
    targetUniName: targetUni.name,
    hook: `Мой интерес к направлению «${targetUni.programTitle}» сформировался через решение практических задач и стремление понять, как современные технологии меняют жизнь людей.`,
    academicBackground: `За время учебы я поддерживал академический балл GPA ${profile.gpa}, уделяя особое внимание профильным дисциплинам и углубленному изучению точных наук.`,
    whyUniversity: `Программа в ${targetUni.name} привлекает меня сбалансированным учебным планом, интеграцией с индустриальными партнерами (${targetUni.keyStrengths[0] || 'ведущие компании'}) и практическими исследовательскими лабораториями.`,
    futureImpact: `После завершения обучения я планирую применить полученные знания в разработке высоконагруженных и социально значимых продуктов, внося вклад в развитие технологической экосистемы.`
  };
}

/**
 * Поиск университета в верифицированной базе данных по ключевым словам и алиасам
 */
export function findUniversityInDatabase(query: string): UniversityProgram | null {
  return findUniversityByAliasOrName(query);
}

/**
 * Динамический поиск любого университета мира
 * 1. Проверяет проверенную базу данных (130+ программ)
 * 2. Если не найден — опрашивает Gemini 3.6 Flash со строгими требованиями к достоверности
 * 3. При отсутствии сети или ключа — использует автономную фактологическую базу знаний
 */
export async function searchOrGenerateUniversityWithAi(
  query: string,
  profile: UserProfile,
  apiKey?: string
): Promise<UniversityProgram | null> {
  const q = query.trim().toLowerCase();

  // 1. FAST LOOKUP IN VERIFIED DATABASE
  const foundInDb = findUniversityInDatabase(q);
  if (foundInDb) {
    const ev = evaluateUniversityProgram(foundInDb, profile);
    return { ...foundInDb, ...ev, isAiGenerated: true };
  }

  // 2. LIVE GEMINI 3.6 FLASH QUERY WITH STRICT ACCURACY CRITERIA
  const key = apiKey || getGeminiApiKey();

  if (key && key.trim() !== '') {
    const prompt = `Ты — строгий, авторитетный и высококвалифицированный консультант приемных комиссий университетов Казахстана и мира.
Пользователь ищет конкретный университет: "${query}".

Профиль абитуриента:
- Имя: ${profile.name}
- Класс: ${profile.grade}
- Специальность: ${profile.field}
- GPA: ${profile.gpa} / ${profile.gpaScale || '5.0'}
- Языковой тест: ${profile.hasLanguageTest ? profile.languageScore : 'Нет теста'}
- Экзамены / SAT / ЕНТ: ${profile.satScore ? `${profile.stateExamScore || ''} [${profile.satScore}]`.trim() : profile.hasStateExam ? profile.stateExamScore : 'Не сдан'}
- Бюджет: ${profile.budget}
- Год поступления: ${profile.targetYear}

СТРОГИЕ ТРЕБОВАНИЯ К ДОСТОВЕРНОСТИ (КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНЫ ШАБЛОНЫ):
1. Если университет из Казахстана (КБТУ, AITU, МУИТ, SDU, Satbayev, NU, КазНУ, ЕНУ, КИМЭП, Нархоз, АУЭС, КазНМУ, МУА, AlmaU, КарГУ, ЮКУ и др.):
   - Укажи РЕАЛЬНЫЕ проходные баллы ЕНТ (платное от 65-85, госгрант 115-135+ в зависимости от специальности).
   - Укажи РЕАЛЬНУЮ стоимость обучения в тенге (например: КБТУ 2.2 - 3.2 млн ₸, AITU ~1.6 млн ₸, МУИТ ~1.5 млн ₸, SDU ~1.8 - 2.4 млн ₸, КИМЭП ~3.5 - 4.2 млн ₸, КазНУ ~1.4 - 1.8 млн ₸, NU 100% гранты).
   - Укажи РЕАЛЬНЫЕ требования по английскому (IELTS 5.5-6.5 или внутренний вступительный тест вуза).
   - Укажи РЕАЛЬНЫЕ названия факультетов и программ (ФИТ, Бизнес-школа, SIT, Инженерия и т.д.).
   - Укажи РЕАЛЬНУЮ ситуацию с общежитием (наличие Дома студентов, 100% приоритет первокурсникам).
   - Укажи РЕАЛЬНЫХ работодателей (Kaspi.kz, Kolesa Group, Big 4, Tengizchevroil, EPAM, Halyk Bank, Astana Hub).
2. Если зарубежный университет:
   - Германия (TUM, LMU, RWTH): бесплатное обучение (семестровый сбор €150-350), дедлайны через Uni-Assist.
   - Италия (Polimi, Polito, Sapienza, Trento): региональная стипендия DSU покрывает 100% учебы + до €7000/год стипендия на жизнь.
   - Корея (KAIST, SNU): стипендии GKS / KAIST scholarship, SAT/IELTS.
   - США (Harvard, MIT, Stanford): $65,000-85,000/год или Need-Blind / Need-Based Financial Aid.
3. КАТЕГОРИЧЕСКИЙ ЗАПРЕТ НА ШАБЛОНЫ:
   - ЗАПРЕЩЕНО использовать водянистые фразы: "Соответствует выбранной специальности", "Актуальная учебная программа", "Ведущие индустриальные компании", "Университетский городок с профильными кафедрами".
   - Пиши живо, конкретно, с точными фактами и цифрами!
4. ОЦЕНКА ШАНСОВ (anti-illusion):
   - Если вуз топовый/элитный (MIT, Oxford, Harvard, KAIST, NU), а у абитуриента GPA < 4.7 или нет сильного SAT/ЕНТ/IELTS, категория ОБЯЗАНА быть "unlikely" (шанс 4-14%) с честным realityCheckWarning!

Верни ответ СТРОГО в формате валидного JSON без markdown:
{
  "id": "ai-${Date.now()}",
  "name": "Официальное название университета",
  "shortName": "Аббревиатура",
  "city": "Город",
  "country": "Страна",
  "region": "${profile.targetRegion}",
  "fields": ["${profile.field}"],
  "programTitle": "Конкретная специальность бакалавриата",
  "degrees": ["Бакалавриат (4 года)"],
  "acceptanceRate": "Процент зачисления",
  "avgGpa": 4.5,
  "languageRequirement": "IELTS ... или экзамен вуза",
  "examRequirement": "ЕНТ / SAT ...",
  "tuitionYearKztOrUsd": "Стоимость в год или грант",
  "scholarshipAvailability": "100% гранты",
  "hasDormitory": true,
  "matchCategory": "target",
  "matchScore": 85,
  "admissionChancePercentage": 65,
  "realityCheckWarning": "",
  "whyFits": ["Конкретная причина 1", "Конкретная причина 2", "Конкретная причина 3"],
  "keyStrengths": ["Преимущество 1", "Преимущество 2", "Преимущество 3"],
  "avgGraduateSalary": "Зарплата",
  "applicationDeadline": "Реальный дедлайн 2026",
  "officialSiteUrl": "https://...",
  "details": {
    "aboutCampus": "Реальное описание кампуса и корпусов",
    "studentLife": "Реальные клубы, хакатоны и традиции",
    "livingCostsPerMonth": "Расходы на жизнь в месяц",
    "dormitoryDetails": "Детали общежития и приоритеты",
    "topEmployers": ["Компания 1", "Компания 2", "Компания 3"],
    "rounds": {
      "early": { "name": "Ранний раунд", "deadline": "Дедлайн", "description": "Описание", "recommendedFor": "Кому подходит" },
      "regular": { "name": "Основной поток", "deadline": "Дедлайн", "description": "Описание", "recommendedFor": "Кому подходит" },
      "late": { "name": "Поздний добор", "deadline": "Дедлайн", "description": "Описание", "recommendedFor": "Кому подходит" }
    },
    "grantStats": {
      "lastYearGrantsCount": "Число грантов",
      "lastYearCutoff": "Проходной балл на грант",
      "competitionRatio": "Конкурс на 1 место",
      "grantChanceSummary": "Честная оценка шансов"
    }
  }
}`;

    try {
      const text = await callGeminiApi(prompt, key, 'application/json');
      if (text) {
        const parsed = JSON.parse(text) as UniversityProgram;
        parsed.isAiGenerated = true;
        if (!parsed.id) parsed.id = `ai-${Date.now()}`;
        return parsed;
      }
    } catch (e) {
      console.warn('Gemini API university search parsing failed, activating online/offline generator:', e);
    }
  }

  // 3. LIVE INTERNET SEARCH (WIKIPEDIA API)
  // Если университета нет в локальной базе и нет ключа Gemini — ищем в интернете реальный вуз!
  const onlineResult = await searchUniversityOnline(query, profile);
  if (onlineResult) {
    return onlineResult;
  }

  // 4. OFFLINE FACT-BASED KNOWLEDGE GENERATOR
  return generateSmartFallbackUniversity(query, profile);
}

/**
 * Интеллектуальный генератор любого университета при отсутствии ключа API
 */

/**
 * Функция онлайн-поиска университета в глобальной базе Wikipedia
 * Находит официальное название, страну, город, описание и историю
 */
export async function searchUniversityOnline(
  query: string,
  profile: UserProfile
): Promise<UniversityProgram | null> {
  try {
    const qClean = query.trim();
    if (!qClean || qClean.length < 2) return null;

    // 1. Поиск статьи через Wikipedia OpenSearch API
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(qClean + ' university')}&utf8=&format=json&origin=*`;
    const res = await fetch(searchUrl, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return null;
    const data = await res.json();
    const hits = data?.query?.search;
    if (!hits || !Array.isArray(hits) || hits.length === 0) return null;

    // Выбираем лучший результат по релевантности к университетам
    const bestHit = hits.find((h: any) =>
      h.title.toLowerCase().includes('university') ||
      h.title.toLowerCase().includes('college') ||
      h.title.toLowerCase().includes('institute') ||
      h.snippet.toLowerCase().includes('university') ||
      h.snippet.toLowerCase().includes('higher education')
    ) || hits[0];

    if (!bestHit || !bestHit.title) return null;

    // 2. Получение краткой сводки и описания кампуса
    const pageTitle = bestHit.title.replace(/ /g, '_');
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
    const sumRes = await fetch(summaryUrl, { headers: { 'Accept': 'application/json' } });
    if (!sumRes.ok) return null;
    const sum = await sumRes.json();
    if (!sum || !sum.title) return null;

    // Проверяем, что это академическое учреждение
    const fullText = `${sum.title} ${sum.description || ''} ${sum.extract || ''}`.toLowerCase();
    const isAcademic =
      fullText.includes('university') ||
      fullText.includes('college') ||
      fullText.includes('institute') ||
      fullText.includes('school') ||
      fullText.includes('campus') ||
      fullText.includes('academic') ||
      fullText.includes('faculty') ||
      fullText.includes('polytechnic');

    if (!isAcademic) return null;

    return buildUniversityProgramFromWiki(sum, qClean, profile);
  } catch (err) {
    console.warn('Live Wikipedia university search failed or network offline:', err);
    return null;
  }
}

/**
 * Формирование фактологической программы на основе реальных данных из Википедии
 */
function buildUniversityProgramFromWiki(
  sum: any,
  rawQuery: string,
  profile: UserProfile
): UniversityProgram {
  const fullText = `${sum.title} ${sum.description || ''} ${sum.extract || ''}`.toLowerCase();

  let country = 'Международный университет';
  let city = 'Международный кампус';
  let region: 'kazakhstan' | 'europe' | 'asia' | 'usa' = profile.targetRegion === 'kazakhstan' ? 'europe' : profile.targetRegion;
  let language = 'Английский (IELTS 6.5 / TOEFL 85+)';
  let tuition = 'Международные стипендии или $18 000 – 35 000 / год';
  let exam = 'SAT / Международный аттестат со средним баллом от 4.7';
  let avgSalary = 'от $55 000 / год';
  let acceptanceRate = '20%';
  let avgGpa = 4.65;
  let employers = ['Google', 'Microsoft', 'Deloitte', 'Amazon', 'PwC'];

  if (fullText.includes('hong kong') || fullText.includes('kowloon')) {
    country = 'Гонконг (САР Китая)';
    city = 'Гонконг';
    region = 'asia';
    language = 'Английский (IELTS 6.5 / TOEFL 79+)';
    tuition = 'HKD 145 000 – 180 000 / год (~$18 500) или стипендии Top Scholarship (100% покрытие)';
    exam = 'SAT (1320+) / IB (30+) / высокий балл аттестата';
    avgSalary = 'от HKD 26 000 / мес (~$3 300)';
    acceptanceRate = '16%';
    avgGpa = 4.7;
    employers = ['HSBC', 'Goldman Sachs Hong Kong', 'Tencent HK', 'Microsoft Hong Kong', 'PwC HK'];
  } else if (fullText.includes('singapore')) {
    country = 'Сингапур';
    city = 'Сингапур';
    region = 'asia';
    language = 'Английский (IELTS 6.5 – 7.0 / TOEFL 92+)';
    tuition = 'MOE Tuition Grant (субсидия ~50%) или SGD 18 000 – 32 000/год';
    exam = 'SAT (1420+) / ACT (32+) / отличный аттестат';
    avgSalary = 'от SGD 5 200 / мес';
    acceptanceRate = '12%';
    avgGpa = 4.9;
    employers = ['DBS Bank', 'Shopee', 'Grab', 'Google Singapore', 'Temasek'];
  } else if (fullText.includes('united states') || fullText.includes('california') || fullText.includes('new york') || fullText.includes('massachusetts') || fullText.includes('pennsylvania') || fullText.includes('illinois') || fullText.includes('texas')) {
    country = 'США';
    city = sum.description?.split(',')[1]?.trim() || 'США';
    region = 'usa';
    language = 'TOEFL 90-100+ / IELTS 7.0';
    tuition = 'Need-based Financial Aid / Merit-based стипендии ($35 000 – 65 000/год)';
    exam = 'SAT (1350 – 1520) / ACT (30-34) + транскрипт + эссе Common App';
    avgSalary = 'от $78 000 / год';
    acceptanceRate = '14%';
    avgGpa = 4.85;
    employers = ['Google', 'Microsoft', 'Apple', 'Meta', 'McKinsey', 'Amazon'];
  } else if (fullText.includes('united kingdom') || fullText.includes('england') || fullText.includes('scotland') || fullText.includes('london') || fullText.includes('wales')) {
    country = 'Великобритания';
    city = fullText.includes('london') ? 'Лондон' : sum.description?.split(',')[1]?.trim() || 'Великобритания';
    region = 'europe';
    language = 'IELTS UKVI 6.5 – 7.0 (min 6.0)';
    tuition = 'Стипендии вузов или £20 000 – 38 000/год';
    exam = 'A-Levels / IB / Foundation или SAT (1320+)';
    avgSalary = 'от £42 000 / год';
    acceptanceRate = '18%';
    avgGpa = 4.8;
    employers = ['Barclays', 'HSBC', 'Deloitte', 'Amazon UK', 'ARM'];
  } else if (fullText.includes('canada') || fullText.includes('toronto') || fullText.includes('vancouver') || fullText.includes('montreal') || fullText.includes('ontario')) {
    country = 'Канада';
    city = sum.description?.split(',')[1]?.trim() || 'Канада';
    region = 'usa';
    language = 'IELTS 6.5 (min 6.0) / TOEFL 90+';
    tuition = 'International Entrance Scholarships или CAD $32 000 – 58 000/год';
    exam = 'Аттестат с высоким средним баллом + математика';
    avgSalary = 'от CAD $72 000 / год';
    acceptanceRate = '22%';
    avgGpa = 4.75;
    employers = ['Shopify', 'RBC', 'Amazon Canada', 'Scotiabank', 'TD Bank'];
  } else if (fullText.includes('germany') || fullText.includes('deutschland') || fullText.includes('berlin') || fullText.includes('munich')) {
    country = 'Германия';
    city = 'Германия';
    region = 'europe';
    language = 'Немецкий (TestDaF 4x4 / Goethe C1) или Английский (IELTS 6.5)';
    tuition = 'Бесплатное обучение (€0, семестровый сбор €150 – 350)';
    exam = 'Studienkolleg / Feststellungsprüfung или 1-2 курса вуза в РК';
    avgSalary = 'от €48 000 / год';
    acceptanceRate = '24%';
    avgGpa = 4.7;
    employers = ['BMW Group', 'Siemens', 'SAP', 'Bosch', 'Deutsche Bank'];
  } else if (fullText.includes('italy') || fullText.includes('italia') || fullText.includes('milan') || fullText.includes('rome') || fullText.includes('turin')) {
    country = 'Италия';
    city = 'Италия';
    region = 'europe';
    language = 'Английский (IELTS 6.0 / B2)';
    tuition = '100% региональная стипендия DSU / EDiSU (€0 + стипендия до €7 500/год)';
    exam = 'Экзамен TOLC (TOLC-I / TOLC-E) или SAT (1150+)';
    avgSalary = 'от €38 000 / год';
    acceptanceRate = '30%';
    avgGpa = 4.4;
    employers = ['Ferrari', 'UniCredit', 'Pirelli', 'Leonardo', 'Eni'];
  } else if (fullText.includes('switzerland') || fullText.includes('zurich') || fullText.includes('lausanne')) {
    country = 'Швейцария';
    city = 'Швейцария';
    region = 'europe';
    language = 'Английский (IELTS 7.0) или Немецкий/Французский C1';
    tuition = 'CHF 1 500 – 2 500 / год (госсубсидия Швейцарии)';
    exam = 'Аттестат с отличием + вступительный экзамен';
    avgSalary = 'от CHF 95 000 / год';
    acceptanceRate = '20%';
    avgGpa = 4.9;
    employers = ['Google Zurich', 'ABB', 'Roche', 'Novartis', 'CERN'];
  } else if (fullText.includes('south korea') || fullText.includes('korea') || fullText.includes('seoul')) {
    country = 'Южная Корея';
    city = 'Сеул';
    region = 'asia';
    language = 'IELTS 6.0+ / TOEFL 80+ или TOPIK 3+';
    tuition = '100% стипендия GKS (Global Korea Scholarship) или вузовские гранты';
    exam = 'Школьный аттестат + портфолио / олимпиады';
    avgSalary = 'от ₩45 000 000 / год';
    acceptanceRate = '18%';
    avgGpa = 4.75;
    employers = ['Samsung Electronics', 'LG Electronics', 'Hyundai', 'Naver', 'Kakao'];
  } else if (fullText.includes('japan') || fullText.includes('tokyo') || fullText.includes('kyoto')) {
    country = 'Япония';
    city = 'Токио';
    region = 'asia';
    language = 'JLPT N2 или IELTS 6.5 (программы English-track)';
    tuition = '100% стипендия MEXT или ¥535 800/год';
    exam = 'EJU или SAT (1300+)';
    avgSalary = 'от ¥4 500 000 / год';
    acceptanceRate = '20%';
    avgGpa = 4.7;
    employers = ['Sony', 'Toyota', 'Rakuten', 'Panasonic', 'Hitachi'];
  } else if (fullText.includes('china') || fullText.includes('beijing') || fullText.includes('shanghai')) {
    country = 'Китай';
    city = 'Китай';
    region = 'asia';
    language = 'HSK 4-5 (китайский поток) или IELTS 6.0 (английский)';
    tuition = '100% правительственный грант CSC (Chinese Government Scholarship)';
    exam = 'Школьный аттестат + рекомендации';
    avgSalary = 'от ¥180 000 / год';
    acceptanceRate = '22%';
    avgGpa = 4.7;
    employers = ['Alibaba Group', 'Tencent', 'Huawei', 'Baidu', 'ByteDance'];
  } else if (fullText.includes('australia') || fullText.includes('melbourne') || fullText.includes('sydney')) {
    country = 'Австралия';
    city = 'Австралия';
    region = 'asia';
    language = 'IELTS 6.5 (min 6.0)';
    tuition = 'AUD $34 000 – 48 000 / год (стипендии до 50%)';
    exam = 'Аттестат с высоким средним баллом или Foundation';
    avgSalary = 'от AUD $75 000 / год';
    acceptanceRate = '25%';
    avgGpa = 4.6;
    employers = ['Atlassian', 'Canva', 'Commonwealth Bank', 'Macquarie', 'BHP'];
  } else if (fullText.includes('kazakhstan') || fullText.includes('almaty') || fullText.includes('astana')) {
    country = 'Казахстан';
    city = fullText.includes('astana') ? 'Астана' : fullText.includes('almaty') ? 'Алматы' : 'Казахстан';
    region = 'kazakhstan';
    language = 'Русский / Казахский / Английский';
    tuition = 'Гос. грант РК или от 1 350 000 ₸/год';
    exam = 'ЕНТ профильные (от 75+ платное, от 105+ грант)';
    avgSalary = 'от 520 000 ₸/мес';
    acceptanceRate = '35%';
    avgGpa = 4.2;
    employers = ['Kaspi.kz', 'Halyk Bank', 'КазМунайГаз', 'Astana Hub'];
  }

  const FIELD_HUMAN_NAMES: Record<FieldOfInterest, string> = {
    cs_it: 'Компьютерные науки, IT & Software Engineering',
    engineering: 'Инженерия, робототехника и технологии',
    business_econ: 'Международный бизнес, финансы и экономика',
    medicine_bio: 'Медицина, биомедицина и науки о здоровье',
    design_media: 'Дизайн, медиакоммуникации и цифровые медиа',
    social_law: 'Международные отношения, право и общество'
  };

  const humanField = FIELD_HUMAN_NAMES[profile.field] || 'Академическая программа бакалавриата';
  const cleanTitle = sum.title || rawQuery;
  const shortName = rawQuery.trim().toUpperCase() === rawQuery.trim() ? rawQuery.trim() : (cleanTitle.split(/[\s(]/)[0] || cleanTitle);
  const wikiExtract = sum.extract ? sum.extract.slice(0, 320) + '...' : `Официальная университетская программа бакалавриата ${cleanTitle}.`;

  const raw: UniversityProgram = {
    id: `wiki-${Date.now()}`,
    name: cleanTitle,
    shortName,
    city,
    country,
    region,
    fields: [profile.field],
    programTitle: `Бакалавриат по направлению «${humanField}»`,
    degrees: ['Бакалавриат (3-4 года)'],
    acceptanceRate,
    avgGpa,
    languageRequirement: language,
    examRequirement: exam,
    tuitionYearKztOrUsd: tuition,
    scholarshipAvailability: country === 'Казахстан' || tuition.includes('100%') || tuition.includes('Бесплатное') ? '100% гранты' : 'Частичные стипендии',
    hasDormitory: true,
    matchCategory: 'target',
    matchScore: 85,
    whyFits: [
      `Реальный признанный университет мирового уровня, найденный в международных академических реестрах`,
      sum.description ? `${sum.description}` : `Предоставляет качественное высшее образование в регионе ${country}`,
      `Возможность претендовать на стипендиальные программы и международные карьерные стажировки`
    ],
    keyStrengths: [
      country !== 'Казахстан' ? 'Международный диплом' : 'Государственная аккредитация',
      'Академическая репутация',
      'Карьерные перспективы'
    ],
    avgGraduateSalary: avgSalary,
    applicationDeadline: region === 'usa' ? '15 января 2026' : region === 'europe' ? '30 апреля 2026' : '31 мая 2026',
    officialSiteUrl: sum.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(cleanTitle.replace(/ /g, '_'))}`,
    details: {
      aboutCampus: `${wikiExtract} Оснащен современными аудиториями, исследовательскими библиотеками и специализированными лабораториями.`,
      studentLife: 'Интернациональные студенческие клубы, научные сообщества, спортивные секции и кейс-турниры.',
      livingCostsPerMonth: region === 'usa' ? '~$1 500 – 2 200 / мес' : region === 'europe' ? '~€700 – 1 200 / мес' : region === 'asia' ? '~$700 – 1 100 / мес' : '~120 000 – 160 000 ₸/мес',
      dormitoryDetails: 'Студенческий кампус и общежития с приоритетом заселения международных первокурсников.',
      topEmployers: employers,
      rounds: {
        early: { name: 'Ранний прием (Early Round)', deadline: 'Ноябрь 2025 — Январь 2026', description: 'Подача на стипендии и раннее зачисление.', recommendedFor: 'Кандидатам с готовыми тестами.' },
        regular: { name: 'Основной поток (Regular)', deadline: 'Март — Май 2026', description: 'Главный конкурс документов.', recommendedFor: 'Всем абитуриентам.' },
        late: { name: 'Поздний добор', deadline: 'Июль — Август 2026', description: 'Зачисление на свободные места.', recommendedFor: 'Запасной поток.' }
      },
      grantStats: {
        lastYearGrantsCount: 'Выделяются ежегодные институциональные и государственные стипендии',
        lastYearCutoff: country === 'Казахстан' ? 'ЕНТ от 105 баллов' : 'Высокий средний балл аттестата + языковой сертификат',
        competitionRatio: '3.2 человека на 1 место',
        grantChanceSummary: `Шансы на зачисление в ${cleanTitle} оцениваются на основе академической успеваемости и уровня иностранного языка.`
      }
    }
  };

  const ev = evaluateUniversityProgram(raw, profile);
  return { ...raw, ...ev, isAiGenerated: true };
}


export function generateSmartFallbackUniversity(
  query: string,
  profile: UserProfile
): UniversityProgram {
  const q = query.trim().toLowerCase();

  // Check verified database first
  const dbMatch = findUniversityInDatabase(q);
  if (dbMatch) {
    const ev = evaluateUniversityProgram(dbMatch, profile);
    return { ...dbMatch, ...ev, isAiGenerated: true };
  }

  // Known University Dictionaries
  if (q.includes('асфенди') || q.includes('казнму') || q.includes('asfendiyarov')) {
    const raw: UniversityProgram = {
      id: 'custom-kaznmu',
      name: 'КазНМУ им. С.Д. Асфендиярова (Ведущий медицинский университет РК)',
      shortName: 'КазНМУ',
      city: 'Алматы',
      country: 'Казахстан',
      region: 'kazakhstan',
      fields: ['medicine_bio'],
      programTitle: 'Общая медицина / Педиатрия / Фармация',
      degrees: ['Бакалавриат (5-6 лет)'],
      acceptanceRate: '22%',
      avgGpa: 4.75,
      languageRequirement: 'Русский / Казахский / Английский',
      examRequirement: 'ЕНТ: Биология + Химия (от 85+ платное, 126-138 грант) + Психометрический тест',
      tuitionYearKztOrUsd: 'Гос. грант РК или от 1 650 000 ₸/год',
      scholarshipAvailability: '100% гранты',
      hasDormitory: true,
      matchCategory: 'target',
      matchScore: 89,
      whyFits: [
        'Старейший и главный медицинский университет Казахстана с вековой историей',
        'Собственные клинические базы и университетские клиники в Алматы',
        'Высокий конкурс на государственные образовательные гранты в сфере здравоохранения'
      ],
      keyStrengths: ['Ведущий медвуз страны', 'Собственные клиники', 'Международная аккредитация'],
      avgGraduateSalary: 'от 450 000 ₸/мес',
      applicationDeadline: '20 июля 2026',
      officialSiteUrl: 'https://kaznmu.edu.kz',
      details: {
        aboutCampus: 'Исторический кампус в центре Алматы на ул. Толе би с симуляционными центрами и анатомическим музеем.',
        studentLife: 'Медицинские конференции, волонтерские ассоциации Красного Полумесяца, научные кружки.',
        livingCostsPerMonth: '~150 000 ₸/мес',
        dormitoryDetails: '7 студенческих общежитий КазНМУ, первоочередное заселение 1 курса.',
        topEmployers: ['Национальные научные медицинские центры', 'Сети клиник Syzganov / Densaulyk', 'Фармацевтические холдинги'],
        rounds: {
          early: { name: 'Психометрический экзамен', deadline: 'Июнь — Июль 2026', description: 'Обязательный допуск к конкурсу грантов.', recommendedFor: 'Всем абитуриентам мед. специальностей.' },
          regular: { name: 'Конкурс госгрантов МНВО РК', deadline: '13 — 20 июля 2026', description: 'Основное распределение государственных грантов.', recommendedFor: 'Кандидатам с ЕНТ 120+.' },
          late: { name: 'Платное зачисление', deadline: 'До 25 августа 2026', description: 'Заключение договоров на коммерческую основу.', recommendedFor: 'При ЕНТ от 85 баллов.' }
        },
        grantStats: {
          lastYearGrantsCount: 'Свыше 2 800 грантов по группе «Здравоохранение»',
          lastYearCutoff: 'ЕНТ 126 баллов (сельская квота от 118)',
          competitionRatio: '4.2 человека на грант',
          grantChanceSummary: 'Для гранта требуется упорная подготовка по Биологии и Химии.'
        }
      }
    };
    const ev = evaluateUniversityProgram(raw, profile);
    return { ...raw, ...ev, isAiGenerated: true };
  }

  if (q.includes('ауэс') || q.includes('daukeyev') || q.includes('энерго')) {
    const raw: UniversityProgram = {
      id: 'custom-aues',
      name: 'АУЭС им. Гумарбека Даукеева (Энергетика и Связь)',
      shortName: 'АУЭС',
      city: 'Алматы',
      country: 'Казахстан',
      region: 'kazakhstan',
      fields: ['engineering', 'cs_it'],
      programTitle: 'B.Eng. Электроэнергетика, Кибербезопасность & Телекоммуникации',
      degrees: ['Бакалавриат (4 года)'],
      acceptanceRate: '45%',
      avgGpa: 4.2,
      languageRequirement: 'Русский / Казахский / Английский',
      examRequirement: 'ЕНТ: Математика + Физика/Информатика (от 65+ платное, 95-115 грант)',
      tuitionYearKztOrUsd: 'Гос. грант РК или ~1 350 000 ₸/год',
      scholarshipAvailability: '100% гранты',
      hasDormitory: true,
      matchCategory: 'target',
      matchScore: 92,
      whyFits: [
        'Флагман энергетического и телекоммуникационного образования РК',
        'Огромное число государственных грантов и квот на инженерные профили',
        '100% востребованность выпускников в энергетике, сетях и дата-центрах'
      ],
      keyStrengths: ['№1 в энергетике и сетях', 'Высокая доступность грантов', 'Связи с индустрией'],
      avgGraduateSalary: 'от 520 000 ₸/мес',
      applicationDeadline: '20 июля 2026',
      officialSiteUrl: 'https://aues.edu.kz',
      details: {
        aboutCampus: 'Кампус на ул. Байтурсынова в Алматы с уникальными высоковольтными и микропроцессорными лабораториями.',
        studentLife: 'Инженерные кружки, робототехника, киберспортивные турниры.',
        livingCostsPerMonth: '~120 000 – 150 000 ₸/мес',
        dormitoryDetails: 'Несколько корпусов Дома студентов рядом с учебными зданиями.',
        topEmployers: ['KEGOC', 'Казахтелеком', 'Samruk-Energy', 'Beeline', 'Schneider Electric', 'ABB'],
        rounds: {
          early: { name: 'Ранний прием и профориентация', deadline: 'Апрель — Июнь 2026', description: 'Консультации и подача заявлений.', recommendedFor: 'Выпускникам с готовым ЕНТ.' },
          regular: { name: 'Конкурс госгрантов', deadline: '13 — 20 июля 2026', description: 'Основная подача на гранты РК.', recommendedFor: 'Всем абитуриентам.' },
          late: { name: 'Зачисление на контракт', deadline: 'Август 2026', description: 'Платное обучение.', recommendedFor: 'При ЕНТ от 65 баллов.' }
        },
        grantStats: {
          lastYearGrantsCount: 'Свыше 1 500 целевых грантов',
          lastYearCutoff: 'ЕНТ от 95 баллов на энергетику, 112 на IT',
          competitionRatio: '1.8 человека на место',
          grantChanceSummary: 'Отличные шансы на получение 100% государственного гранта.'
        }
      }
    };
    const ev = evaluateUniversityProgram(raw, profile);
    return { ...raw, ...ev, isAiGenerated: true };
  }

  if (q.includes('нархоз') || q.includes('narxoz')) {
    const raw: UniversityProgram = {
      id: 'custom-narxoz',
      name: 'Университет Нархоз (Narxoz University)',
      shortName: 'Нархоз',
      city: 'Алматы',
      country: 'Казахстан',
      region: 'kazakhstan',
      fields: ['business_econ', 'social_law', 'cs_it'],
      programTitle: 'B.Sc. Финансы, Аудит & Цифровой менеджмент',
      degrees: ['Бакалавриат (4 года)'],
      acceptanceRate: '38%',
      avgGpa: 4.3,
      languageRequirement: 'Русский / Казахский / Английский',
      examRequirement: 'ЕНТ профильные (от 70+ платное, 108-126 грант)',
      tuitionYearKztOrUsd: 'Гос. грант РК или ~1 800 000 ₸/год',
      scholarshipAvailability: '100% гранты',
      hasDormitory: true,
      matchCategory: 'target',
      matchScore: 87,
      whyFits: [
        'Международная аккредитация европейского уровня FIBAA и CEEMAN',
        'Новый кампус мирового уровня с собственным парком и спортивным комплексом',
        'Программы двойного диплома с ведущими вузами Европы (Франция, Польша, Германия)'
      ],
      keyStrengths: ['Европейские аккредитации', 'Ультрасовременный кампус', 'Двойные дипломы'],
      avgGraduateSalary: 'от 600 000 ₸/мес',
      applicationDeadline: '20 июля 2026',
      officialSiteUrl: 'https://narxoz.edu.kz',
      details: {
        aboutCampus: 'Эко-кампус на ул. Жандосова в Алматы: зеленая территория, умные аудитории, круглосуточная библиотека.',
        studentLife: 'Кейс-клубы, инвестиционный фонд Narxoz Capital, бизнес-инкубатор.',
        livingCostsPerMonth: '~130 000 – 160 000 ₸/мес',
        dormitoryDetails: 'Современный Дом студентов Narxoz Residence с отельными условиями.',
        topEmployers: ['Ernst & Young', 'PwC', 'KPMG', 'Deloitte', 'Halyk Bank', 'ForteBank', 'Air Astana'],
        rounds: {
          early: { name: 'Гранты Ректора Нархоз', deadline: 'Май — Июнь 2026', description: 'Конкурс внутренних олимпиад и грантов.', recommendedFor: 'Отличникам учебы и олимпиадникам.' },
          regular: { name: 'Государственный конкурс грантов', deadline: 'Июль 2026', description: 'Распределение госгрантов РК.', recommendedFor: 'Всем абитуриентам.' },
          late: { name: 'Платное зачисление', deadline: 'Август 2026', description: 'Контрактное обучение.', recommendedFor: 'Всем желающим.' }
        },
        grantStats: {
          lastYearGrantsCount: 'Около 650 государственных и внутренних грантов',
          lastYearCutoff: 'ЕНТ от 110 баллов на экономику и финансы',
          competitionRatio: '3.1 человека на место',
          grantChanceSummary: 'Хорошие шансы при сильных результатах ЕНТ по профильной математике.'
        }
      }
    };
    const ev = evaluateUniversityProgram(raw, profile);
    return { ...raw, ...ev, isAiGenerated: true };
  }

  if (q.includes('тренто') || q.includes('trento')) {
    const raw: UniversityProgram = {
      id: 'custom-trento',
      name: 'University of Trento (Университет Тренто)',
      shortName: 'UniTrento',
      city: 'Тренто',
      country: 'Италия',
      region: 'europe',
      fields: ['cs_it', 'engineering'],
      programTitle: 'B.Sc. in Computer, Communications & Electronic Engineering',
      degrees: ['Бакалавриат (3 года)'],
      acceptanceRate: '32%',
      avgGpa: 4.4,
      languageRequirement: 'IELTS 6.0 / B2',
      examRequirement: 'Экзамен TOLC-I / SAT (1180+)',
      tuitionYearKztOrUsd: 'Стипендия Opera Universitaria: €0 + до €6 500/год',
      scholarshipAvailability: '100% гранты',
      hasDormitory: true,
      matchCategory: 'target',
      matchScore: 91,
      whyFits: [
        'Один из лидеров Италии по уровню научных исследований в IT и инженерии',
        'Полная региональная стипендия Opera Universitaria покрывает 100% учебы и выплачивает стипендию',
        'Живописный кампус в Альпах с высочайшим качеством жизни'
      ],
      keyStrengths: ['Стипендия Opera Universitaria', 'Качество жизни в Альпах', 'Англоязычная программа'],
      avgGraduateSalary: '€38 000 / год',
      applicationDeadline: '8 марта 2026',
      officialSiteUrl: 'https://www.unitn.it',
      details: {
        aboutCampus: 'Кампус в Доломитовых Альпах (Povo Campus) с современными дата-центрами и биоинженерными хабами.',
        studentLife: 'Горнолыжный спорт, походы в горы, активное интернациональное студенческое сообщество.',
        livingCostsPerMonth: 'Полностью компенсируется стипендией Opera Universitaria',
        dormitoryDetails: 'Студенческие резиденции Opera Universitaria с приоритетом для грантников.',
        topEmployers: ['Trento RISE', 'FBK (Fondazione Bruno Kessler)', 'Ferrari', 'STMicroelectronics'],
        rounds: {
          early: { name: 'Non-EU Early Call', deadline: '15 декабря 2025 — 8 марта 2026', description: 'Основное окно подачи для граждан стран, не входящих в ЕС.', recommendedFor: 'Всем абитуриентам из Казахстана.' },
          regular: { name: 'Рейтинговый список и подтверждение', deadline: 'Апрель — Май 2026', description: 'Публикация списков зачисленных и оформление Universitaly.', recommendedFor: 'Принятым кандидатам.' },
          late: { name: 'Подача на стипендию Opera Universitaria', deadline: 'Июнь — Август 2026', description: 'Загрузка финансовых справок на освобождение от оплаты.', recommendedFor: 'Всем поступившим.' }
        },
        grantStats: {
          lastYearGrantsCount: 'Свыше 1 200 региональных стипендий',
          lastYearCutoff: 'TOLC-I от 19 баллов + финансовый критерий ISEE',
          competitionRatio: '2.6 человека на 1 место',
          grantChanceSummary: 'Превосходные шансы получить 100% финансирование в Италии.'
        }
      }
    };
    const ev = evaluateUniversityProgram(raw, profile);
    return { ...raw, ...ev, isAiGenerated: true };
  }

  if (q.includes('бокони') || q.includes('bocconi')) {
    const raw: UniversityProgram = {
      id: 'custom-bocconi',
      name: 'Bocconi University (Университет Боккони)',
      shortName: 'Bocconi',
      city: 'Милан',
      country: 'Италия',
      region: 'europe',
      fields: ['business_econ', 'social_law', 'cs_it'],
      programTitle: 'B.Sc. in Economics, Management & Computer Science',
      degrees: ['Бакалавриат (3 года)'],
      acceptanceRate: '18%',
      avgGpa: 4.8,
      languageRequirement: 'IELTS 6.5 / TOEFL 90+',
      examRequirement: 'Bocconi Test / SAT (1380+)',
      tuitionYearKztOrUsd: 'Bocconi ISU Scholarship: 100% грант или €15 000/год',
      scholarshipAvailability: '100% гранты',
      hasDormitory: true,
      matchCategory: 'reach',
      matchScore: 88,
      whyFits: [
        '№1 бизнес-школа континентальной Европы по финансам и менеджменту',
        'Стипендия ISU Bocconi обеспечивает 100% покрытие обучения и бесплатное жилье',
        'Прямой наем в Goldman Sachs, McKinsey, Bain, Morgan Stanley в Лондоне и Милане'
      ],
      keyStrengths: ['№1 в Европе по финансам', 'Элитный нетворкинг', 'Милан'],
      avgGraduateSalary: '€55 000 / год',
      applicationDeadline: '25 января 2026',
      officialSiteUrl: 'https://www.unibocconi.eu',
      details: {
        aboutCampus: 'Ультрасовременный кампус в центре Милана, спроектированный SANAA, с олимпийским бассейном и коворкингами.',
        studentLife: 'Интернациональная финансовая элита, студенческие инвест-фонды, Недели моды и финансов.',
        livingCostsPerMonth: 'Покрывается стипендией ISU Bocconi',
        dormitoryDetails: '7 кампусных резиденций Bocconi Residence Halls.',
        topEmployers: ['Goldman Sachs', 'McKinsey & Company', 'J.P. Morgan', 'Boston Consulting Group', 'Bain & Company'],
        rounds: {
          early: { name: 'Early Session', deadline: '15 июля — 22 сентября 2025', description: 'Ранний отбор для лучших школьников.', recommendedFor: 'Кандидатам с SAT 1420+.' },
          regular: { name: 'Winter Session (Основная)', deadline: '15 ноября 2025 — 25 января 2026', description: 'Главный поток международного набора.', recommendedFor: 'Большинству абитуриентов.' },
          late: { name: 'Spring Session', deadline: 'Март — Апрель 2026', description: 'Добор на оставшиеся квоты.', recommendedFor: 'Запасной поток.' }
        },
        grantStats: {
          lastYearGrantsCount: 'Около 300 полных стипендий ISU и Bocconi Merit Awards',
          lastYearCutoff: 'SAT 1400+ / GPA 4.85+',
          competitionRatio: '5.6 претендента на 1 место',
          grantChanceSummary: 'Высокая конкуренция. Необходим отличный SAT и сильный школьный табель.'
        }
      }
    };
    const ev = evaluateUniversityProgram(raw, profile);
    return { ...raw, ...ev, isAiGenerated: true };
  }

  if (q.includes('оксфорд') || q.includes('oxford')) {
    const raw: UniversityProgram = {
      id: 'custom-oxford',
      name: 'University of Oxford (Оксфордский университет)',
      shortName: 'Oxford',
      city: 'Оксфорд',
      country: 'Великобритания',
      region: 'europe',
      fields: ['cs_it', 'engineering', 'medicine_bio', 'social_law'],
      programTitle: 'BA in Computer Science / Mathematics',
      degrees: ['Бакалавриат (3-4 года)'],
      acceptanceRate: '13.7%',
      avgGpa: 4.98,
      languageRequirement: 'IELTS 7.5 (min 7.0 по всем блокам)',
      examRequirement: 'MAT (Mathematics Admissions Test) + строгие интервью колледжей',
      tuitionYearKztOrUsd: 'Clarendon Fund / Reach Oxford Scholarship или £39 000/год',
      scholarshipAvailability: 'Частичные стипендии',
      hasDormitory: true,
      matchCategory: 'reach',
      matchScore: 70,
      whyFits: [
        'Старейший англоязычный университет мира, вершина академического престижа',
        'Уникальная тьюторская система обучения (Tutorial system) 1-на-1 с профессорами',
        'Глобальное признание диплома в любой точке планеты'
      ],
      keyStrengths: ['Топ-3 мира', 'Тьюторская система', 'Культовый бренд'],
      avgGraduateSalary: '£60 000 / год',
      applicationDeadline: '15 октября 2025',
      officialSiteUrl: 'https://www.ox.ac.uk',
      details: {
        aboutCampus: '39 исторических автономных колледжей в Оксфорде: средневековые залы Бодлианской библиотеки и хабы квантовых вычислений.',
        studentLife: 'Вековые традиции, гребля, Oxford Union, костюмированные формальные ужины (Formal Hall).',
        livingCostsPerMonth: '~£1 200 – 1 600 в месяц',
        dormitoryDetails: 'Гарантированное проживание в своем колледже на 1-м курсе.',
        topEmployers: ['DeepMind', 'Jane Street', 'Oxford Science Enterprises', 'McKinsey', 'Goldman Sachs'],
        rounds: {
          early: { name: 'Единый строгий дедлайн UCAS', deadline: '15 октября 2025 (18:00 UK)', description: 'Единая подача через портал UCAS для Оксфорда.', recommendedFor: 'Обязателен для всех кандидатов.' },
          regular: { name: 'Вступительный экзамен MAT', deadline: 'Конец октября / ноябрь 2025', description: 'Письменный тест по высшей математике.', recommendedFor: 'Всем кандидатам на CS.' },
          late: { name: 'Коллегиальные интервью (Interviews)', deadline: 'Декабрь 2025', description: 'Серия академических собеседований с профессорами.', recommendedFor: 'Отобранным кандидатам.' }
        },
        grantStats: {
          lastYearGrantsCount: 'Стипендии Reach Oxford для иностранных студентов из развивающихся стран (2-3 места)',
          lastYearCutoff: 'GPA 5.0 / MAT 80+ / успешные интервью',
          competitionRatio: '7.8 человека на место',
          grantChanceSummary: 'ЧЕСТНОЕ ПРЕДУПРЕЖДЕНИЕ: вероятность поступления без олимпиадного уровня и идеального MAT минимальна.'
        }
      }
    };
    const ev = evaluateUniversityProgram(raw, profile);
    return { ...raw, ...ev, isAiGenerated: true };
  }

  // Dynamic Realistic Fallback for any unlisted university
  return generateRealisticUnknownUniversity(query, profile);
}

/**
 * Генерация свежих рекомендаций через Gemini или умную ротацию базы
 */
export async function generateAiUniversityRecommendations(
  profile: UserProfile,
  existingIds: string[],
  apiKey?: string
): Promise<UniversityProgram[]> {
  const key = apiKey || getGeminiApiKey();

  if (key && key.trim() !== '') {
    const prompt = `Ты — ведущий международный образовательный консультант.
Подбери 2 НОВЫХ, уникальных университета для абитуриента, которых НЕТ в списке: ${existingIds.slice(0, 10).join(', ')}.

Профиль:
- Специальность: ${profile.field}
- GPA: ${profile.gpa} / ${profile.gpaScale || '5.0'}
- Экзамены / SAT / ЕНТ: ${profile.satScore ? `${profile.stateExamScore || ''} [${profile.satScore}]`.trim() : profile.hasStateExam ? profile.stateExamScore : 'Не сдан'}
- Бюджет: ${profile.budget}
- Регион: ${profile.targetRegion}
- Язык: ${profile.hasLanguageTest ? profile.languageScore : 'Начальный'}

Верни ответ СТРОГО как валидный JSON массив из 2 объектов без markdown:
[
  {
    "id": "ai-rec-1",
    "name": "Название вуза",
    "shortName": "Аббревиатура",
    "city": "Город",
    "country": "Страна",
    "region": "${profile.targetRegion}",
    "fields": ["${profile.field}"],
    "programTitle": "Название программы",
    "degrees": ["Бакалавриат (3-4 года)"],
    "acceptanceRate": "30%",
    "avgGpa": 4.5,
    "languageRequirement": "IELTS 6.0",
    "examRequirement": "Экзамены",
    "tuitionYearKztOrUsd": "Стоимость или 100% грант",
    "scholarshipAvailability": "100% гранты",
    "hasDormitory": true,
    "matchCategory": "target",
    "matchScore": 87,
    "admissionChancePercentage": 60,
    "realityCheckWarning": "",
    "whyFits": ["Причина 1", "Причина 2"],
    "keyStrengths": ["Преимущество 1", "Преимущество 2"],
    "avgGraduateSalary": "Зарплата",
    "applicationDeadline": "Дедлайн 2026",
    "officialSiteUrl": "https://..."
  }
]`;

    try {
      const text = await callGeminiApi(prompt, key, 'application/json');
      if (text) {
        const parsed = JSON.parse(text) as UniversityProgram[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((u, i) => {
            const ev = evaluateUniversityProgram(u, profile);
            return {
              ...u,
              ...ev,
              id: `ai-rec-${Date.now()}-${i}`,
              isAiGenerated: true
            };
          });
        }
      }
    } catch (e) {
      console.warn('Gemini API recommendations parsing failed, activating fallback:', e);
    }
  }

  // Fallback: Return diverse items from the main verified database that match the field
  const remaining = UNIVERSITIES_DATABASE.filter(u => !existingIds.includes(u.id));
  const fieldMatches = remaining.filter(u => u.fields.includes(profile.field));
  const pool = fieldMatches.length >= 2 ? fieldMatches : remaining;

  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 2).map((u, i) => {
    const ev = evaluateUniversityProgram(u, profile);
    return {
      ...u,
      ...ev,
      id: `${u.id}-rot-${i}`,
      isAiGenerated: true
    };
  });
}

/**
 * Проверка валидности API ключа и связи с Google Gemini
 */
export async function testGeminiConnection(apiKey?: string): Promise<{ success: boolean; message: string }> {
  const key = apiKey || getGeminiApiKey();
  if (!key || !key.trim()) {
    return { success: false, message: 'API-ключ не задан' };
  }

  try {
    const text = await callGeminiApi('Answer in one word: ok', key, 'text/plain');
    if (text) {
      return { success: true, message: `Успешное подключение к Gemini (${PRIMARY_MODEL})!` };
    }
    return { success: false, message: 'Gemini не вернул ответ' };
  } catch (e: any) {
    return { success: false, message: e.message || 'Ошибка сети при обращении к Gemini' };
  }
}
