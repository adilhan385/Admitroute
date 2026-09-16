import type { UniversityProgram } from '../types';

export const UNIVERSITIES_DATABASE: UniversityProgram[] = [
  // ==================== КАЗАХСТАН ====================
  {
    id: 'nu-cs',
    name: 'Назарбаев Университет (Nazarbayev University)',
    shortName: 'NU',
    city: 'Астана',
    country: 'Казахстан',
    region: 'kazakhstan',
    fields: ['cs_it', 'engineering'],
    programTitle: 'BSc in Computer Science & Software Engineering',
    degrees: ['Бакалавриат (4 года)'],
    acceptanceRate: '14%',
    avgGpa: 4.8,
    languageRequirement: 'IELTS 6.5 (min 6.0)',
    examRequirement: 'NUET / SAT Reasoning (1250+)',
    tuitionYearKztOrUsd: '100% государственный грант «Оркен»',
    scholarshipAvailability: '100% гранты',
    hasDormitory: true,
    matchCategory: 'reach',
    matchScore: 88,
    whyFits: [
      'Сильнейшая школа Computer Science в Центральной Азии с англоязычным обучением',
      'Полное государственное покрытие обучения, проживания и ежемесячная стипендия',
      'Прямые стажировки в международные технологические гиганты (Google, Meta, EPAM)'
    ],
    keyStrengths: ['Международная аккредитация', 'Профессора из топ-100 вузов мира', 'Кампус мирового уровня'],
    avgGraduateSalary: 'от 950 000 ₸/мес',
    applicationDeadline: '30 марта 2026',
    officialSiteUrl: 'https://nu.edu.kz',
    details: {
      aboutCampus: 'Ультрасовременный кампус площадью более 400 000 кв.м. в Астане с крытыми переходами между корпусами, исследовательскими лабораториями робототехники и суперкомпьютерным кластером.',
      studentLife: 'Более 120 студенческих клубов, ежегодные хакатоны HackNU, акселераторы NURIS и активные спортивные лиги.',
      livingCostsPerMonth: 'Бесплатно по гранту «Оркен» (включая стипендию ~50 000 ₸/мес)',
      dormitoryDetails: 'Гарантированное комфортабельное общежитие на территории кампуса (2-3 местные комнаты с санузлом).',
      topEmployers: ['Google', 'Meta', 'Amazon', 'EPAM Systems', 'Kaspi.kz', 'Kcell'],
      rounds: {
        early: {
          name: 'Ранняя подача (Early Application)',
          deadline: '29 ноября 2025 — 15 января 2026',
          description: 'Подача для олимпиадников и кандидатов с готовыми высокими баллами SAT/IELTS.',
          recommendedFor: 'Рекомендуется при SAT 1350+ или победах на республиканских олимпиадах.'
        },
        regular: {
          name: 'Основная подача (Regular Admission)',
          deadline: '16 января — 30 марта 2026',
          description: 'Основной поток через вступительное тестирование NUET или подтвержденный SAT.',
          recommendedFor: 'Стандартный поток для большинства выпускников 11 классов.'
        },
        late: {
          name: 'Платный добор (Late / Fee-paying)',
          deadline: '1 апреля — 30 мая 2026',
          description: 'Рассмотрение кандидатов на коммерческую основу при недоборе проходного балла на грант.',
          recommendedFor: 'Запасной вариант при наличии финансовой возможности оплачивать контракт.'
        }
      },
      grantStats: {
        lastYearGrantsCount: '800 целевых грантов «Оркен» на весь бакалавриат',
        lastYearCutoff: 'SAT 1280+ / NUET математика 120+ из 160 + IELTS 6.5',
        competitionRatio: '4.8 претендента на 1 грантовое место',
        grantChanceSummary: 'Высочайшая конкуренция среди сильнейших школьников страны. При GPA 4.8+ и IELTS 7.0 шансы выше средних.'
      }
    }
  },
  {
    id: 'kbtu-it',
    name: 'Казахстанско-Британский технический университет',
    shortName: 'КБТУ',
    city: 'Алматы',
    country: 'Казахстан',
    region: 'kazakhstan',
    fields: ['cs_it', 'engineering', 'business_econ'],
    programTitle: 'Информационные системы и Кибербезопасность',
    degrees: ['Бакалавриат (4 года)'],
    acceptanceRate: '28%',
    avgGpa: 4.5,
    languageRequirement: 'Внутренний тест / IELTS 5.5+',
    examRequirement: 'ЕНТ профильные: Мат + Инф (112+ баллов на грант)',
    tuitionYearKztOrUsd: 'Гос. грант РК или ~2 400 000 ₸/год',
    scholarshipAvailability: '100% гранты',
    hasDormitory: true,
    matchCategory: 'target',
    matchScore: 94,
    whyFits: [
      'Высочайший процент трудоустройства выпускников в IT и FinTech сектор Казахстана',
      'Возможность получения двойного диплома с University of London',
      'Большая квота государственных образовательных грантов'
    ],
    keyStrengths: ['Тесная связь с индустрией (Kaspi, Halyk, Tengizchevroil)', 'Лаборатории Bloomberg и Cisco', 'Исторический кампус в центре Алматы'],
    avgGraduateSalary: 'от 750 000 ₸/мес',
    applicationDeadline: '20 июля 2026',
    officialSiteUrl: 'https://kbtu.edu.kz',
    details: {
      aboutCampus: 'Историческое монументальное здание Дома Правительства на площади Астана в центре Алматы, оснащенное дата-центрами, хабами кибербезопасности и коворкингами.',
      studentLife: 'Культовый студенческий сенат, чемпионаты по спортивному программированию ICPC и киберспортивные лиги.',
      livingCostsPerMonth: '~150 000 – 200 000 ₸ (аренда/транспорт/питание в Алматы)',
      dormitoryDetails: 'Собственный Дом студентов в шаговой доступности для иногородних грантников.',
      topEmployers: ['Kaspi.kz', 'Halyk Bank', 'Kolesa Group', 'Tengizchevroil', 'Ernst & Young', 'Schlumberger'],
      rounds: {
        early: {
          name: 'Раннее бронирование и внутренние олимпиады',
          deadline: '1 марта — 15 мая 2026',
          description: 'Участие в олимпиаде КБТУ с возможностью выиграть ректорский грант или скидку до 100%.',
          recommendedFor: 'Школьникам с сильной математикой и информатикой.'
        },
        regular: {
          name: 'Основной конкурс госгрантов РК',
          deadline: '13 — 20 июля 2026',
          description: 'Подача документов на республиканский грант через портал eGov или приемную комиссию.',
          recommendedFor: 'Всем абитуриентам с баллами ЕНТ от 110+.'
        },
        late: {
          name: 'Зачисление на платное отделение',
          deadline: '1 — 25 августа 2026',
          description: 'Заключение договоров на платное обучение при прохождении порогового балла ЕНТ (75+).',
          recommendedFor: 'Тем, кому не хватило 2–3 баллов до государственного гранта.'
        }
      },
      grantStats: {
        lastYearGrantsCount: '3 450 грантов по группе B057 (Информационные технологии) по РК',
        lastYearCutoff: '113 баллов ЕНТ (общий конкурс) / 105 по сельской квоте',
        competitionRatio: '2.9 человека на 1 грант',
        grantChanceSummary: 'С баллом ЕНТ 114+ вероятность получения государственного гранта превышает 88%.'
      }
    }
  },
  {
    id: 'aitu-cs',
    name: 'Astana IT University',
    shortName: 'AITU',
    city: 'Астана',
    country: 'Казахстан',
    region: 'kazakhstan',
    fields: ['cs_it', 'design_media'],
    programTitle: 'Software Engineering & Artificial Intelligence',
    degrees: ['Бакалавриат (3 года — триместровая система)'],
    acceptanceRate: '32%',
    avgGpa: 4.3,
    languageRequirement: 'Английский B2 / IELTS 5.5',
    examRequirement: 'ЕНТ профильные: Мат + Инф (108+ баллов на грант)',
    tuitionYearKztOrUsd: 'Гос. грант РК или ~1 800 000 ₸/год',
    scholarshipAvailability: '100% гранты',
    hasDormitory: true,
    matchCategory: 'target',
    matchScore: 92,
    whyFits: [
      'Специализированный современный IT-хаб прямо на территории EXPO и по соседству с Astana Hub',
      '3-летняя интенсивная программа с упором на прикладную разработку и Data Science',
      'Быстрый старт в стартапах и IT-компаниях резидентах технопарка'
    ],
    keyStrengths: ['Инфраструктура на базе EXPO', 'Преподаватели-практики из IT-индустрии', 'Современные коворкинги'],
    avgGraduateSalary: 'от 650 000 ₸/мес',
    applicationDeadline: '25 июля 2026',
    officialSiteUrl: 'https://astanait.edu.kz',
    details: {
      aboutCampus: 'Футуристичные павильоны EXPO в Астане с инновационными лабораториями FabLab, зонами Apple Lab и открытыми амфитеатрами.',
      studentLife: 'Постоянные хакатоны Astana Hub, стартап-питчи, митапы от топ-спикеров Кремниевой долины.',
      livingCostsPerMonth: '~130 000 – 170 000 ₸ в Астане',
      dormitoryDetails: 'Новые общежития гостиничного типа на территории левобережья.',
      topEmployers: ['Astana Hub', 'BTS Digital', 'Freedom Finance', 'Казахтелеком', 'One Technologies'],
      rounds: {
        early: {
          name: 'Ранняя подача и AITU iCode Олимпиада',
          deadline: '15 апреля — 1 июня 2026',
          description: 'Проведение собственной IT-олимпиады с розыгрышем внутренних грантов ректора.',
          recommendedFor: 'Школьникам, увлеченным спортивным программированием.'
        },
        regular: {
          name: 'Республиканский грантовый конкурс',
          deadline: '13 — 20 июля 2026',
          description: 'Подача заявки на госгрант РК с указанием кода AITU в первой строке приоритета.',
          recommendedFor: 'Абитуриентам с баллами ЕНТ 108+.'
        },
        late: {
          name: 'Поздний поток и дозачисление',
          deadline: '5 — 20 августа 2026',
          description: 'Оформление на контрактную форму и перевод грантов из других вузов.',
          recommendedFor: 'Абитуриентам с хорошими баллами, решившим сменить локацию.'
        }
      },
      grantStats: {
        lastYearGrantsCount: 'Свыше 1 200 грантов зачислено в AITU по IT-направлениям',
        lastYearCutoff: '109 баллов ЕНТ (Software Engineering)',
        competitionRatio: '2.5 человека на 1 грант',
        grantChanceSummary: 'Один из самых популярных IT-вузов. При балле 112+ зачисление на грант практически гарантировано.'
      }
    }
  },
  {
    id: 'sdu-it',
    name: 'SDU University (Университет имени Сулеймана Демиреля)',
    shortName: 'SDU',
    city: 'Каскелен / Алматы',
    country: 'Казахстан',
    region: 'kazakhstan',
    fields: ['cs_it', 'social_law', 'business_econ'],
    programTitle: 'Information Systems & Computer Engineering',
    degrees: ['Бакалавриат (4 года)'],
    acceptanceRate: '38%',
    avgGpa: 4.3,
    languageRequirement: 'Английский язык (IELTS 5.5+ или внутренний SPT)',
    examRequirement: 'ЕНТ (Мат + Инф, 102+ баллов на грант)',
    tuitionYearKztOrUsd: 'Гос. грант РК или ~1 900 000 ₸/год',
    scholarshipAvailability: '100% гранты',
    hasDormitory: true,
    matchCategory: 'safety',
    matchScore: 90,
    whyFits: [
      'Зеленый автономный кампус американского типа у подножия гор',
      'Сильнейшая школа алгоритмического программирования и подготовки к олимпиадам',
      'Обучение полностью на английском языке с дружелюбной академической атмосферой'
    ],
    keyStrengths: ['Автономный кампус', 'Традиции ICPC', '100% английский язык'],
    avgGraduateSalary: 'от 650 000 ₸/мес',
    applicationDeadline: '25 июля 2026',
    officialSiteUrl: 'https://sdu.edu.kz',
    details: {
      aboutCampus: 'Огромный изолированный университетский городок в Каскелене с футбольными полями, кинозалами, библиотекой и студенческими центрами.',
      studentLife: 'Очень сплоченное сообщество, студенческие фестивали и ярмарки, сильные дебатные клубы.',
      livingCostsPerMonth: '~90 000 – 120 000 ₸ (все необходимое находится прямо на кампусе)',
      dormitoryDetails: 'Современные общежития блочного типа прямо на территории кампуса в 3 минутах от аудиторий.',
      topEmployers: ['EPAM', 'DAR Ecosystem', 'Kolesa Group', 'Halyk Bank'],
      rounds: {
        early: {
          name: 'Олимпиада SPT (SDU Proficiency Test)',
          deadline: 'Февраль — Апрель 2026',
          description: 'Масштабная олимпиада SDU по всему Казахстану со 100% грантами от университета.',
          recommendedFor: 'Всем ученикам 11 классов как отличная страховка до ЕНТ.'
        },
        regular: {
          name: 'Государственный грант РК',
          deadline: '13 — 20 июля 2026',
          description: 'Подача сертификата ЕНТ на республиканский конкурс.',
          recommendedFor: 'Баллы ЕНТ от 102+.'
        },
        late: {
          name: 'Платный контракт со скидками',
          deadline: '10 — 25 августа 2026',
          description: 'Предоставление внутренних скидок за высокий балл аттестата («Алтын Белгі»).',
          recommendedFor: 'Абитуриентам со средним баллом аттестата 4.8+.'
        }
      },
      grantStats: {
        lastYearGrantsCount: 'Около 950 государственных грантов + 200 грантов олимпиады SPT',
        lastYearCutoff: '104 балла ЕНТ по направлению Computer Science',
        competitionRatio: '2.3 человека на грант',
        grantChanceSummary: 'Отличный шанс на грант при средних и уверенных баллах ЕНТ (105+).'
      }
    }
  },

  // ==================== ВОСТОЧНАЯ И ЮГО-ВОСТОЧНАЯ АЗИЯ ====================
  {
    id: 'kaist-kr',
    name: 'KAIST (Korea Advanced Institute of Science and Technology)',
    shortName: 'KAIST',
    city: 'Тэджон',
    country: 'Южная Корея',
    region: 'asia',
    fields: ['cs_it', 'engineering'],
    programTitle: 'B.S. in Computer Science & Artificial Intelligence',
    degrees: ['Бакалавриат (4 года)'],
    acceptanceRate: '16%',
    avgGpa: 4.85,
    languageRequirement: 'IELTS 6.5+ / TOEFL 83',
    examRequirement: 'Академические рекомендации + SAT / олимпиадные дипломы',
    tuitionYearKztOrUsd: '100% KAIST Scholarship (учеба + ~$350/мес)',
    scholarshipAvailability: '100% гранты',
    hasDormitory: true,
    matchCategory: 'reach',
    matchScore: 91,
    whyFits: [
      'Все принятые иностранные студенты получают полное финансирование (обучение + ежемесячная стипендия)',
      '100% лекций на английском языке в ведущем научно-технологическом институте Азии',
      'Прямой мост в Samsung Electronics, LG, Hyundai и кремниевую долину Кореи'
    ],
    keyStrengths: ['Полный грант для всех принятых иностранцев', 'Азиатский MIT', 'Суперкомпьютерные центры'],
    avgGraduateSalary: '$50 000 / год',
    applicationDeadline: '24 мая 2026',
    officialSiteUrl: 'https://kaist.ac.kr',
    details: {
      aboutCampus: 'Наукоград Daedeok Innopolis в Тэджоне. Огромный кампус с исследовательскими институтами, парками, робототехническими центрами и дата-центрами.',
      studentLife: 'Интернациональное сообщество ученых, ежегодный фестиваль KAIST-POSTECH, хакатоны и стартап-инкубаторы.',
      livingCostsPerMonth: 'Полностью покрывается стипендией KAIST (выплачивается ~350 000 корейских вон/мес)',
      dormitoryDetails: 'Предоставляется всем иностранным студентам за минимальную плату (~$100/мес).',
      topEmployers: ['Samsung Electronics', 'SK Hynix', 'Naver', 'Kakao', 'LG Electronics', 'Hyundai'],
      rounds: {
        early: {
          name: 'Раннее окно (Early Track)',
          deadline: '1 сентября — 24 октября 2025',
          description: 'Подача для кандидатов с готовым пакетом рекомендаций и стандартизированных тестов.',
          recommendedFor: 'Кандидатам с SAT 1400+ или международными олимпиадами.'
        },
        regular: {
          name: 'Основное окно (Regular Track)',
          deadline: '8 ноября 2025 — 12 января 2026',
          description: 'Главный поток международного набора на осенний семестр.',
          recommendedFor: 'Основной дедлайн для школьников выпускного класса.'
        },
        late: {
          name: 'Поздний весенний трек (Late Spring Track)',
          deadline: '24 мая — 30 июня 2026',
          description: 'Набор на весенний семестр следующего года.',
          recommendedFor: 'Абитуриентам, берущим gap year или готовящим документы позже.'
        }
      },
      grantStats: {
        lastYearGrantsCount: 'Около 300 полных грантов выделено иностранным студентам бакалавриата',
        lastYearCutoff: 'GPA 4.8+ / SAT 1420+ или призерство в республиканских олимпиадах',
        competitionRatio: '6.2 человека на 1 место',
        grantChanceSummary: 'Жесткий отбор по точным наукам. Важно показать сильные проекты и рекомендации учителей физики/математики.'
      }
    }
  },
  {
    id: 'hkust-hk',
    name: 'Hong Kong University of Science and Technology (HKUST)',
    shortName: 'HKUST',
    city: 'Гонконг',
    country: 'Гонконг (Китай)',
    region: 'asia',
    fields: ['cs_it', 'engineering', 'business_econ'],
    programTitle: 'B.Eng. in Computer Science & Data Analytics',
    degrees: ['Бакалавриат (4 года)'],
    acceptanceRate: '21%',
    avgGpa: 4.75,
    languageRequirement: 'IELTS 6.5 (min 6.0)',
    examRequirement: 'Аттестат с отличием + SAT (1350+) или международные олимпиады',
    tuitionYearKztOrUsd: 'University Scholarships покрывают до 100% обучения',
    scholarshipAvailability: '100% гранты',
    hasDormitory: true,
    matchCategory: 'reach',
    matchScore: 92,
    whyFits: [
      'Входит в топ-40 лучших университетов мира (QS World Rankings)',
      'Мировой финансовый и технологический хаб с преподаванием полностью на английском',
      'Щедрые академические стипендии для талантливых кандидатов из стран СНГ'
    ],
    keyStrengths: ['Топовые зарплаты выпускников в Азии', 'Англоязычная среда', 'Кампус на берегу океана'],
    avgGraduateSalary: '$55 000 / год',
    applicationDeadline: '31 марта 2026',
    officialSiteUrl: 'https://hkust.edu.hk',
    details: {
      aboutCampus: 'Один из самых красивых кампусов планеты в заливе Clear Water Bay. Панорамный вид на море, современные исследовательские лаборатории и спортивные комплексы.',
      studentLife: 'Англоязычная мультикультурная среда, серфинг, международные кейс-чемпионаты и карьерные ярмарки с инвестбанками.',
      livingCostsPerMonth: '~HK$ 5 000 – 7 000 в месяц (питание, транспорт)',
      dormitoryDetails: 'Кампусные общежития Hall of Residence с видом на океан гарантируются на первые 2 года.',
      topEmployers: ['Morgan Stanley', 'Goldman Sachs', 'Tencent', 'Alibaba', 'HSBC', 'Bloomberg'],
      rounds: {
        early: {
          name: 'Ранний раунд (Early Round)',
          deadline: '20 сентября — 20 ноября 2025',
          description: 'Максимальный шанс на получение полной стипендии University Scholarship.',
          recommendedFor: 'Кандидатам с готовым IELTS 7.0+ и SAT 1380+.'
        },
        regular: {
          name: 'Основной раунд (Main Round)',
          deadline: '21 ноября 2025 — 8 января 2026',
          description: 'Основной конкурс для международных студентов.',
          recommendedFor: 'Всем абитуриентам со средним баллом 4.7+.'
        },
        late: {
          name: 'Поздний раунд (Late Application)',
          deadline: '9 января — 31 марта 2026',
          description: 'Рассмотрение оставшихся мест при наличии свободных квот.',
          recommendedFor: 'Подача при задержке сдачи языковых сертификатов.'
        }
      },
      grantStats: {
        lastYearGrantsCount: 'Свыше 450 полных и частичных стипендий выдано иностранным первокурсникам',
        lastYearCutoff: 'GPA 4.8 / SAT 1380+ (для 100% стипендии: SAT 1460+)',
        competitionRatio: '5.1 человека на место со стипендией',
        grantChanceSummary: 'Гонконг активно привлекает таланты из Центральной Азии. При наличии хорошего эссе шансы высоки.'
      }
    }
  },
  {
    id: 'zju-cn',
    name: 'Zhejiang University (Чжэцзянский университет)',
    shortName: 'ZJU',
    city: 'Ханчжоу',
    country: 'Китай',
    region: 'asia',
    fields: ['cs_it', 'engineering', 'medicine_bio'],
    programTitle: 'Information Engineering & Computer Science (English Taught)',
    degrees: ['Бакалавриат (4 года)'],
    acceptanceRate: '26%',
    avgGpa: 4.5,
    languageRequirement: 'IELTS 6.0 / TOEFL 80',
    examRequirement: 'Аттестат с высоким средним баллом + портфолио',
    tuitionYearKztOrUsd: 'Правительственный грант Китая (CSC): 100% учеба + жилье + стипендия',
    scholarshipAvailability: '100% гранты',
    hasDormitory: true,
    matchCategory: 'target',
    matchScore: 93,
    whyFits: [
      'Один из легендарной лиги C9 (китайская лига Плюща) в родном городе штаб-квартиры Alibaba',
      'Высокая квота полных правительственных стипендий CSC для абитуриентов из Казахстана и стран Шелкового пути',
      'Англоязычная программа бакалавриата по передовым IT-направлениям'
    ],
    keyStrengths: ['Грант CSC покрывает все расходы', 'Лига C9 Китая', 'Тесное сотрудничество с Alibaba & NetEase'],
    avgGraduateSalary: '$38 000 / год',
    applicationDeadline: '30 апреля 2026',
    officialSiteUrl: 'https://www.zju.edu.cn',
    details: {
      aboutCampus: 'Огромный кампус Zijingang в Ханчжоу, соединенный скоростными поездами с Шанхаем. Центр робототехники и искусственного интеллекта Китая.',
      studentLife: 'Яркая международная жизнь, погружение в язык и культуру, клубы робототехники и стажировки в технологических гигантах.',
      livingCostsPerMonth: 'Полностью компенсируется стипендией CSC (2 500 RMB/мес чистыми)',
      dormitoryDetails: 'Иностранные студенты живут в отдельных комфортабельных резиденциях (1-2 местные номера).',
      topEmployers: ['Alibaba Group', 'NetEase', 'Huawei', 'ByteDance (TikTok)', 'Tencent'],
      rounds: {
        early: {
          name: 'Подача на стипендию правительства Китая (CSC Type A/B)',
          deadline: '15 декабря 2025 — 28 февраля 2026',
          description: 'Подача на грант Type A через Посольство Китая либо Type B напрямую через университет.',
          recommendedFor: 'Кандидатам, нацеленным на 100% бесплатное обучение со стипендией.'
        },
        regular: {
          name: 'Университетский грант провинции Чжэцзян',
          deadline: '1 марта — 30 апреля 2026',
          description: 'Прямой конкурс стипендий университета.',
          recommendedFor: 'Абитуриентам со средним баллом аттестата от 4.5+.'
        },
        late: {
          name: 'Поздний прием на англоязычные программы',
          deadline: '1 мая — 15 июня 2026',
          description: 'Рассмотрение заявок на самоокупаемой основе или со скидкой 50%.',
          recommendedFor: 'Запасной поток для кандидатов.'
        }
      },
      grantStats: {
        lastYearGrantsCount: 'Свыше 350 полных грантов CSC выделено для иностранных студентов',
        lastYearCutoff: 'GPA 4.4+ / IELTS 6.0 / сильное мотивационное письмо',
        competitionRatio: '2.8 человека на стипендию',
        grantChanceSummary: 'Отличные шансы благодаря квотам инициативы «Один пояс — один путь» для граждан Казахстана.'
      }
    }
  },
  {
    id: 'apu-my',
    name: 'Asia Pacific University of Technology & Innovation (APU)',
    shortName: 'APU Malaysia',
    city: 'Куала-Лумпур',
    country: 'Малайзия',
    region: 'asia',
    fields: ['cs_it', 'design_media', 'business_econ'],
    programTitle: 'BSc (Hons) in Software Engineering & Cyber Security',
    degrees: ['Бакалавриат (3 года)'],
    acceptanceRate: '65%',
    avgGpa: 4.1,
    languageRequirement: 'IELTS 5.5 / B2 (или внутренний языковой курс)',
    examRequirement: 'Аттестат о среднем образовании (профильные точные предметы)',
    tuitionYearKztOrUsd: '~1 700 000 ₸ ($3 500) в год + скидки до 50% за GPA',
    scholarshipAvailability: 'Частичные стипендии',
    hasDormitory: true,
    matchCategory: 'safety',
    matchScore: 91,
    whyFits: [
      '100% англоязычное обучение по британским стандартам (двойной диплом с De Montfort University, UK)',
      'Идеальный надежный (Safety) вариант: высокий процент зачисления без сложной олимпиадной бюрократии',
      'Очень комфортная и безопасная англоязычная страна с низкой стоимостью проживания'
    ],
    keyStrengths: ['Двойной британский диплом', '100% преподавание на английском', '100% показатель трудоустройства'],
    avgGraduateSalary: '$26 000 / год',
    applicationDeadline: '30 июня 2026',
    officialSiteUrl: 'https://www.apu.edu.my',
    details: {
      aboutCampus: 'Инновационный хай-тек кампус в технопарке Technology Park Malaysia в Куала-Лумпуре. Лаборатории кибербезопасности CyberSecurity Centre, студии геймдева и VR.',
      studentLife: 'Студенты из более чем 130 стран, тропический климат, путешествия по Юго-Восточной Азии.',
      livingCostsPerMonth: '~$300 – 450 в месяц (очень доступная жизнь в Куала-Лумпуре)',
      dormitoryDetails: 'Современные апартаменты On-Campus и Off-Campus с бассейнами и спортзалами.',
      topEmployers: ['Standard Chartered', 'AirAsia', 'Grab', 'Cognizant', 'Accenture'],
      rounds: {
        early: {
          name: 'Ранняя подача (Early Bird Discount)',
          deadline: '1 января — 31 марта 2026',
          description: 'Скидка на регистрацию и гарантированная академическая стипендия по GPA.',
          recommendedFor: 'Всем абитуриентам для максимальной экономии бюджета.'
        },
        regular: {
          name: 'Основной набор (Summer Intake)',
          deadline: '1 апреля — 30 июня 2026',
          description: 'Стандартное оформление визы и подача документов.',
          recommendedFor: 'Основной поток выпускников школ.'
        },
        late: {
          name: 'Осенний набор (Fall Intake)',
          deadline: '1 июля — 30 августа 2026',
          description: 'Быстрое зачисление на ноябрьский поток.',
          recommendedFor: 'Тем, кто поздно получил результаты ЕНТ/аттестата.'
        }
      },
      grantStats: {
        lastYearGrantsCount: 'Скидки от 15% до 50% получили более 80% поступивших с GPA 4.3+',
        lastYearCutoff: 'GPA 3.8+ / IELTS 5.5',
        competitionRatio: 'Прямое зачисление без жесткого лимита мест',
        grantChanceSummary: 'Максимально надежный и предсказуемый вариант с гарантированной академической скидкой.'
      }
    }
  },

  // ==================== ЕВРОПА ====================
  {
    id: 'tum-de',
    name: 'Technical University of Munich (TUM)',
    shortName: 'TUM',
    city: 'Мюнхен',
    country: 'Германия',
    region: 'europe',
    fields: ['cs_it', 'engineering'],
    programTitle: 'B.Sc. in Informatics & Computational Science',
    degrees: ['Бакалавриат (3 года)'],
    acceptanceRate: '19%',
    avgGpa: 4.85,
    languageRequirement: 'IELTS 6.5+ / TestDaF',
    examRequirement: 'Аттестат с отличием + Studienkolleg / 1 год вуза',
    tuitionYearKztOrUsd: '~€2 000 – €3 000 в семестр (для non-EU)',
    scholarshipAvailability: 'Частичные стипендии',
    hasDormitory: true,
    matchCategory: 'reach',
    matchScore: 84,
    whyFits: [
      'Входит в топ-30 лучших университетов планеты по направлению Computer Science',
      'Европейский центр инноваций и штаб-квартиры BMW, Siemens, Google Munich',
      'Выпускники получают право на 18-месячную рабочую визу в ЕС'
    ],
    keyStrengths: ['Мировой авторитет диплома', 'Передовые R&D лаборатории', 'Карьера в Европе'],
    avgGraduateSalary: '€55 000 / год',
    applicationDeadline: '15 июля 2026',
    officialSiteUrl: 'https://www.tum.de',
    details: {
      aboutCampus: 'Кампус в Гархинге — крупнейший научный центр Германии с собственным ядерным исследовательским реактором, аэрокосмическими центрами и институтами Макса Планка.',
      studentLife: 'Немецкая студенческая культура, фестивали, поездки в Альпы и инженерные команды Formula Student.',
      livingCostsPerMonth: '~€900 – 1 200 (жилье и питание в Мюнхене)',
      dormitoryDetails: 'Студенческие общежития Studentenwerk (длинная очередь, рекомендуется подавать заявку заранее).',
      topEmployers: ['BMW Group', 'Siemens', 'Google Munich', 'Microsoft', 'Airbus', 'Allianz'],
      rounds: {
        early: {
          name: 'Подача через Uni-Assist (VPD)',
          deadline: '1 марта — 15 мая 2026',
          description: 'Предварительная проверка школьного аттестата через немецкую службу Uni-Assist.',
          recommendedFor: 'Обязательный шаг для признания документов из Казахстана.'
        },
        regular: {
          name: 'Основной портал TUMonline',
          deadline: '15 мая — 15 июля 2026',
          description: 'Финальная подача заявки в университет.',
          recommendedFor: 'Всем абитуриентам бакалавриата.'
        },
        late: {
          name: 'Позднее дозачисление',
          deadline: '16 июля — 15 августа 2026',
          description: 'Регистрация и подтверждение учебного места.',
          recommendedFor: 'Кандидатам из списка ожидания.'
        }
      },
      grantStats: {
        lastYearGrantsCount: 'Стипендии Deutschlandstipendium (~€300/мес) для 15% лучших студентов',
        lastYearCutoff: 'GPA 4.9+ / немецкая оценка 1.2–1.5',
        competitionRatio: '5.2 человека на место',
        grantChanceSummary: 'Жесткий академический отбор. Решающее значение имеет средний балл аттестата.'
      }
    }
  },
  {
    id: 'polimi-it',
    name: 'Politecnico di Milano',
    shortName: 'PoliMi',
    city: 'Милан',
    country: 'Италия',
    region: 'europe',
    fields: ['engineering', 'design_media', 'cs_it'],
    programTitle: 'B.Sc. in Mechanical & Design Engineering',
    degrees: ['Бакалавриат (3 года)'],
    acceptanceRate: '25%',
    avgGpa: 4.6,
    languageRequirement: 'IELTS 6.0 / B2',
    examRequirement: 'Вступительный экзамен TOL / SAT (1180+)',
    tuitionYearKztOrUsd: 'По стипендии DSU: €0 + выплата до €7 000/год',
    scholarshipAvailability: '100% гранты',
    hasDormitory: true,
    matchCategory: 'target',
    matchScore: 92,
    whyFits: [
      'Региональная стипендия DSU покрывает 100% стоимости учебы и выплачивает пособие на жизнь',
      '№1 технический университет Италии и мировая столица промышленного дизайна',
      'Англоязычные программы бакалавриата'
    ],
    keyStrengths: ['Стипендия DSU по доходу семьи', 'Престиж диплома в Европе', 'Кампусы в Милане'],
    avgGraduateSalary: '€42 000 / год',
    applicationDeadline: '15 мая 2026',
    officialSiteUrl: 'https://polimi.it',
    details: {
      aboutCampus: 'Кампусы Leonardo и Bovisa в Милане — эпицентр европейского дизайна и инженерии с аэродинамическими трубами и дизайн-студиями.',
      studentLife: 'Жизнь в мировой столице моды и дизайна, путешествия по всей Европе по студенческой визе.',
      livingCostsPerMonth: 'Полностью компенсируется стипендией DSU (до €7 000 в год)',
      dormitoryDetails: 'Студенческие резиденции PoliMi Residenze с приоритетом для стипендиатов DSU.',
      topEmployers: ['Ferrari', 'Pirelli', 'STMicroelectronics', 'Gucci', 'Luxottica'],
      rounds: {
        early: {
          name: '1-я волна ранней подачи (Early Wave)',
          deadline: '10 января — 28 февраля 2026',
          description: 'Подача с результатами теста TOL или SAT для гарантированного места.',
          recommendedFor: 'Кандидатам с готовым SAT 1200+.'
        },
        regular: {
          name: '2-я волна (Regular Wave)',
          deadline: '1 марта — 15 мая 2026',
          description: 'Основной поток с одновременным сбором справок на стипендию DSU.',
          recommendedFor: 'Большинству абитуриентов.'
        },
        late: {
          name: 'Добор на оставшиеся места',
          deadline: '16 мая — 10 июля 2026',
          description: 'Финальный раунд для открытых программ.',
          recommendedFor: 'Запасной трек.'
        }
      },
      grantStats: {
        lastYearGrantsCount: 'Стипендию DSU получили 100% подходящих по финансовому критерию студентов из Казахстана',
        lastYearCutoff: 'Показатель ISEE Parificato < €24 000/год + сдача вступительного экзамена TOL',
        competitionRatio: 'По стипендии конкурс социальный, по зачислению — 3.1 чел/место',
        grantChanceSummary: 'Один из самых доступных способов учиться в Западной Европе бесплатно со стипендией.'
      }
    }
  },

  // ==================== США ====================
  {
    id: 'purdue-us',
    name: 'Purdue University',
    shortName: 'Purdue',
    city: 'Уэст-Лафайетт',
    country: 'США',
    region: 'usa',
    fields: ['cs_it', 'engineering'],
    programTitle: 'B.S. in Computer Science',
    degrees: ['Бакалавриат (4 года)'],
    acceptanceRate: '35%',
    avgGpa: 4.8,
    languageRequirement: 'IELTS 7.0 / TOEFL 90+',
    examRequirement: 'SAT Reasoning (1380+) + эссе Common App',
    tuitionYearKztOrUsd: '~$31 000/год (доступны академические гранты)',
    scholarshipAvailability: 'Частичные стипендии',
    hasDormitory: true,
    matchCategory: 'reach',
    matchScore: 86,
    whyFits: [
      'Входит в топ-15 инженерных и IT-школ США ("Колыбель астронавтов")',
      'Огромная карьерная ярмарка с рекрутерами из Apple, Microsoft, Amazon',
      'Сильнейшие научные лаборатории кибербезопасности'
    ],
    keyStrengths: ['Топ инженерная школа США', 'Высокий ROI выпускников', 'Огромная сеть выпускников'],
    avgGraduateSalary: '$85 000 / год',
    applicationDeadline: '15 января 2026',
    officialSiteUrl: 'https://www.purdue.edu',
    details: {
      aboutCampus: 'Классический огромный американский кампус в Индиане с собственным аэропортом, исследовательскими парками и стадионами Big Ten.',
      studentLife: 'Американский студенческий дух, братства, инженерные соревнования и нетворкинг с топовыми инженерами США.',
      livingCostsPerMonth: '~$1 000 – 1 400 (общежитие и план питания Meal Plan)',
      dormitoryDetails: 'Обязательное проживание в студенческих резиденциях кампуса на 1-м курсе.',
      topEmployers: ['Apple', 'Microsoft', 'Amazon', 'Boeing', 'Lockheed Martin', 'Intel'],
      rounds: {
        early: {
          name: 'Early Action (Раннее действие)',
          deadline: '1 ноября 2025',
          description: 'Главный дедлайн для рассмотрения на университетские стипендии и топовые программы CS.',
          recommendedFor: 'Критически рекомендуется подавать именно в Early Action.'
        },
        regular: {
          name: 'Regular Decision (Обычная подача)',
          deadline: '15 января 2026',
          description: 'Основной поток через платформу Common Application.',
          recommendedFor: 'Кандидатам, улучшающим оценки в первом полугодии 11 класса.'
        },
        late: {
          name: 'Rolling / Space Available',
          deadline: '1 февраля — 1 мая 2026',
          description: 'Прием документов при наличии свободных мест.',
          recommendedFor: 'Поздний запасной трек.'
        }
      },
      grantStats: {
        lastYearGrantsCount: 'Стипендии Presidential и Trustees Scholarships получили около 15% иностранных абитуриентов',
        lastYearCutoff: 'SAT 1440+ / GPA 4.9+ / сильное эссе Common App',
        competitionRatio: '4.2 человека на место',
        grantChanceSummary: 'CS программа Purdue очень конкурентна. Необходима ранняя подача до 1 ноября.'
      }
    }
  },
  {
    id: 'asu-us',
    name: 'Arizona State University (ASU)',
    shortName: 'ASU',
    city: 'Финикс',
    country: 'США',
    region: 'usa',
    fields: ['cs_it', 'business_econ', 'design_media'],
    programTitle: 'B.S. in Software Engineering',
    degrees: ['Бакалавриат (4 года)'],
    acceptanceRate: '88%',
    avgGpa: 4.2,
    languageRequirement: 'IELTS 6.0 / TOEFL 80 / Duolingo 105',
    examRequirement: 'Аттестат + SAT (по желанию для стипендий)',
    tuitionYearKztOrUsd: 'Стипендия New American University покрывает до $15 000 в год',
    scholarshipAvailability: 'Частичные стипендии',
    hasDormitory: true,
    matchCategory: 'safety',
    matchScore: 92,
    whyFits: [
      '№1 по инновациям в США 9 лет подряд (опережая Stanford и MIT по оценке US News)',
      'Очень лояльные условия приема (Safety) и автоматические стипендии за хороший GPA',
      'Возможность получения 3-летней рабочей визы STEM OPT после выпуска'
    ],
    keyStrengths: ['№1 по инновациям в США', 'Автоматические стипендии по GPA', 'STEM виза 3 года'],
    avgGraduateSalary: '$72 000 / год',
    applicationDeadline: '1 мая 2026',
    officialSiteUrl: 'https://www.asu.edu',
    details: {
      aboutCampus: 'Один из крупнейших и самых технологичных университетов США с кампусами в Финиксе и Темпе, круглогодичным солнцем и современными хабами.',
      studentLife: 'Грандиозная студенческая жизнь, спорт NCAA Division I, сотни клубов и стартап-акселераторов.',
      livingCostsPerMonth: '~$1 100 – 1 500 (кампусное жилье + питание)',
      dormitoryDetails: 'Современные резиденции со всеми удобствами и бассейнами на территории.',
      topEmployers: ['Amazon', 'Intel', 'Honeywell', 'Deloitte', 'Boeing', 'PayPal'],
      rounds: {
        early: {
          name: 'Priority Admission',
          deadline: '1 ноября 2025',
          description: 'Приоритетное рассмотрение на максимальные стипендии до $15 000 в год.',
          recommendedFor: 'Кандидатам с GPA 4.5+.'
        },
        regular: {
          name: 'Regular Rolling Admission',
          deadline: '1 февраля 2026',
          description: 'Стандартный поток с быстрым решением за 2–3 недели.',
          recommendedFor: 'Всем абитуриентам.'
        },
        late: {
          name: 'Late Rolling Intake',
          deadline: '1 мая 2026',
          description: 'Поздний добор на осенний семестр.',
          recommendedFor: 'Быстрое гарантированное зачисление (Safety).'
        }
      },
      grantStats: {
        lastYearGrantsCount: 'Автоматические стипендии получили свыше 60% иностранных студентов',
        lastYearCutoff: 'GPA 4.0+ / IELTS 6.0 (без необходимости сдачи SAT)',
        competitionRatio: 'Гарантированное зачисление при соблюдении критериев',
        grantChanceSummary: 'Прекрасный страховочный вариант для США с предсказуемым результатом.'
      }
    }
  }
];
