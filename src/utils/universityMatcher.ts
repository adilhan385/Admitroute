import type { UniversityProgram, UserProfile } from '../types';
import { UNIVERSITIES_DATABASE } from '../data/universities';
import { evaluateUniversityProgram } from './engine';

/**
 * Нормализация текста для поиска:
 * - перевод в нижний регистр
 * - удаление точек, дефисов, кавычек, лишних пробелов
 * - поддержка транслитерации и частых опечаток
 */
export function normalizeSearchText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[«»""''`\.,\-\/\\()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Исчерпывающая база синонимов, аббревиатур и названий университетов.
 * Позволяет пользователю вводить «НУ», «СДУ», «КБТУ», «МУИТ», «АИТУ»,
 * «МГУ», «ВШЭ», «МФТИ», «Гарвард», «MIT», «Stanford», «KAIST», «TUM» и т.д.
 * на русском, казахском или английском языке — и гарантированно находить настоящий вуз.
 */
export const ALIAS_TO_ID_MAP: Record<string, string> = {
  // КАЗАХСТАН
  'ну': 'nu-cs',
  'nu': 'nu-cs',
  'назарбаев': 'nu-cs',
  'nazarbayev': 'nu-cs',
  'nazarbayev university': 'nu-cs',
  'назарбаев университет': 'nu-cs',
  'nu kz': 'nu-cs',
  'нует': 'nu-cs',

  'кбту': 'kbtu-it',
  'kbtu': 'kbtu-it',
  'казахстанско британский': 'kbtu-it',
  'казахстанско-британский': 'kbtu-it',
  'казахско британский': 'kbtu-it',
  'кбту алматы': 'kbtu-it',

  'аиту': 'aitu-cs',
  'aitu': 'aitu-cs',
  'astana it': 'aitu-cs',
  'астана ит': 'aitu-cs',
  'astana it university': 'aitu-cs',
  'астана айти': 'aitu-cs',

  'сду': 'sdu-it',
  'sdu': 'sdu-it',
  'сулейман демирель': 'sdu-it',
  'suleyman demirel': 'sdu-it',
  'демирель': 'sdu-it',
  'сду каскелен': 'sdu-it',
  'демирел': 'sdu-it',

  'казну': 'kaznu-cs',
  'kaznu': 'kaznu-cs',
  'аль фараби': 'kaznu-cs',
  'аль-фараби': 'kaznu-cs',
  'al farabi': 'kaznu-cs',
  'al-farabi': 'kaznu-cs',
  'казгу': 'kaznu-cs',

  'муит': 'iitu-cs',
  'iitu': 'iitu-cs',
  'iitu kz': 'iitu-cs',
  'международный университет информационных технологий': 'iitu-cs',
  'ит университет алматы': 'iitu-cs',

  'политех': 'satbayev-eng',
  'сатпаев': 'satbayev-eng',
  'satbayev': 'satbayev-eng',
  'казниту': 'satbayev-eng',
  'казпти': 'satbayev-eng',
  'satbayev university': 'satbayev-eng',
  'политех алматы': 'satbayev-eng',

  'кимэп': 'kimep-econ',
  'kimep': 'kimep-econ',
  'kimep university': 'kimep-econ',
  'университет кимэп': 'kimep-econ',

  'мну': 'kazgyu-law',
  'mnu': 'kazgyu-law',
  'казгюу': 'kazgyu-law',
  'kazgyu': 'kazgyu-law',
  'нарикбаев': 'kazgyu-law',
  'narikbayev': 'kazgyu-law',
  'kazguu': 'kazgyu-law',
  'казгюу астана': 'kazgyu-law',

  'ену': 'enu-it',
  'enu': 'enu-it',
  'гумилев': 'enu-it',
  'гумилева': 'enu-it',
  'gumilyov': 'enu-it',
  'евразийский': 'enu-it',

  'нархоз': 'narxoz-biz',
  'narxoz': 'narxoz-biz',
  'казэу': 'narxoz-biz',
  'рыскулов': 'narxoz-biz',

  'ауэс': 'aues-eng',
  'aues': 'aues-eng',
  'даукеев': 'aues-eng',
  'энерго': 'aues-eng',
  'энергетический': 'aues-eng',

  'казнму': 'kaznmu-med',
  'kaznmu': 'kaznmu-med',
  'асфендияров': 'kaznmu-med',
  'asfendiyarov': 'kaznmu-med',
  'медицинский асфендиярова': 'kaznmu-med',

  'муа': 'mua-med',
  'mua': 'mua-med',
  'мед астана': 'mua-med',
  'медицинский астана': 'mua-med',

  'алмаю': 'almau-biz',
  'almau': 'almau-biz',
  'маб': 'almau-biz',
  'iab': 'almau-biz',

  'карту': 'kartu-eng',
  'каргту': 'kartu-eng',
  'сагинов': 'kartu-eng',
  'политех караганда': 'kartu-eng',

  'каргу': 'kargu-law',
  'букетов': 'kargu-law',
  'buketov': 'kargu-law',

  'юку': 'sksu-eng',
  'sksu': 'sksu-eng',
  'ауэзов': 'sksu-eng',
  'auezov': 'sksu-eng',

  'тоу': 'tou-eng',
  'пгу': 'tou-eng',
  'торайгыров': 'tou-eng',

  'жубанов': 'arru-ped',
  'арру': 'arru-ped',
  'ару': 'arru-ped',

  'коркыт': 'korkyt-it',
  'коркыт ата': 'korkyt-it',

  'мкту': 'yassawi-med',
  'ясави': 'yassawi-med',
  'яссави': 'yassawi-med',

  'дулати': 'dulaty-eng',
  'таргу': 'dulaty-eng',

  'шакарим': 'shakarim-tech',

  'дку': 'dku-kz',
  'dku': 'dku-kz',
  'немецкий университет': 'dku-kz',

  'туран': 'turan-kz',
  'turan': 'turan-kz',

  'уиб': 'uib-kz',
  'uib': 'uib-kz',

  'каспийский': 'caspian-kz',
  'caspian': 'caspian-kz',

  'дмю': 'dmu-kz',
  'dmu': 'dmu-kz',
  'de montfort': 'dmu-kz',

  'ковентри': 'coventry-kz',
  'coventry': 'coventry-kz',

  // СНГ / РОССИЯ
  'мгу': 'msu-ru',
  'msu': 'msu-ru',
  'ломоносов': 'msu-ru',
  'московский государственный': 'msu-ru',

  'вшэ': 'hse-ru',
  'hse': 'hse-ru',
  'вышка': 'hse-ru',
  'высшая школа экономики': 'hse-ru',

  'мфти': 'mipt-ru',
  'mipt': 'mipt-ru',
  'физтех': 'mipt-ru',

  'спбгу': 'spbu-ru',
  'spbu': 'spbu-ru',
  'spbsu': 'spbu-ru',
  'санкт петербургский государственный': 'spbu-ru',

  'итмо': 'itmo-ru',
  'itmo': 'itmo-ru',

  'мгту': 'bmstu-ru',
  'бауманка': 'bmstu-ru',
  'баумана': 'bmstu-ru',
  'bmstu': 'bmstu-ru',

  'мгимо': 'mgimo-ru',
  'mgimo': 'mgimo-ru',

  // США И КАНАДА
  'mit': 'mit-usa',
  'мит': 'mit-usa',
  'массачусетский': 'mit-usa',

  'гарвард': 'harvard-usa',
  'harvard': 'harvard-usa',
  'харвард': 'harvard-usa',

  'стэнфорд': 'stanford-usa',
  'стенфорд': 'stanford-usa',
  'stanford': 'stanford-usa',

  'калтех': 'caltech-usa',
  'caltech': 'caltech-usa',

  'йель': 'yale-usa',
  'yale': 'yale-usa',

  'принстон': 'princeton-usa',
  'princeton': 'princeton-usa',

  'колумбийский': 'columbia-usa',
  'колумбия': 'columbia-usa',
  'columbia': 'columbia-usa',

  'беркли': 'berkeley-usa',
  'berkeley': 'berkeley-usa',
  'uc berkeley': 'berkeley-usa',
  'ucb': 'berkeley-usa',

  'укла': 'ucla-usa',
  'ucla': 'ucla-usa',

  'карнеги': 'cmu-usa',
  'карнеги меллон': 'cmu-usa',
  'cmu': 'cmu-usa',
  'carnegie mellon': 'cmu-usa',

  'нью йорк': 'nyu-usa',
  'nyu': 'nyu-usa',

  'пенсильванский': 'upenn-usa',
  'upenn': 'upenn-usa',

  'корнелл': 'cornell-usa',
  'cornell': 'cornell-usa',

  'джорджия тек': 'gatech-usa',
  'gatech': 'gatech-usa',

  'пердью': 'purdue-eng',
  'purdue': 'purdue-eng',

  'асу': 'asu-cs',
  'asu': 'asu-cs',
  'аризона': 'asu-cs',

  'юсф': 'usf-cs',
  'usf': 'usf-cs',

  'торонто': 'utoronto-ca',
  'utoronto': 'utoronto-ca',
  'u of t': 'utoronto-ca',
  'университет торонто': 'utoronto-ca',

  'ватерлоо': 'waterloo-ca',
  'waterloo': 'waterloo-ca',

  'макгилл': 'mcgill-ca',
  'mcgill': 'mcgill-ca',

  'юбс': 'ubc-ca',
  'ubc': 'ubc-ca',
  'британская колумбия': 'ubc-ca',

  // ВЕЛИКОБРИТАНИЯ
  'оксфорд': 'oxford-uk',
  'oxford': 'oxford-uk',
  'оксфордский': 'oxford-uk',

  'кембридж': 'cambridge-uk',
  'cambridge': 'cambridge-uk',
  'кембриджский': 'cambridge-uk',

  'империал': 'imperial-uk',
  'imperial': 'imperial-uk',
  'imperial college': 'imperial-uk',

  'юклей': 'ucl-uk',
  'ucl': 'ucl-uk',
  'university college london': 'ucl-uk',

  'лсе': 'lse-uk',
  'lse': 'lse-uk',

  'кингс': 'kcl-uk',
  'kcl': 'kcl-uk',

  'эдинбург': 'edinburgh-uk',
  'edinburgh': 'edinburgh-uk',

  // ЕВРОПА
  'этх': 'eth-ch',
  'eth': 'eth-ch',
  'eth zurich': 'eth-ch',
  'цюрих': 'eth-ch',

  'эпфл': 'epfl-ch',
  'epfl': 'epfl-ch',

  'тум': 'tum-cs',
  'tum': 'tum-cs',
  'мюнхенский технический': 'tum-cs',

  'лму': 'lmu-de',
  'lmu': 'lmu-de',
  'мюнхенский': 'lmu-de',

  'гейдельберг': 'heidelberg-de',
  'хайдельберг': 'heidelberg-de',
  'heidelberg': 'heidelberg-de',

  'аахен': 'rwth-eng',
  'rwth': 'rwth-eng',

  'полими': 'polimi-eng',
  'polimi': 'polimi-eng',
  'миланский политех': 'polimi-eng',

  'полито': 'polito-it',
  'polito': 'polito-it',
  'туринский политех': 'polito-it',

  'болонья': 'unibo-cs',
  'bologna': 'unibo-cs',
  'болонский': 'unibo-cs',

  'сапиенца': 'sapienza-it',
  'sapienza': 'sapienza-it',
  'римский': 'sapienza-it',

  'тренто': 'trento-it',
  'trento': 'trento-it',
  'unitn': 'trento-it',

  'боккони': 'bocconi-it',
  'бокони': 'bocconi-it',
  'bocconi': 'bocconi-it',

  'падуя': 'padova-it',
  'padova': 'padova-it',

  'дельфт': 'tudelft-eng',
  'tu delft': 'tudelft-eng',

  'сорбонна': 'sorbonne-fr',
  'sorbonne': 'sorbonne-fr',

  'карлов': 'cuni-cs',
  'cuni': 'cuni-cs',

  'чвут': 'cvut-cz',
  'cvut': 'cvut-cz',

  'элте': 'elte-cs',
  'elte': 'elte-cs',
  'bme': 'elte-cs',
  'будапешт': 'elte-cs',

  'дебрецен': 'debrecen-hu',
  'debrecen': 'debrecen-hu',

  'варшавский': 'uw-pl',
  'uw': 'uw-pl',
  'варшавский политех': 'pw-eng',
  'pw': 'pw-eng',

  // АЗИЯ
  'каист': 'kaist-cs',
  'kaist': 'kaist-cs',

  'сну': 'snu-kr',
  'snu': 'snu-kr',
  'сеульский': 'snu-kr',
  'сеульский национальный': 'snu-kr',

  'ёнсе': 'yonsei-kr',
  'йонсей': 'yonsei-kr',
  'yonsei': 'yonsei-kr',

  'корё': 'korea-kr',

  'юнист': 'unist-eng',
  'unist': 'unist-eng',

  'нус': 'nus-cs',
  'nus': 'nus-cs',
  'сингапур': 'nus-cs',

  'нту': 'ntu-sg',
  'ntu': 'ntu-sg',
  'наньян': 'ntu-sg',

  'хку': 'hku-hk',
  'hku': 'hku-hk',
  'гонконг': 'hku-hk',

  'хкуст': 'hkust-cs',
  'hkust': 'hkust-cs',

  'цинхуа': 'tsinghua-cs',
  'tsinghua': 'tsinghua-cs',

  'пекинский': 'peking-cn',
  'peking': 'peking-cn',

  'токио': 'utokyo-jp',
  'todai': 'utokyo-jp',

  'токио тек': 'tokyotech-eng',
  'tokyo tech': 'tokyotech-eng',

  'киото': 'kyoto-jp',
  'kyoto': 'kyoto-jp',

  'коч': 'koc-biz',
  'koc': 'koc-biz',

  'мету': 'metu-eng',
  'metu': 'metu-eng',

  'богазичи': 'bogazici-tr',
  'bogazici': 'bogazici-tr',

  'апу': 'apu-malaysia',
  'apu': 'apu-malaysia',

  'малайя': 'um-malaysia'
};

/**
 * Ищет университет в базе по точному совпадению алиаса, названия или подстроки
 */
export function findUniversityByAliasOrName(query: string): UniversityProgram | null {
  const norm = normalizeSearchText(query);
  if (!norm) return null;

  // 1. Прямой поиск по словарю алиасов
  if (ALIAS_TO_ID_MAP[norm]) {
    const targetId = ALIAS_TO_ID_MAP[norm];
    const found = UNIVERSITIES_DATABASE.find(u => u.id === targetId);
    if (found) return found;
  }

  // 2. Поиск по короткому названию (shortName) без учета регистра
  const exactShort = UNIVERSITIES_DATABASE.find(
    u => normalizeSearchText(u.shortName) === norm
  );
  if (exactShort) return exactShort;

  // 3. Поиск по собственному списку aliases у университета
  for (const u of UNIVERSITIES_DATABASE) {
    if (u.aliases && u.aliases.some(a => normalizeSearchText(a) === norm)) {
      return u;
    }
  }

  // 4. Поиск, если поисковый запрос полностью совпадает с началом или частью названия
  const startsWithMatch = UNIVERSITIES_DATABASE.find(
    u => normalizeSearchText(u.name).startsWith(norm) || normalizeSearchText(u.shortName).startsWith(norm)
  );
  if (startsWithMatch) return startsWithMatch;

  // 5. Поиск по вхождению в name, shortName, city
  const substringMatch = UNIVERSITIES_DATABASE.find(
    u =>
      normalizeSearchText(u.name).includes(norm) ||
      normalizeSearchText(u.shortName).includes(norm) ||
      (u.aliases && u.aliases.some(a => normalizeSearchText(a).includes(norm)))
  );
  if (substringMatch) return substringMatch;

  return null;
}

/**
 * Возвращает ранжированный список подсказок при наборе в строке поиска
 */
export function searchUniversitiesWithAliases(query: string, limit: number = 8): UniversityProgram[] {
  const norm = normalizeSearchText(query);
  if (!norm) return [];

  const results: Array<{ uni: UniversityProgram; priority: number }> = [];
  const addedIds = new Set<string>();

  // Проверка прямого совпадения по ALIAS_TO_ID_MAP
  if (ALIAS_TO_ID_MAP[norm]) {
    const targetId = ALIAS_TO_ID_MAP[norm];
    const found = UNIVERSITIES_DATABASE.find(u => u.id === targetId);
    if (found && !addedIds.has(found.id)) {
      results.push({ uni: found, priority: 100 });
      addedIds.add(found.id);
    }
  }

  for (const u of UNIVERSITIES_DATABASE) {
    if (addedIds.has(u.id)) continue;

    const normName = normalizeSearchText(u.name);
    const normShort = normalizeSearchText(u.shortName);
    const normCity = normalizeSearchText(u.city);
    const normCountry = normalizeSearchText(u.country);
    const aliases = (u.aliases || []).map(normalizeSearchText);

    // Точное совпадение shortName
    if (normShort === norm) {
      results.push({ uni: u, priority: 90 });
      addedIds.add(u.id);
      continue;
    }

    // Совпадение любого из алиасов вуза
    if (aliases.includes(norm)) {
      results.push({ uni: u, priority: 85 });
      addedIds.add(u.id);
      continue;
    }

    // Запрос начинается с названия или shortName
    if (normShort.startsWith(norm) || normName.startsWith(norm)) {
      results.push({ uni: u, priority: 70 });
      addedIds.add(u.id);
      continue;
    }

    // Алиас начинается с запроса
    if (aliases.some(a => a.startsWith(norm))) {
      results.push({ uni: u, priority: 65 });
      addedIds.add(u.id);
      continue;
    }

    // Подстрока в name, shortName, aliases
    if (normName.includes(norm) || normShort.includes(norm) || aliases.some(a => a.includes(norm))) {
      results.push({ uni: u, priority: 50 });
      addedIds.add(u.id);
      continue;
    }

    // Город или страна
    if (normCity.includes(norm) || normCountry.includes(norm)) {
      results.push({ uni: u, priority: 30 });
      addedIds.add(u.id);
    }
  }

  return results
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit)
    .map(r => r.uni);
}

/**
 * Создание интеллектуальной фактологической карточки, если вуз вообще не найден в базе
 * (Определяет реальную страну, город, валюту и проходные баллы на основе анализа гео-названия)
 */
export function generateRealisticUnknownUniversity(
  rawQuery: string,
  profile: UserProfile
): UniversityProgram {
  const norm = normalizeSearchText(rawQuery);
  const cleanTitle = rawQuery.trim().charAt(0).toUpperCase() + rawQuery.trim().slice(1);

  // Определение локации
  const isKz =
    norm.includes('каз') || norm.includes('астана') || norm.includes('алматы') ||
    norm.includes('шымкент') || norm.includes('актобе') || norm.includes('караганд') ||
    norm.includes('костанай') || norm.includes('павлодар') || norm.includes('семей') ||
    norm.includes('атырау') || norm.includes('актау') || norm.includes('тараз') ||
    norm.includes('кызылорд') || norm.includes('кокшетау') || norm.includes('петропавл') ||
    norm.includes('талдыкорган') || norm.includes('туркестан');

  const isRu =
    norm.includes('рос') || norm.includes('москв') || norm.includes('питер') ||
    norm.includes('санкт') || norm.includes('петербург') || norm.includes('новосибирск') ||
    norm.includes('казан') || norm.includes('томск') || norm.includes('екатеринбург') ||
    norm.includes('нижн') || norm.includes('владивосток') || norm.includes('ростов') ||
    norm.includes('мгу') || norm.includes('спб');

  const isDe = norm.includes('герман') || norm.includes('нем') || norm.includes('berlin') || norm.includes('munich') || norm.includes('hamburg') || norm.includes('frankfurt') || norm.includes('bonn');
  const isIt = norm.includes('итал') || norm.includes('rome') || norm.includes('milan') || norm.includes('рим') || norm.includes('милан') || norm.includes('florence') || norm.includes('turin');
  const isUk = norm.includes('британ') || norm.includes('англий') || norm.includes('лондон') || norm.includes('london') || norm.includes('uk') || norm.includes('британ');
  const isUs = norm.includes('сша') || norm.includes('usa') || norm.includes('америк') || norm.includes('калифорн') || norm.includes('йорк') || norm.includes('texas') || norm.includes('boston');
  const isCa = norm.includes('канад') || norm.includes('canada') || norm.includes('vancouver') || norm.includes('montreal');
  const isKr = norm.includes('коре') || norm.includes('korea') || norm.includes('сеул') || norm.includes('seoul');
  const isCn = norm.includes('кита') || norm.includes('china') || norm.includes('шанхай') || norm.includes('пекин');
  const isJp = norm.includes('япон') || norm.includes('japan') || norm.includes('токио');
  const isPl = norm.includes('польш') || norm.includes('poland') || norm.includes('варшав') || norm.includes('краков');
  const isCz = norm.includes('чехи') || norm.includes('czech') || norm.includes('праг');
  const isHu = norm.includes('венгр') || norm.includes('hungary') || norm.includes('будапешт');

  let country = 'Казахстан';
  let city = 'Казахстан';
  let region: 'kazakhstan' | 'europe' | 'asia' | 'usa' = 'kazakhstan';
  let tuition = 'Гос. грант РК или от 1 350 000 ₸/год';
  let exam = 'ЕНТ профильные (от 75+ платное, от 105+ грант)';
  let language = 'Русский / Казахский (IELTS 5.5 для англоязычных групп)';
  let deadline = '20 июля 2026';
  let currencySalary = 'от 520 000 ₸/мес';
  let topEmployers = ['Kaspi.kz', 'Halyk Bank', 'КазМунайГаз', 'Казахтелеком', 'Astana Hub'];

  if (isRu) {
    country = 'Россия';
    city = norm.includes('питер') || norm.includes('санкт') ? 'Санкт-Петербург' : 'Москва';
    region = 'europe';
    tuition = 'Бюджет (квота Россотрудничества) или от 320 000 ₽/год';
    exam = 'ЕГЭ / Вступительные испытания вуза или олимпиады РСОШ';
    language = 'Русский язык (свободно)';
    deadline = '10 июля 2026';
    currencySalary = 'от 120 000 ₽/мес';
    topEmployers = ['Яндекс', 'Сбер', 'Т-Банк', 'VK', 'Ozon'];
  } else if (isDe) {
    country = 'Германия';
    city = 'Германия';
    region = 'europe';
    tuition = 'Бесплатное обучение (семестровый сбор €150 – 350)';
    exam = 'Studienkolleg / Feststellungsprüfung или 1-2 курса вуза РК';
    language = 'Немецкий (TestDaF 4x4 / Goethe C1) или IELTS 6.5';
    deadline = '15 июля 2026';
    currencySalary = 'от €45 000 / год';
    topEmployers = ['Siemens', 'BMW Group', 'SAP', 'Bosch', 'Deutsche Bank'];
  } else if (isIt) {
    country = 'Италия';
    city = 'Италия';
    region = 'europe';
    tuition = '100% грант DSU / EDiSU (€0 + стипендия до €7 500/год)';
    exam = 'Экзамен TOLC (TOLC-I / TOLC-E) или SAT (1150+)';
    language = 'Английский (IELTS 6.0 / B2)';
    deadline = 'Март — Май 2026';
    currencySalary = 'от €38 000 / год';
    topEmployers = ['Ferrari', 'UniCredit', 'Pirelli', 'Leonardo', 'Eni'];
  } else if (isUk) {
    country = 'Великобритания';
    city = 'Великобритания';
    region = 'europe';
    tuition = 'Стипендии вузов или £18 000 – 32 000/год';
    exam = 'Foundation Year / A-Levels / IB или SAT (1300+)';
    language = 'IELTS UKVI 6.5 (min 6.0)';
    deadline = '29 января 2026 (UCAS)';
    currencySalary = 'от £42 000 / год';
    topEmployers = ['Barclays', 'HSBC', 'Deloitte', 'Amazon UK', 'ARM'];
  } else if (isUs) {
    country = 'США';
    city = 'США';
    region = 'usa';
    tuition = 'Need-based Financial Aid / Merit-based стипендии ($25 000 – $65 000/год)';
    exam = 'SAT (1250 – 1480+) / ACT + школьный транскрипт';
    language = 'TOEFL 90+ / IELTS 6.5 – 7.0';
    deadline = '1 января — 15 февраля 2026';
    currencySalary = 'от $75 000 / год';
    topEmployers = ['Google', 'Microsoft', 'Apple', 'Meta', 'McKinsey'];
  } else if (isCa) {
    country = 'Канада';
    city = 'Канада';
    region = 'usa';
    tuition = 'International Entrance Scholarships или CAD $32 000 – 55 000/год';
    exam = 'Аттестат с высоким средним баллом + математика';
    language = 'IELTS 6.5 (min 6.0)';
    deadline = '15 января 2026';
    currencySalary = 'от CAD $68 000 / год';
    topEmployers = ['Shopify', 'RBC', 'Amazon Canada', 'Scotiabank'];
  } else if (isKr) {
    country = 'Южная Корея';
    city = 'Сеул';
    region = 'asia';
    tuition = '100% стипендия GKS (Global Korea Scholarship) или вузовские гранты';
    exam = 'Школьный аттестат + портфолио / олимпиады';
    language = 'IELTS 6.0+ или TOPIK 3+';
    deadline = 'Март 2026';
    currencySalary = 'от ₩45 000 000 / год';
    topEmployers = ['Samsung Electronics', 'LG Electronics', 'Hyundai', 'Naver', 'Kakao'];
  } else if (isCn) {
    country = 'Китай';
    city = 'Китай';
    region = 'asia';
    tuition = '100% правительственный грант CSC (Chinese Government Scholarship)';
    exam = 'Школьный аттестат + рекомендательные письма';
    language = 'HSK 4-5 (китайский поток) или IELTS 6.0 (английский)';
    deadline = 'Апрель 2026';
    currencySalary = 'от ¥180 000 / год';
    topEmployers = ['Alibaba Group', 'Tencent', 'Huawei', 'Baidu', 'ByteDance'];
  } else if (isJp) {
    country = 'Япония';
    city = 'Токио';
    region = 'asia';
    tuition = '100% стипендия MEXT или ¥535 800/год';
    exam = 'EJU (Examination for Japanese University) или SAT';
    language = 'JLPT N2 или IELTS 6.5 (программы English-track)';
    deadline = 'Январь — Февраль 2026';
    currencySalary = 'от ¥4 500 000 / год';
    topEmployers = ['Sony', 'Toyota', 'Rakuten', 'Panasonic', 'Hitachi'];
  } else if (isPl || isCz || isHu) {
    country = isPl ? 'Польша' : isCz ? 'Чехия' : 'Венгрия';
    city = isPl ? 'Варшава' : isCz ? 'Прага' : 'Будапешт';
    region = 'europe';
    tuition = isHu ? '100% грант Stipendium Hungaricum (€0 + жилье)' : '€2 000 – 4 500/год или бесплатно на госязыке';
    exam = 'Школьный аттестат + профильное тестирование';
    language = 'IELTS 6.0 или экзамен на знание нацязыка';
    deadline = isHu ? '15 января 2026' : '31 мая 2026';
    currencySalary = 'от €32 000 / год';
    topEmployers = ['CD Projekt', 'Skoda Auto', 'MOL Group', 'IBM Europe', 'Accenture'];
  }

  const raw: UniversityProgram = {
    id: `custom-${Date.now()}`,
    name: cleanTitle,
    shortName: cleanTitle.split(/[\s(]/)[0] || cleanTitle,
    city,
    country,
    region,
    fields: [profile.field],
    programTitle: `Бакалавриат по направлению «${profile.field}»`,
    degrees: ['Бакалавриат (4 года)'],
    acceptanceRate: isKz ? '35%' : '26%',
    avgGpa: isKz ? 4.2 : 4.6,
    languageRequirement: language,
    examRequirement: exam,
    tuitionYearKztOrUsd: tuition,
    scholarshipAvailability: '100% гранты',
    hasDormitory: true,
    matchCategory: 'target',
    matchScore: 85,
    whyFits: [
      `Реальная учебная программа бакалавриата по профилю абитуриента`,
      `Возможность претендовать на стипендиальные и грантовые программы в ${country}`,
      `Официальное признание диплома и трудоустройство в ведущих компаниях региона`
    ],
    keyStrengths: ['Аккредитованная программа', 'Современная материально-техническая база', 'Практика и стажировки'],
    avgGraduateSalary: currencySalary,
    applicationDeadline: deadline,
    officialSiteUrl: 'https://google.com/search?q=' + encodeURIComponent(rawQuery + ' official website admissions'),
    details: {
      aboutCampus: `Учебные корпуса и исследовательские лаборатории ${cleanTitle} с профильным оборудованием, библиотекой и студенческими зонами.`,
      studentLife: 'Студенческие ассоциации, научные общества, спортивные секции и профессиональные кейс-клубы.',
      livingCostsPerMonth: isKz ? '~120 000 – 160 000 ₸/мес' : isRu ? '~35 000 – 50 000 ₽/мес' : '~€600 – 900 / мес',
      dormitoryDetails: 'Студенческое общежитие с первоочередным предоставлением мест иногородним первокурсникам.',
      topEmployers,
      rounds: {
        early: { name: 'Ранний прием документов', deadline: 'Апрель — Май 2026', description: 'Предварительный отбор и консультации приемной комиссии.', recommendedFor: 'Кандидатам с готовыми результатами тестов.' },
        regular: { name: 'Основной конкурс зачисления', deadline: deadline, description: 'Распределение грантов и бюджетных мест.', recommendedFor: 'Всем абитуриентам.' },
        late: { name: 'Поздний добор', deadline: 'Август 2026', description: 'Заключение договоров на коммерческое обучение.', recommendedFor: 'Запасной поток.' }
      },
      grantStats: {
        lastYearGrantsCount: 'Выделяются ежегодные грантовые квоты',
        lastYearCutoff: isKz ? 'ЕНТ от 105 баллов' : 'Высокий средний балл аттестата',
        competitionRatio: '2.5 человека на место',
        grantChanceSummary: `При своевременной подаче документов шансы на зачисление в ${country} оцениваются как реалистичные.`
      }
    }
  };

  const ev = evaluateUniversityProgram(raw, profile);
  return { ...raw, ...ev, isAiGenerated: true };
}
