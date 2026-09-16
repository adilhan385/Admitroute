import type { UniversityProgram } from '../types';

export const UNIVERSITIES_DATABASE: UniversityProgram[] = [
  // ==========================================================================
  // ============================= КАЗАХСТАН ==================================
  // ==========================================================================
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
          name: 'Раннее бронирование и олимпиады КБТУ',
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
  {
    id: 'kaznu-sci',
    name: 'КазНУ имени аль-Фараби',
    shortName: 'КазНУ',
    city: 'Алматы',
    country: 'Казахстан',
    region: 'kazakhstan',
    fields: ['cs_it', 'engineering', 'medicine_bio', 'social_law', 'business_econ'],
    programTitle: 'Информатика и Интеллектуальные системы управления',
    degrees: ['Бакалавриат (4 года)'],
    acceptanceRate: '35%',
    avgGpa: 4.4,
    languageRequirement: 'Казахский / Русский / Английский',
    examRequirement: 'ЕНТ (Мат + Физика или Мат + Инф, 106+ на грант)',
    tuitionYearKztOrUsd: 'Гос. грант РК или ~1 600 000 ₸/год',
    scholarshipAvailability: '100% гранты',
    hasDormitory: true,
    matchCategory: 'target',
    matchScore: 91,
    whyFits: [
      'Крупнейший классический национальный университет страны с богатейшей научной базой',
      'Большой зеленый студенческий городок («Казгуград») в предгорьях Алматы',
      'Высокие квоты государственных грантов по естественно-научным и IT направлениям'
    ],
    keyStrengths: ['Топ-200 QS World University Rankings', 'Огромный городок Казгуград', 'Широкий выбор специальностей'],
    avgGraduateSalary: 'от 550 000 ₸/мес',
    applicationDeadline: '20 июля 2026',
    officialSiteUrl: 'https://kaznu.kz',
    details: {
      aboutCampus: 'Автономный студенческий городок площадью 100 гектаров с Дворцом студентов им. Жолдасбекова, плавательным бассейном, научными институтами и кинотеатрами.',
      studentLife: 'Студенческие маслихаты, научные конференции, спортивные секции и творческие клубы.',
      livingCostsPerMonth: '~120 000 – 160 000 ₸/мес',
      dormitoryDetails: '14 студенческих общежитий на территории Казгуграда с доступной стоимостью проживания.',
      topEmployers: ['Казатомпром', 'Институты Академии Наук РК', 'Halyk Bank', 'Kaspi.kz', 'Госсектор'],
      rounds: {
        early: {
          name: 'Дни открытых дверей и профильные олимпиады',
          deadline: 'Март — Май 2026',
          description: 'Проведение предметных конкурсов КазНУ.',
          recommendedFor: 'Выпускникам с сильными фундаментальными знаниями.'
        },
        regular: {
          name: 'Республиканский конкурс грантов',
          deadline: '13 — 20 июля 2026',
          description: 'Подача заявления на государственный грант РК.',
          recommendedFor: 'Абитуриентам с баллами ЕНТ 106+.'
        },
        late: {
          name: 'Платный набор и колледж-перевод',
          deadline: '1 — 25 августа 2026',
          description: 'Зачисление на договорной основе.',
          recommendedFor: 'Пороговый балл ЕНТ от 75 баллов.'
        }
      },
      grantStats: {
        lastYearGrantsCount: 'Свыше 4 000 государственных грантов по всем факультетам',
        lastYearCutoff: '107 баллов ЕНТ по IT и 95 баллов по инженерным наукам',
        competitionRatio: '2.7 человека на 1 грант',
        grantChanceSummary: 'Надежный вариант для получения госгранта при хороших баллах ЕНТ.'
      }
    }
  },
  {
    id: 'iitu-cs',
    name: 'Международный университет информационных технологий (МУИТ)',
    shortName: 'МУИТ (IITU)',
    city: 'Алматы',
    country: 'Казахстан',
    region: 'kazakhstan',
    fields: ['cs_it', 'design_media', 'business_econ'],
    programTitle: 'Вычислительная техника и программное обеспечение (ВТПО)',
    degrees: ['Бакалавриат (4 года)'],
    acceptanceRate: '36%',
    avgGpa: 4.3,
    languageRequirement: 'Английский B1 / IELTS 5.0+',
    examRequirement: 'ЕНТ профильные: Мат + Инф (105+ баллов на грант)',
    tuitionYearKztOrUsd: 'Гос. грант РК или ~1 850 000 ₸/год',
    scholarshipAvailability: '100% гранты',
    hasDormitory: true,
    matchCategory: 'safety',
    matchScore: 90,
    whyFits: [
      'Профильный IT-университет в центре Алматы с аккредитацией ASIIN (Германия)',
      'Активное олимпиадное сообщество и тесные связи с IT-работодателями',
      'Ориентация на мобильную разработку, безопасность и Data Science'
    ],
    keyStrengths: ['Немецкая аккредитация ASIIN', 'Фокус исключительно на IT', 'Центр Алматы'],
    avgGraduateSalary: 'от 650 000 ₸/мес',
    applicationDeadline: '25 июля 2026',
    officialSiteUrl: 'https://iitu.edu.kz',
    details: {
      aboutCampus: 'Современный городской корпус в центре Алматы на пересечении улиц Манаса и Джандосова.',
      studentLife: 'Хакатоны каждые выходные, GameDev клубы, киберспортивные турниры и активный дебатный клуб.',
      livingCostsPerMonth: '~140 000 – 180 000 ₸/мес',
      dormitoryDetails: 'Собственное общежитие для студентов 1 курса рядом с учебным корпусом.',
      topEmployers: ['Kaspi.kz', 'Kolesa Group', 'Beeline Казахстан', 'Epam Systems', 'Chocofamily'],
      rounds: {
        early: {
          name: 'IITU Open Олимпиада',
          deadline: 'Март — Апрель 2026',
          description: 'Ежегодная олимпиада МУИТ по программированию со скидками до 100%.',
          recommendedFor: 'Юным программистам и олимпиадникам.'
        },
        regular: {
          name: 'Конкурс госгрантов МНВО РК',
          deadline: '13 — 20 июля 2026',
          description: 'Основная подача сертификата ЕНТ на государственный грант.',
          recommendedFor: 'Балл ЕНТ 105+.'
        },
        late: {
          name: 'Платное зачисление',
          deadline: '10 — 25 августа 2026',
          description: 'Договорное обучение с возможностью рассрочки.',
          recommendedFor: 'Абитуриентам, готовым к платной учебе с перспективой перехода на грант.'
        }
      },
      grantStats: {
        lastYearGrantsCount: 'Свыше 1 400 грантов зачислено на программы бакалавриата МУИТ',
        lastYearCutoff: '106 баллов ЕНТ по ВТПО',
        competitionRatio: '2.4 человека на 1 грант',
        grantChanceSummary: 'Отличный профильный вуз с высоким шансом на грант при средних баллах ЕНТ.'
      }
    }
  },
  {
    id: 'satbayev-eng',
    name: 'Satbayev University (КазНИТУ им. К.И. Сатпаева / Политех)',
    shortName: 'Политех (Satbayev)',
    city: 'Алматы',
    country: 'Казахстан',
    region: 'kazakhstan',
    fields: ['engineering', 'cs_it'],
    programTitle: 'Робототехника, мехатроника и промышленный AI',
    degrees: ['Бакалавриат (4 года)'],
    acceptanceRate: '45%',
    avgGpa: 4.1,
    languageRequirement: 'Русский / Казахский / Английский',
    examRequirement: 'ЕНТ (Мат + Физика или Мат + Инф, 95+ на грант)',
    tuitionYearKztOrUsd: 'Гос. грант РК или ~1 400 000 ₸/год',
    scholarshipAvailability: '100% гранты',
    hasDormitory: true,
    matchCategory: 'safety',
    matchScore: 92,
    whyFits: [
      'Старейший и крупнейший технический вуз Казахстана с огромным числом госгрантов',
      'Высокая доступность грантов даже при средних баллах ЕНТ (от 95–100 баллов)',
      'Сильные лаборатории FabLab, горного дела, нефти и возобновляемой энергетики'
    ],
    keyStrengths: ['Лидер по инженерным грантам в РК', 'Огромная база производственных практик', 'Доступные проходные баллы'],
    avgGraduateSalary: 'от 550 000 ₸/мес',
    applicationDeadline: '20 июля 2026',
    officialSiteUrl: 'https://satbayev.university',
    details: {
      aboutCampus: 'Огромный комплекс корпусов в золотом квадрате Алматы на улице Сатпаева со своими опытными цехами и лабораториями.',
      studentLife: 'Инженерные команды Formula Student, робототехнические фестивали и спортивные секции.',
      livingCostsPerMonth: '~130 000 – 170 000 ₸/мес',
      dormitoryDetails: '5 комфортабельных домов студентов с гарантированным заселением первокурсников.',
      topEmployers: ['Казахмыс', 'ERG (Евразийская Группа)', 'KEGOC', 'КазМунайГаз', 'Казатомпром'],
      rounds: {
        early: {
          name: 'Раннее тестирование и профориентация',
          deadline: 'Февраль — Май 2026',
          description: 'Профориентационные дни и пробные тестирования.',
          recommendedFor: 'Всем интересующимся инженерией.'
        },
        regular: {
          name: 'Государственный грантовый конкурс',
          deadline: '13 — 20 июля 2026',
          description: 'Подача ЕНТ с приоритетным выбором Satbayev University.',
          recommendedFor: 'Баллы ЕНТ от 95+.'
        },
        late: {
          name: 'Платный набор',
          deadline: '10 — 25 августа 2026',
          description: 'Заключение договоров на бюджетные и коммерческие места.',
          recommendedFor: 'Абитуриентам с базовым порогом ЕНТ (65+).'
        }
      },
      grantStats: {
        lastYearGrantsCount: 'Свыше 3 200 грантов выделено университету по инженерным направлениям',
        lastYearCutoff: '96 баллов ЕНТ по направлению «Робототехника» и 88 баллов по машиностроению',
        competitionRatio: '1.6 человека на 1 грант (очень высокая вероятность прохождения)',
        grantChanceSummary: 'Идеальный вариант Safety: высокий шанс учиться бесплатно на востребованной инженерной специальности.'
      }
    }
  },
  {
    id: 'kimep-bus',
    name: 'Университет КИМЭП (KIMEP University)',
    shortName: 'КИМЭП',
    city: 'Алматы',
    country: 'Казахстан',
    region: 'kazakhstan',
    fields: ['business_econ', 'social_law', 'design_media'],
    programTitle: 'BSc in Finance & International Business',
    degrees: ['Бакалавриат (4 года)'],
    acceptanceRate: '27%',
    avgGpa: 4.6,
    languageRequirement: 'IELTS 6.0+ / KIMEP English Test',
    examRequirement: 'ЕНТ (профильные) или высокий GPA + эссе',
    tuitionYearKztOrUsd: 'Ректорские гранты 100% или ~3 200 000 ₸/год',
    scholarshipAvailability: 'Частичные стипендии',
    hasDormitory: true,
    matchCategory: 'target',
    matchScore: 89,
    whyFits: [
      'Ведущая бизнес-школа Центральной Азии по североамериканскому стандарту',
      '100% обучение на английском языке с международной аккредитацией (FIBAA)',
      'Прямой наем в Big 4 (PwC, EY, KPMG, Deloitte) и инвестиционные банки'
    ],
    keyStrengths: ['Лидер бизнес-образования РК', 'Big 4 нанимает прямо из кампуса', 'Американская система кредитов'],
    avgGraduateSalary: 'от 700 000 ₸/мес',
    applicationDeadline: '30 июня 2026',
    officialSiteUrl: 'https://kimep.kz',
    details: {
      aboutCampus: 'Камерный уютный кампус в самом центре Алматы на проспекте Абая с современной библиотекой и коворкингами.',
      studentLife: 'Англоязычная студенческая ассоциация KSA, дебаты, кейс-клубы и международные стажировки.',
      livingCostsPerMonth: '~160 000 – 210 000 ₸/мес',
      dormitoryDetails: 'Комфортабельное общежитие на территории кампуса со строгим пропускным режимом.',
      topEmployers: ['PricewaterhouseCoopers (PwC)', 'Ernst & Young', 'Deloitte', 'KPMG', 'Procter & Gamble', 'Kaspi.kz'],
      rounds: {
        early: {
          name: 'Конкурс стипендий и грантов Президента КИМЭП',
          deadline: '15 января — 15 апреля 2026',
          description: 'Розыгрыш 100% и 50% стипендий за академические успехи и высокий балл олимпиады.',
          recommendedFor: 'Кандидатам с GPA 4.8+ и IELTS 6.5+.'
        },
        regular: {
          name: 'Основной прием документов',
          deadline: '1 мая — 10 июля 2026',
          description: 'Стандартная подача сертификатов и школьных аттестатов.',
          recommendedFor: 'Всем абитуриентам.'
        },
        late: {
          name: 'Финальный поток зачисления',
          deadline: '15 июля — 15 августа 2026',
          description: 'Заключение договоров при наличии свободных мест.',
          recommendedFor: 'Поздний запасной трек.'
        }
      },
      grantStats: {
        lastYearGrantsCount: 'Около 180 полных и частичных стипендий Президента КИМЭП',
        lastYearCutoff: 'GPA 4.7+ / IELTS 6.5 / сильный результат внутреннего тестирования',
        competitionRatio: '4.1 претендента на грант',
        grantChanceSummary: 'Бизнес-программы престижны. Для бесплатного обучения необходим высокий школьный аттестат и хороший английский.'
      }
    }
  },
  {
    id: 'mnu-law',
    name: 'Maqsut Narikbayev University (MNU / бывший КАЗГЮУ)',
    shortName: 'MNU (КАЗГЮУ)',
    city: 'Астана',
    country: 'Казахстан',
    region: 'kazakhstan',
    fields: ['social_law', 'business_econ', 'cs_it'],
    programTitle: 'Международное право и LegalTech',
    degrees: ['Бакалавриат (4 года)'],
    acceptanceRate: '31%',
    avgGpa: 4.4,
    languageRequirement: 'IELTS 5.5+ / Внутренний экзамен',
    examRequirement: 'ЕНТ (Всемирная история + Человек.Общество.Право, 108+ на грант)',
    tuitionYearKztOrUsd: 'Гос. грант РК или ~2 100 000 ₸/год',
    scholarshipAvailability: '100% гранты',
    hasDormitory: true,
    matchCategory: 'target',
    matchScore: 90,
    whyFits: [
      '№1 школа юриспруденции и международного права в Казахстане',
      'Европейская аккредитация FIBAA и тесное партнерство с МФЦА (AIFC)',
      'Современная программа LegalTech, соединяющая право и цифровые технологии'
    ],
    keyStrengths: ['№1 юридический вуз РК', 'Судебные залы для практики', 'Партнерство с судом МФЦА'],
    avgGraduateSalary: 'от 600 000 ₸/мес',
    applicationDeadline: '20 июля 2026',
    officialSiteUrl: 'https://mnu.kz',
    details: {
      aboutCampus: 'Красивейший корпус на набережной реки Есиль в Астане с модельными залами судебных заседаний и библиотекой.',
      studentLife: 'Модели ООН (Model UN), международные муткорты Jessup и Philip C. Jessup, дебатные лиги.',
      livingCostsPerMonth: '~130 000 – 170 000 ₸/мес',
      dormitoryDetails: 'Современный Дом студентов в 5 минутах ходьбы от главного корпуса.',
      topEmployers: ['Суд МФЦА', 'Министерство юстиции РК', 'Международные юридические компании (Dentons, GRATA)', 'КНБ', 'Генеральная Прокуратура'],
      rounds: {
        early: {
          name: 'Олимпиада MNU Legal Battle',
          deadline: 'Март — Апрель 2026',
          description: 'Конкурс эссе и кейс-чемпионат с предоставлением грантов ректора.',
          recommendedFor: 'Школьникам с выраженным интересом к праву и дипломатии.'
        },
        regular: {
          name: 'Республиканский грант РК',
          deadline: '13 — 20 июля 2026',
          description: 'Подача сертификата ЕНТ на республиканский конкурс.',
          recommendedFor: 'Баллы ЕНТ от 108+.'
        },
        late: {
          name: 'Платное отделение с гибкой оплатой',
          deadline: '1 — 25 августа 2026',
          description: 'Заключение договоров на коммерческой основе.',
          recommendedFor: 'Абитуриентам со средним баллом аттестата 4.4+.'
        }
      },
      grantStats: {
        lastYearGrantsCount: 'Свыше 450 грантов по группе «Право» и «Международные отношения»',
        lastYearCutoff: '110 баллов ЕНТ по общему конкурсу',
        competitionRatio: '3.6 человека на грант',
        grantChanceSummary: 'Высокая конкуренция среди будущих юристов, но отличная репутация диплома.'
      }
    }
  },
  {
    id: 'enu-tech',
    name: 'Евразийский национальный университет имени Л.Н. Гумилева',
    shortName: 'ЕНУ им. Гумилева',
    city: 'Астана',
    country: 'Казахстан',
    region: 'kazakhstan',
    fields: ['engineering', 'cs_it', 'social_law', 'business_econ'],
    programTitle: 'Информационная безопасность и Сетевые технологии',
    degrees: ['Бакалавриат (4 года)'],
    acceptanceRate: '37%',
    avgGpa: 4.3,
    languageRequirement: 'Казахский / Русский / Английский',
    examRequirement: 'ЕНТ (Мат + Инф / Физика, 104+ на грант)',
    tuitionYearKztOrUsd: 'Гос. грант РК или ~1 500 000 ₸/год',
    scholarshipAvailability: '100% гранты',
    hasDormitory: true,
    matchCategory: 'safety',
    matchScore: 91,
    whyFits: [
      'Ведущий национальный университет столицы с максимальным числом государственных грантов',
      'Удобная локация в Астане и развитая студенческая инфраструктура',
      'Доступный проходной порог на IT и инженерные специальности'
    ],
    keyStrengths: ['Крупнейший вуз столицы', 'Огромная квота госгрантов', 'Аккредитованные лаборатории'],
    avgGraduateSalary: 'от 550 000 ₸/мес',
    applicationDeadline: '20 июля 2026',
    officialSiteUrl: 'https://enu.kz',
    details: {
      aboutCampus: 'Несколько крупных учебных корпусов в парковой зоне Астаны рядом с набережной Гребного канала.',
      studentLife: 'Более 50 студенческих организаций, молодежные форумы, сильная секция легкой атлетики.',
      livingCostsPerMonth: '~120 000 – 160 000 ₸/мес',
      dormitoryDetails: '8 студенческих общежитий с распределением по социальной шкале и баллам ЕНТ.',
      topEmployers: ['Национальный банк РК', 'Казахтелеком', 'НИХ Зерде', 'Государственные ведомства РК'],
      rounds: {
        early: {
          name: 'Дни открытых дверей и профильные тесты',
          deadline: 'Апрель — Май 2026',
          description: 'Знакомство с кафедрами и факультетами.',
          recommendedFor: 'Выпускникам столичных и региональных школ.'
        },
        regular: {
          name: 'Основной республиканский конкурс грантов',
          deadline: '13 — 20 июля 2026',
          description: 'Подача заявления на грант через портал eGov.',
          recommendedFor: 'Балл ЕНТ 104+.'
        },
        late: {
          name: 'Зачисление на платное обучение',
          deadline: '10 — 25 августа 2026',
          description: 'Прием документов на контрактную форму.',
          recommendedFor: 'Балл ЕНТ 75+.'
        }
      },
      grantStats: {
        lastYearGrantsCount: 'Свыше 3 800 грантов зачислено в ЕНУ по всем специальностям',
        lastYearCutoff: '104 балла ЕНТ по IT и 92 балла по инженерии',
        competitionRatio: '2.1 человека на 1 грант',
        grantChanceSummary: 'Прекрасный надежный выбор в столице с высокой вероятностью поступления на грант.'
      }
    }
  },

  // ==========================================================================
  // ========================= ВОСТОЧНАЯ И ЮЖНАЯ АЗИЯ =========================
  // ==========================================================================
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
    examRequirement: 'Академические рекомендации + SAT (1420+) / олимпиадные дипломы',
    tuitionYearKztOrUsd: '100% KAIST Scholarship (учеба + ~$350/мес)',
    scholarshipAvailability: '100% гранты',
    hasDormitory: true,
    matchCategory: 'reach',
    matchScore: 91,
    whyFits: [
      'Все принятые иностранные студенты получают полное финансирование (обучение + ежемесячная стипендия)',
      '100% лекций на английском языке в ведущем научно-технологическом институте Азии',
      'Прямой мост в Samsung Electronics, LG, Hyundai и технологический сектор Южной Кореи'
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
    id: 'unist-kr',
    name: 'UNIST (Ulsan National Institute of Science and Technology)',
    shortName: 'UNIST',
    city: 'Ульсан',
    country: 'Южная Корея',
    region: 'asia',
    fields: ['cs_it', 'engineering'],
    programTitle: 'B.S. in Electrical & Computer Engineering',
    degrees: ['Бакалавриат (4 года)'],
    acceptanceRate: '22%',
    avgGpa: 4.6,
    languageRequirement: 'IELTS 6.0+ / TOEFL 80',
    examRequirement: 'Транскрипт + рекомендации учителей + эссе',
    tuitionYearKztOrUsd: '100% UNIST Global Scholarship (бесплатно + стипендия)',
    scholarshipAvailability: '100% гранты',
    hasDormitory: true,
    matchCategory: 'target',
    matchScore: 92,
    whyFits: [
      '100% обучение на английском языке в одном из самых динамично развивающихся институтов Кореи',
      'Полное освобождение от оплаты обучения и ежемесячная стипендия для поступивших иностранцев',
      'Расположение в индустриальной столице Кореи (Ульсан) рядом с заводами Hyundai Heavy Industries'
    ],
    keyStrengths: ['100% покрытие грантом', 'Высокий исследовательский рейтинг', 'Англоязычный кампус'],
    avgGraduateSalary: '$45 000 / год',
    applicationDeadline: '15 февраля 2026',
    officialSiteUrl: 'https://www.unist.ac.kr',
    details: {
      aboutCampus: 'Современнейший кампус вокруг живописного озера в Ульсане. Стеклянные исследовательские центры, передовые лаборатории графена и батарей.',
      studentLife: 'Дружелюбная мультикультурная среда, исследовательские группы с 1 курса, студенческие фестивали.',
      livingCostsPerMonth: 'Покрывается стипендией UNIST (~300 000 KRW/мес)',
      dormitoryDetails: 'Двухместные комнаты в ультрасовременных общежитиях на кампусе с Wi-Fi и спортзалами.',
      topEmployers: ['Hyundai Motor', 'SK Innovation', 'Samsung SDI', 'LG Chem', 'POSCO'],
      rounds: {
        early: {
          name: 'Track I (Осенний набор)',
          deadline: '15 декабря 2025 — 15 февраля 2026',
          description: 'Основной набор для иностранных абитуриентов.',
          recommendedFor: 'Кандидатам с хорошим GPA 4.5+ и IELTS 6.0+.'
        },
        regular: {
          name: 'Track II (Весенний набор)',
          deadline: '1 августа — 25 сентября 2026',
          description: 'Набор на весенний семестр.',
          recommendedFor: 'Абитуриентам после окончания школы.'
        },
        late: {
          name: 'Дополнительное окно собеседований',
          deadline: '10 октября — 15 ноября 2026',
          description: 'Финальное согласование стипендиатов.',
          recommendedFor: 'Кандидатам из листа ожидания.'
        }
      },
      grantStats: {
        lastYearGrantsCount: 'Свыше 200 международных стипендий',
        lastYearCutoff: 'GPA 4.5+ / IELTS 6.0 / сильное мотивационное письмо',
        competitionRatio: '3.8 человека на место',
        grantChanceSummary: 'Отличная альтернатива KAIST с более доступным проходным порогом и 100% грантом.'
      }
    }
  },
  {
    id: 'nus-sg',
    name: 'National University of Singapore (NUS)',
    shortName: 'NUS',
    city: 'Сингапур',
    country: 'Сингапур',
    region: 'asia',
    fields: ['cs_it', 'engineering', 'business_econ'],
    programTitle: 'Bachelor of Computing in Computer Science',
    degrees: ['Бакалавриат (4 года)'],
    acceptanceRate: '6%',
    avgGpa: 4.95,
    languageRequirement: 'IELTS 7.0 (min 6.5) / TOEFL 100',
    examRequirement: 'SAT (1480+) + SAT Subject/AP или победы на межнар. олимпиадах',
    tuitionYearKztOrUsd: 'MOE Tuition Grant (субсидия до 70%) или $30 000/год',
    scholarshipAvailability: 'Частичные стипендии',
    hasDormitory: true,
    matchCategory: 'reach',
    matchScore: 82,
    whyFits: [
      '№8 университет мира (QS World Rankings) и безоговорочный лидер Азии',
      'Эпицентр азиатского венчурного капитала и штаб-квартир технологических гигантов',
      'Субсидия MOE Tuition Grant от правительства Сингапура с 3-летней гарантией работы'
    ],
    keyStrengths: ['Топ-10 мира', 'Самые высокие зарплаты выпускников в Азии', 'Глобальный бренд диплома'],
    avgGraduateSalary: '$65 000 / год',
    applicationDeadline: '28 февраля 2026',
    officialSiteUrl: 'https://nus.edu.sg',
    details: {
      aboutCampus: 'Огромный инновационный город-кампус Кент-Ридж в Сингапуре со скоростным внутренним транспортом, музеями и технологическими парками.',
      studentLife: 'Глобальный нетворкинг со студентами со всего мира, программы обмена в Стэнфорд и MIT через NUS Overseas Colleges.',
      livingCostsPerMonth: '~$800 – 1 200 в месяц (Сингапур — дорогой мегаполис)',
      dormitoryDetails: 'Студенческие городки UTown с бассейнами, столовыми и круглосуточными хабами.',
      topEmployers: ['Google APAC', 'Shopee', 'Grab', 'Meta Singapore', 'Goldman Sachs', 'Bytedance'],
      rounds: {
        early: {
          name: 'Early International Round',
          deadline: '15 октября — 15 декабря 2025',
          description: 'Рассмотрение заявок международных олимпиадников.',
          recommendedFor: 'Победителям международных олимпиад и SAT 1500+.'
        },
        regular: {
          name: 'Main Application Window',
          deadline: '16 декабря 2025 — 28 февраля 2026',
          description: 'Основной международный дедлайн.',
          recommendedFor: 'Кандидатам с идеальным GPA 4.9–5.0.'
        },
        late: {
          name: 'MOE Grant Registration',
          deadline: '1 марта — 15 мая 2026',
          description: 'Оформление государственной субсидии на обучение.',
          recommendedFor: 'Принятым кандидатам.'
        }
      },
      grantStats: {
        lastYearGrantsCount: 'Субсидию MOE получают до 60% принятых иностранных студентов',
        lastYearCutoff: 'GPA 4.9+ / SAT 1490+ / IELTS 7.5',
        competitionRatio: '14 претендентов на 1 место',
        grantChanceSummary: 'Ультра-селективный вуз. Без выдающихся олимпиадных достижений или SAT 1500+ шансы не превышают 5–10%.'
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
    id: 'tsinghua-cn',
    name: 'Tsinghua University (Университет Цинхуа)',
    shortName: 'Цинхуа',
    city: 'Пекин',
    country: 'Китай',
    region: 'asia',
    fields: ['cs_it', 'engineering', 'business_econ'],
    programTitle: 'B.Sc. in Computer Science & Artificial Intelligence',
    degrees: ['Бакалавриат (4 года)'],
    acceptanceRate: '9%',
    avgGpa: 4.9,
    languageRequirement: 'IELTS 7.0 / TOEFL 100 / HSK 5 (при кит. отделении)',
    examRequirement: 'SAT 1450+ / победы на олимпиадах + 2 этапа собеседований',
    tuitionYearKztOrUsd: 'CGS / Beijing Government Scholarship (100% грант)',
    scholarshipAvailability: '100% гранты',
    hasDormitory: true,
    matchCategory: 'reach',
    matchScore: 84,
    whyFits: [
      '№1 университет Китая и всей континентальной Азии (MIT Востока)',
      'Сильнейшие научные школы в мире по алгоритмам и квантовым вычислениям',
      'Полная стипендия правительства Пекина и стипендия CGS'
    ],
    keyStrengths: ['№1 в Азии', 'Академическая элита', 'Прямой нетворкинг с лидерами Китая'],
    avgGraduateSalary: '$50 000 / год',
    applicationDeadline: '10 января 2026',
    officialSiteUrl: 'https://tsinghua.edu.cn',
    details: {
      aboutCampus: 'Императорские королевские сады династии Цин в Пекине. Огромная охраняемая зеленая территория с футуристичными лабораториями.',
      studentLife: 'Сверхинтенсивная академическая среда, состязания по спортивному программированию и лидерские клубы.',
      livingCostsPerMonth: 'Покрывается стипендией CGS (3 000 RMB/мес)',
      dormitoryDetails: 'Азиговые общежития для иностранных студентов Zijing с индивидуальными комнатами.',
      topEmployers: ['Tencent', 'Huawei', 'Baidu', 'Bytedance', 'Goldman Sachs China'],
      rounds: {
        early: {
          name: 'First Round (Приоритетный)',
          deadline: '15 сентября — 20 октября 2025',
          description: 'Рассмотрение кандидатов с наивысшими баллами тестов.',
          recommendedFor: 'SAT 1460+ и олимпиадникам.'
        },
        regular: {
          name: 'Second Round (Основной)',
          deadline: '21 октября — 10 декабря 2025',
          description: 'Основной международный набор с видео-собеседованием.',
          recommendedFor: 'Всем абитуриентам с высоким GPA.'
        },
        late: {
          name: 'Third Round (Финальный)',
          deadline: '11 декабря 2025 — 10 января 2026',
          description: 'Добор на свободные квоты.',
          recommendedFor: 'Запасное окно.'
        }
      },
      grantStats: {
        lastYearGrantsCount: 'Около 120 стипендий китайского правительства бакалаврам',
        lastYearCutoff: 'GPA 4.9+ / SAT 1460+ / сложное математическое интервью',
        competitionRatio: '11 претендентов на место',
        grantChanceSummary: 'Экстремально высокая конкуренция. Требуются выдающиеся олимпиадные результаты.'
      }
    }
  },
  {
    id: 'metu-tr',
    name: 'Middle East Technical University (METU / ODTÜ)',
    shortName: 'METU (Турция)',
    city: 'Анкара',
    country: 'Турция',
    region: 'asia',
    fields: ['cs_it', 'engineering'],
    programTitle: 'B.S. in Computer Engineering & Cyber Systems',
    degrees: ['Бакалавриат (4 года)'],
    acceptanceRate: '24%',
    avgGpa: 4.5,
    languageRequirement: 'IELTS 6.5 / TOEFL 79 / Внутренний экзамен',
    examRequirement: 'SAT Reasoning (Math min 680, Total 1300+) или высокий аттестат',
    tuitionYearKztOrUsd: 'Стипендия «Türkiye Bursları» (100% грант + перелет + жилье) или ~$1 500/год',
    scholarshipAvailability: '100% гранты',
    hasDormitory: true,
    matchCategory: 'target',
    matchScore: 92,
    whyFits: [
      'Ведущий технический университет Турции с преподаванием на 100% английском языке',
      'Возможность получения правительственного гранта Türkiye Bursları (оплата учебы, жилья, страховки и авиабилетов)',
      'Признание диплома ABET во всех странах Европы и США'
    ],
    keyStrengths: ['Аккредитация ABET', '100% английский язык', 'Грант Türkiye Bursları'],
    avgGraduateSalary: '$35 000 / год',
    applicationDeadline: '5 июля 2026',
    officialSiteUrl: 'https://metu.edu.tr',
    details: {
      aboutCampus: 'Огромный лесной кампус площадью 4 500 гектаров с собственным озером Эймир в Анкаре. Крупнейший технопарк Турции ODTÜ TEKNOKENT прямо на территории.',
      studentLife: 'Очень активная студенческая жизнь, международные клубы, яхтинг на озере, фестивали весны Bahar Şenliği.',
      livingCostsPerMonth: '~$250 – 400 в месяц (Турция очень комфортна по бюджету)',
      dormitoryDetails: '19 студенческих общежитий на кампусе с развитой инфраструктурой.',
      topEmployers: ['Aselsan', 'Havelsan', 'Roketsan', 'Turkish Airlines', 'Siemens Turkey'],
      rounds: {
        early: {
          name: 'Подача на госгрант Türkiye Bursları',
          deadline: '10 января — 20 февраля 2026',
          description: 'Подача на правительственный грант Турции через единый портал.',
          recommendedFor: 'Кандидатам с GPA от 4.5+.'
        },
        regular: {
          name: 'Прямая подача в METU по результатам SAT',
          deadline: '1 июня — 5 июля 2026',
          description: 'Подача заявок на международные места с сертификатом SAT (1300+).',
          recommendedFor: 'Кандидатам со сданным SAT.'
        },
        late: {
          name: 'Добор на свободные квоты',
          deadline: '15 июля — 10 августа 2026',
          description: 'Рассмотрение оставшихся заявок.',
          recommendedFor: 'Запасной поток.'
        }
      },
      grantStats: {
        lastYearGrantsCount: 'Свыше 800 грантов Türkiye Bursları выделено для граждан Казахстана',
        lastYearCutoff: 'GPA 4.5+ / SAT Math 700+ / успешное очное собеседование в Астане/Алматы',
        competitionRatio: '3.2 человека на грантовое место',
        grantChanceSummary: 'Очень высокие шансы для казахстанцев благодаря теплым межгосударственным связям и квотам.'
      }
    }
  },
  {
    id: 'koc-tr',
    name: 'Koç University (Университет Коч)',
    shortName: 'Koç University',
    city: 'Стамбул',
    country: 'Турция',
    region: 'asia',
    fields: ['cs_it', 'business_econ', 'medicine_bio'],
    programTitle: 'BSc in Computer Science & Artificial Intelligence',
    degrees: ['Бакалавриат (4 года)'],
    acceptanceRate: '18%',
    avgGpa: 4.7,
    languageRequirement: 'TOEFL 80 / IELTS 6.5',
    examRequirement: 'SAT (1350+) + сильное мотивационное письмо и портфолио',
    tuitionYearKztOrUsd: 'Koç University Merit Scholarships (100% гранты + жилье)',
    scholarshipAvailability: '100% гранты',
    hasDormitory: true,
    matchCategory: 'reach',
    matchScore: 91,
    whyFits: [
      '№1 частный исследовательский университет Турции по мировым рейтингам THE и QS',
      'Щедрые внутренние академические гранты 100% и 50% для талантливых иностранцев',
      'Обучение полностью на английском языке в потрясающем лесном кампусе Стамбула'
    ],
    keyStrengths: ['№1 университет Турции в рейтингах', '100% академические гранты', 'Англоязычная элита'],
    avgGraduateSalary: '$42 000 / год',
    applicationDeadline: '30 июня 2026',
    officialSiteUrl: 'https://ku.edu.tr',
    details: {
      aboutCampus: 'Живописный кампус в сосновом лесу района Сарыер на берегу Босфора в европейской части Стамбула.',
      studentLife: 'Студенческое самоуправление, нетворкинг с турецким и международным бизнес-сообществом Koç Holding.',
      livingCostsPerMonth: 'Покрывается стипендией Koç Merit Scholarship (жилье бесплатно + стипендия)',
      dormitoryDetails: 'Роскошные общежития квартирного типа на территории кампуса с гарантией заселения грантников.',
      topEmployers: ['Koç Holding', 'McKinsey & Company', 'Google Istanbul', 'Unilever', 'Trendyol'],
      rounds: {
        early: {
          name: 'Early Action Track',
          deadline: '1 января — 31 марта 2026',
          description: 'Ранняя подача с максимальным шансом на 100% стипендию.',
          recommendedFor: 'Кандидатам с SAT 1400+.'
        },
        regular: {
          name: 'Regular International Track',
          deadline: '1 апреля — 30 июня 2026',
          description: 'Основной международный конкурс документов.',
          recommendedFor: 'Всем сильным абитуриентам.'
        },
        late: {
          name: 'Late Evaluation Window',
          deadline: '1 июля — 15 августа 2026',
          description: 'Рассмотрение оставшихся квот.',
          recommendedFor: 'Запасной трек.'
        }
      },
      grantStats: {
        lastYearGrantsCount: 'Около 150 полных и 300 частичных грантов иностранным бакалаврам',
        lastYearCutoff: 'SAT 1380+ / GPA 4.75+ / сильные проекты',
        competitionRatio: '4.5 человека на 100% стипендию',
        grantChanceSummary: 'Престижный вуз. Для получения полного гранта необходим высокий SAT и качественное эссе.'
      }
    }
  },
  {
    id: 'tokyo-tech-jp',
    name: 'Tokyo Institute of Technology (Tokyo Tech / Science Tokyo)',
    shortName: 'Tokyo Tech',
    city: 'Токио',
    country: 'Япония',
    region: 'asia',
    fields: ['cs_it', 'engineering'],
    programTitle: 'Global Scientists and Engineers Program (GSEP)',
    degrees: ['Бакалавриат (4 года)'],
    acceptanceRate: '12%',
    avgGpa: 4.8,
    languageRequirement: 'IELTS 6.5+ / TOEFL 85',
    examRequirement: 'Внутренний экзамен по математике/физике или SAT + собеседование',
    tuitionYearKztOrUsd: 'Стипендия правительства Японии (MEXT): 100% учеба + ¥120 000/мес',
    scholarshipAvailability: '100% гранты',
    hasDormitory: true,
    matchCategory: 'reach',
    matchScore: 89,
    whyFits: [
      'Ведущий инженерный институт Японии с уникальной программой GSEP на 100% английском языке',
      'Полное финансирование по государственной стипендии MEXT (оплата учебы, проживания и ежемесячная стипендия)',
      'Прямой доступ к японской индустрии высоких технологий и робототехники'
    ],
    keyStrengths: ['Стипендия MEXT покрывает 100% расходов', 'Инженерия №1 в Японии', 'Токио'],
    avgGraduateSalary: '$48 000 / год',
    applicationDeadline: '15 декабря 2025',
    officialSiteUrl: 'https://www.titech.ac.jp',
    details: {
      aboutCampus: 'Кампусы Окаяма и Судзукакедай в Токио. Сверхсовременные лаборатории робототехники, квантовых материалов и наноэлектроники.',
      studentLife: 'Погружение в культуру Японии, изучение японского языка параллельно со специальностью, сообщество GSEP.',
      livingCostsPerMonth: 'Полностью компенсируется стипендией MEXT (~¥120 000 в месяц чистыми)',
      dormitoryDetails: 'Международные резиденции Tokyo Tech в 15 минутах от кампуса.',
      topEmployers: ['Sony', 'Toyota Motor', 'Hitachi', 'SoftBank', 'Panasonic', 'Rakuten'],
      rounds: {
        early: {
          name: 'MEXT Embassy Track (через Посольство Японии)',
          deadline: 'Апрель — Июнь 2025',
          description: 'Отбор через Посольство Японии в РК с письменными тестами по математике.',
          recommendedFor: 'Кандидатам с отличной фундаментальной математикой.'
        },
        regular: {
          name: 'GSEP University Recommendation Track',
          deadline: '15 августа — 15 декабря 2025',
          description: 'Прямая подача на англоязычную программу бакалавриата.',
          recommendedFor: 'Основной международный дедлайн.'
        },
        late: {
          name: 'Собеседование и оглашение результатов',
          deadline: 'Январь — Февраль 2026',
          description: 'Финальный этап онлайн-интервью.',
          recommendedFor: 'Финалистам.'
        }
      },
      grantStats: {
        lastYearGrantsCount: '15 полных стипендий MEXT на программу GSEP ежегодно',
        lastYearCutoff: 'GPA 4.8+ / высокий балл за письменный экзамен по математике',
        competitionRatio: '8.5 человек на 1 место',
        grantChanceSummary: 'Отбор очень селективный, но программа одна из лучших в мире для инженеров.'
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
  {
    id: 'um-my',
    name: 'Universiti Malaya (UM)',
    shortName: 'Университет Малайя (UM)',
    city: 'Куала-Лумпур',
    country: 'Малайзия',
    region: 'asia',
    fields: ['cs_it', 'engineering', 'medicine_bio'],
    programTitle: 'Bachelor of Computer Science (Artificial Intelligence)',
    degrees: ['Бакалавриат (3.5 года)'],
    acceptanceRate: '28%',
    avgGpa: 4.6,
    languageRequirement: 'IELTS 6.0+ / TOEFL 80',
    examRequirement: 'Аттестат с высоким средним баллом + математический транскрипт',
    tuitionYearKztOrUsd: '~$4 000 – 5 000 в год (доступное гос. обучение)',
    scholarshipAvailability: 'Частичные стипендии',
    hasDormitory: true,
    matchCategory: 'target',
    matchScore: 90,
    whyFits: [
      'Старейший и престижнейший университет Малайзии, входящий в топ-60 лучших вузов мира (QS Top 60)',
      'Преподавание на английском языке по стоимости в 4-5 раз ниже европейских и американских аналогов',
      'Высочайшая международная репутация диплома в странах Азии и Содружества'
    ],
    keyStrengths: ['Топ-60 мира по QS', 'Доступная стоимость учебы', 'Диплом признается глобально'],
    avgGraduateSalary: '$32 000 / год',
    applicationDeadline: '31 мая 2026',
    officialSiteUrl: 'https://www.um.edu.my',
    details: {
      aboutCampus: 'Огромный тропический кампус площадью 360 гектаров в самом сердце Куала-Лумпура со своими клиниками, ботаническим садом и озерами.',
      studentLife: 'Многонациональное студенчество, научные конференции, спортивные фестивали.',
      livingCostsPerMonth: '~$350 – 500 в месяц',
      dormitoryDetails: '12 жилых колледжей на территории кампуса.',
      topEmployers: ['Intel Malaysia', 'Dyson', 'Shell APAC', 'Maybank', 'Petronas'],
      rounds: {
        early: {
          name: 'Semester 1 Intake (Ранний)',
          deadline: '1 января — 31 марта 2026',
          description: 'Ранняя подача документов через международный портал UM.',
          recommendedFor: 'Всем абитуриентам с готовыми оценками.'
        },
        regular: {
          name: 'Semester 1 Intake (Основной)',
          deadline: '1 апреля — 31 мая 2026',
          description: 'Основной дедлайн на осенний семестр.',
          recommendedFor: 'Выпускникам 11 классов.'
        },
        late: {
          name: 'Semester 2 Spring Intake',
          deadline: '1 июня — 30 сентября 2026',
          description: 'Набор на весенний поток.',
          recommendedFor: 'Запасной поток.'
        }
      },
      grantStats: {
        lastYearGrantsCount: 'Стипендии UM R&D и скидки лучшим международным студентам',
        lastYearCutoff: 'GPA 4.5+ / IELTS 6.0',
        competitionRatio: '3.4 человека на место',
        grantChanceSummary: 'Прекрасный баланс мирового престижа (топ-60) и очень доступной стоимости.'
      }
    }
  },

  // ==========================================================================
  // ================================ ЕВРОПА ==================================
  // ==========================================================================
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
    examRequirement: 'Аттестат с отличием + Studienkolleg / 1 год вуза в РК',
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
      aboutCampus: 'Кампус в Гархинге — крупнейший научный центр Германии с собственным исследовательским реактором, аэрокосмическими центрами и институтами Макса Планка.',
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
    id: 'rwth-de',
    name: 'RWTH Aachen University (Рейнско-Вестфальский тех. университет)',
    shortName: 'RWTH Aachen',
    city: 'Ахен',
    country: 'Германия',
    region: 'europe',
    fields: ['engineering', 'cs_it'],
    programTitle: 'B.Sc. in Mechanical Engineering & Automation',
    degrees: ['Бакалавриат (3 года)'],
    acceptanceRate: '27%',
    avgGpa: 4.6,
    languageRequirement: 'Немецкий B2/C1 или Английский IELTS 6.5 (по программе)',
    examRequirement: 'Аттестат + Studienkolleg (T-Kurs) или 1 курс вуза в РК',
    tuitionYearKztOrUsd: '€0 обучение (семестровый взнос ~€320 с проездным)',
    scholarshipAvailability: '100% гранты',
    hasDormitory: true,
    matchCategory: 'target',
    matchScore: 91,
    whyFits: [
      'Крупнейший и самый авторитетный политехнический институт Германии (член альянса TU9)',
      'Обучение полностью бесплатное (0 евро за учебу, оплачивается только студенческий проездной)',
      'Прямой наем в немецкий автопром (Porsche, Mercedes, Audi) и глобальное машиностроение'
    ],
    keyStrengths: ['Бесплатное высшее образование в Германии', 'Альянс TU9', 'Студенческий билет с проездом по всей ФРГ'],
    avgGraduateSalary: '€52 000 / год',
    applicationDeadline: '15 июля 2026',
    officialSiteUrl: 'https://www.rwth-aachen.de',
    details: {
      aboutCampus: 'Город Ахен на границе с Бельгией и Нидерландами. Кампус Мелатен — гигантский кластер промышленных исследований.',
      studentLife: 'Интернациональный студенческий город, карнавалы, поездки в Брюссель и Амстердам на выходные.',
      livingCostsPerMonth: '~€800 – 950 в месяц',
      dormitoryDetails: 'Общежития Studierendenwerk Aachen (комнаты от €250/мес).',
      topEmployers: ['Audi AG', 'Porsche', 'Bayer', 'Bosch', 'Thyssenkrupp'],
      rounds: {
        early: {
          name: 'Подготовка и подача в Studienkolleg',
          deadline: '15 января — 15 марта 2026',
          description: 'Регистрация на вступительный тест в штудиенколлег.',
          recommendedFor: 'Выпускникам 11 классов школ СНГ.'
        },
        regular: {
          name: 'Подача через портал RWTH Online',
          deadline: '1 июня — 15 июля 2026',
          description: 'Основной дедлайн на зимний семестр.',
          recommendedFor: 'Абитуриентам с подтвержденным языком.'
        },
        late: {
          name: 'Добор и оформление визы',
          deadline: '16 июля — 31 августа 2026',
          description: 'Визовые процедуры в Посольстве Германии.',
          recommendedFor: 'Принятым студентам.'
        }
      },
      grantStats: {
        lastYearGrantsCount: 'Все студенты учатся бесплатно, стипендии DAAD и Deutschlandstipendium',
        lastYearCutoff: 'GPA 4.5+ / немецкий язык TestDaF 4x4',
        competitionRatio: '3.1 человека на место',
        grantChanceSummary: 'Великолепный вариант для качественного бесплатного европейского инженерного образования.'
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
  {
    id: 'unibo-it',
    name: 'University of Bologna (Болонский университет)',
    shortName: 'Университет Болоньи',
    city: 'Болонья',
    country: 'Италия',
    region: 'europe',
    fields: ['business_econ', 'social_law', 'cs_it'],
    programTitle: 'B.Sc. in Business, Economics & Data Analytics',
    degrees: ['Бакалавриат (3 года)'],
    acceptanceRate: '30%',
    avgGpa: 4.5,
    languageRequirement: 'IELTS 6.0 / B2',
    examRequirement: 'SAT (1200+) или экзамен TOLC-E на английском языке',
    tuitionYearKztOrUsd: 'Стипендия ER.GO: €0 + стипендия до €7 000/год',
    scholarshipAvailability: '100% гранты',
    hasDormitory: true,
    matchCategory: 'target',
    matchScore: 93,
    whyFits: [
      'Старейший непрерывно действующий университет мира (основан в 1088 году)',
      'Региональная стипендия ER.GO гарантирует бесплатное обучение и выплаты на проживание',
      'Огромное число англоязычных программ бакалавриата в центре студенческой Италии'
    ],
    keyStrengths: ['Старейший вуз мира', 'Стипендия ER.GO покрывает жизнь', 'Англоязычные программы'],
    avgGraduateSalary: '€38 000 / год',
    applicationDeadline: '30 апреля 2026',
    officialSiteUrl: 'https://www.unibo.it',
    details: {
      aboutCampus: 'Исторический центр Болоньи. Дворцы с фресками сочетаются с современными компьютерными классами и библиотеками.',
      studentLife: 'Болонья — главный студенческий город Италии: аперитивы, фестивали, живое интернациональное сообщество.',
      livingCostsPerMonth: 'Полностью компенсируется стипендией ER.GO',
      dormitoryDetails: 'Студенческие резиденции ER.GO в пешей доступности от факультетов.',
      topEmployers: ['Ducati Motor', 'Lamborghini', 'UniCredit Bank', 'PwC Italy', 'Barilla'],
      rounds: {
        early: {
          name: 'First Intake (SAT/TOLC)',
          deadline: '15 января — 28 февраля 2026',
          description: 'Ранний отбор по баллам экзамена TOLC или SAT.',
          recommendedFor: 'Кандидатам с готовым тестом.'
        },
        regular: {
          name: 'Second Intake (Основной)',
          deadline: '1 марта — 30 апреля 2026',
          description: 'Основной прием заявок и подготовка документов на ER.GO.',
          recommendedFor: 'Большинству выпускников школ.'
        },
        late: {
          name: 'Third Intake (Добор)',
          deadline: '1 мая — 30 июня 2026',
          description: 'Позднее окно при наличии свободных мест.',
          recommendedFor: 'Запасной поток.'
        }
      },
      grantStats: {
        lastYearGrantsCount: 'Стипендии ER.GO получили свыше 3 000 иностранных студентов',
        lastYearCutoff: 'ISEE < €26 000/год + положительный балл TOLC-E (от 18 из 36)',
        competitionRatio: '2.8 человека на место',
        grantChanceSummary: 'Очень высокие шансы на бесплатную учебу и грант для абитуриентов из Казахстана.'
      }
    }
  },
  {
    id: 'tudelft-nl',
    name: 'Delft University of Technology (TU Delft)',
    shortName: 'TU Delft',
    city: 'Делфт',
    country: 'Нидерланды',
    region: 'europe',
    fields: ['cs_it', 'engineering'],
    programTitle: 'BSc in Computer Science and Engineering',
    degrees: ['Бакалавриат (3 года)'],
    acceptanceRate: '20%',
    avgGpa: 4.85,
    languageRequirement: 'IELTS 7.0 (min 6.5) / TOEFL 90+',
    examRequirement: 'Numerus Fixus (внутренний онлайн-тест по математике, логике и алгоритмам)',
    tuitionYearKztOrUsd: '~€16 000/год (доступны стипендии Justus & Louise van Effen)',
    scholarshipAvailability: 'Частичные стипендии',
    hasDormitory: true,
    matchCategory: 'reach',
    matchScore: 85,
    whyFits: [
      'Входит в топ-10 лучших инженерных институтов мира (QS Engineering Top 10)',
      'Программа 100% на английском языке в самом сердце европейского технологического коридора',
      'Выпускники ценятся на вес золота в ASML, Booking.com, Philips и космической отрасли ESA'
    ],
    keyStrengths: ['Топ-10 инженерии в мире', '100% английский язык', 'Близость к техногигантам ASML'],
    avgGraduateSalary: '€50 000 / год',
    applicationDeadline: '15 января 2026',
    officialSiteUrl: 'https://www.tudelft.nl',
    details: {
      aboutCampus: 'Футуристический университетский городок в Делфте с уникальной библиотекой с зеленой крышей-склоном и аэрокосмическими ангарами.',
      studentLife: 'Велосипедная культура Нидерландов, международные инженерные команды Nuon Solar Team, путешествия по Европе.',
      livingCostsPerMonth: '~€950 – 1 300 в месяц (жилье в Голландии в дефиците, бронировать заранее)',
      dormitoryDetails: 'Бронирование через DUWO (жилье на 1 курс гарантируется при ранней оплате взноса).',
      topEmployers: ['ASML', 'Booking.com', 'Uber Amsterdam', 'Philips', 'Shell', 'ESA'],
      rounds: {
        early: {
          name: 'Дедлайн Numerus Fixus (Строгий дедлайн!)',
          deadline: '15 января 2026 (11:59 CET)',
          description: 'Единый строгий дедлайн для программ Computer Science и Aerospace.',
          recommendedFor: 'Обязателен для всех кандидатов без исключения.'
        },
        regular: {
          name: 'Онлайн-экзамены отбора (Selection Exams)',
          deadline: 'Февраль — Март 2026',
          description: 'Прохождение онлайн-тестирования по математике и логике.',
          recommendedFor: 'Всем зарегистрированным кандидатам.'
        },
        late: {
          name: 'Публикация Ranking Number',
          deadline: '15 апреля 2026',
          description: 'Оглашение номеров рейтинга в Studielink и принятие оффера.',
          recommendedFor: 'Кандидатам, вошедшим в топ-500.'
        }
      },
      grantStats: {
        lastYearGrantsCount: 'Квота 550 мест на программу BSc Computer Science',
        lastYearCutoff: 'GPA 4.8+ / высокий рейтинг по результатам отборочного теста Numerus Fixus',
        competitionRatio: '4.9 человека на 1 место',
        grantChanceSummary: 'Строгий отбор через внутренний тест. Для прохождения требуется отличная математика.'
      }
    }
  },
  {
    id: 'elte-hu',
    name: 'Eötvös Loránd University (ELTE) / BME Budapest',
    shortName: 'ELTE / BME Будапешт',
    city: 'Будапешт',
    country: 'Венгрия',
    region: 'europe',
    fields: ['cs_it', 'engineering', 'business_econ'],
    programTitle: 'B.Sc. in Computer Science & Software Architecture',
    degrees: ['Бакалавриат (3 года)'],
    acceptanceRate: '32%',
    avgGpa: 4.4,
    languageRequirement: 'IELTS 5.5+ / B2',
    examRequirement: 'Школьный аттестат + внутреннее онлайн-тестирование по математике',
    tuitionYearKztOrUsd: 'Стипендия Stipendium Hungaricum: 100% учеба + жилье + стипендия',
    scholarshipAvailability: '100% гранты',
    hasDormitory: true,
    matchCategory: 'target',
    matchScore: 94,
    whyFits: [
      'Государственная стипендия Stipendium Hungaricum (250 грантов ежегодно выделяются гражданам РК)',
      '100% бесплатное обучение, бесплатное общежитие, медицинская страховка и ежемесячные выплаты',
      'Программа полностью на английском языке в красивейшей европейской столице (Будапешт)'
    ],
    keyStrengths: ['100% грант Stipendium Hungaricum', 'Квота 250 грантов для РК', 'Диплом ЕС'],
    avgGraduateSalary: '€36 000 / год',
    applicationDeadline: '15 января 2026',
    officialSiteUrl: 'https://www.elte.hu',
    details: {
      aboutCampus: 'Кампус в живописном районе Будапешта на берегу Дуная рядом с мостом Ракоци. Современные IT-лаборатории и исторические библиотеки.',
      studentLife: 'Очень доступная европейская жизнь, активное сообщество казахстанских студентов в Венгрии, путешествия по Шенгену.',
      livingCostsPerMonth: 'Полностью покрывается стипендией и бесплатным общежитием',
      dormitoryDetails: 'Комфортные студенческие общежития ELTE Dormitory предоставляются бесплатно стипендиатам.',
      topEmployers: ['Morgan Stanley Budapest', 'EPAM Hungary', 'Nokia Bell Labs', 'Continental', 'Bosch Budapest'],
      rounds: {
        early: {
          name: 'Подача заявки в Stipendium Hungaricum и ЦМП РК («Болашак»)',
          deadline: '15 ноября 2025 — 15 января 2026',
          description: 'Параллельная подача документов через международный портал DreamApply и портал «Болашак» РК.',
          recommendedFor: 'Всем абитуриентам, желающим учиться в Европе бесплатно.'
        },
        regular: {
          name: 'Вступительные экзамены и собеседования университетов',
          deadline: 'Март — Май 2026',
          description: 'Прохождение онлайн-тестирования по математике и собеседования с профессорами ELTE/BME.',
          recommendedFor: 'Кандидатам, прошедшим национальную номинацию.'
        },
        late: {
          name: 'Окончательное утверждение гранта TPF',
          deadline: 'Июнь — Июль 2026',
          description: 'Получение официального сертификата о присуждении стипендии и оформление визы D.',
          recommendedFor: 'Победителям конкурса.'
        }
      },
      grantStats: {
        lastYearGrantsCount: '250 полных межправительственных грантов выделено гражданам Казахстана',
        lastYearCutoff: 'GPA 4.3+ / IELTS 5.5+ / прохождение теста по математике на 60%+',
        competitionRatio: '2.5 человека на 1 грантовое место',
        grantChanceSummary: 'Один из самых надежных и щедрых грантовых путей в Европу с очень высокой вероятностью успеха.'
      }
    }
  },
  {
    id: 'charles-cz',
    name: 'Charles University (Карлов Университет в Праге)',
    shortName: 'Карлов Университет',
    city: 'Прага',
    country: 'Чехия',
    region: 'europe',
    fields: ['cs_it', 'medicine_bio', 'social_law'],
    programTitle: 'BSc in Computer Science (General Computer Science)',
    degrees: ['Бакалавриат (3 года)'],
    acceptanceRate: '28%',
    avgGpa: 4.5,
    languageRequirement: 'IELTS 6.5 / TOEFL 85',
    examRequirement: 'Вступительный письменный экзамен по математике / SAT Math (700+)',
    tuitionYearKztOrUsd: '~€4 500/год (на английском) или €0 (на чешском языке)',
    scholarshipAvailability: 'Частичные стипендии',
    hasDormitory: true,
    matchCategory: 'safety',
    matchScore: 91,
    whyFits: [
      'Старейший и престижнейший университет Центральной Европы (основан в 1348 году)',
      'Сильнейшая математическая и теоретическая школа Computer Science (факультет Matfyz)',
      'Возможность 100% бесплатного обучения при сдаче экзаменов на чешском языке'
    ],
    keyStrengths: ['Легендарный факультет Matfyz', 'Диплом ЕС', 'Прага — центр Европы'],
    avgGraduateSalary: '€38 000 / год',
    applicationDeadline: '30 апреля 2026',
    officialSiteUrl: 'https://cuni.cz',
    details: {
      aboutCampus: 'Исторические корпуса в центре Праги и технологический комплекс Малостранска на факультете математики и физики.',
      studentLife: 'Прага — один из самых красивых и безопасных городов мира. Огромное студенческое сообщество.',
      livingCostsPerMonth: '~€600 – 800 в месяц',
      dormitoryDetails: 'Студенческие общежития Koleje UK (доступная цена от €180/мес).',
      topEmployers: ['Avast / Gen Digital', 'JetBrains Prague', 'Microsoft Czechia', 'Skoda Auto', 'Barclays Prague'],
      rounds: {
        early: {
          name: 'First Application Wave',
          deadline: '1 января — 28 февраля 2026',
          description: 'Ранняя подача с возможностью освобождения от экзаменов по баллам SAT Math.',
          recommendedFor: 'Кандидатам с SAT Math 700+.'
        },
        regular: {
          name: 'Main Application Wave',
          deadline: '1 марта — 30 апреля 2026',
          description: 'Основной дедлайн с очными или онлайн вступительными экзаменами.',
          recommendedFor: 'Большинству абитуриентов.'
        },
        late: {
          name: 'Нострификация аттестата и виза',
          deadline: 'Май — Июль 2026',
          description: 'Оформление нострификации и студенческой визы.',
          recommendedFor: 'Принятым студентам.'
        }
      },
      grantStats: {
        lastYearGrantsCount: 'Академические стипендии за успеваемость получают до 20% студентов',
        lastYearCutoff: 'GPA 4.3+ / SAT Math 700+ или успешная сдача внутреннего теста Matfyz',
        competitionRatio: '3.1 человека на место',
        grantChanceSummary: 'Отличный европейский вариант с сильной академической базой.'
      }
    }
  },
  {
    id: 'pw-pl',
    name: 'Warsaw University of Technology (Варшавский политех)',
    shortName: 'Варшавский политех (PW)',
    city: 'Варшава',
    country: 'Польша',
    region: 'europe',
    fields: ['cs_it', 'engineering'],
    programTitle: 'B.Sc. in Computer Systems and Networks',
    degrees: ['Бакалавриат (3.5 года — инженер)'],
    acceptanceRate: '42%',
    avgGpa: 4.2,
    languageRequirement: 'IELTS 6.0 / B2',
    examRequirement: 'Аттестат с оценками по математике и физике/информатике',
    tuitionYearKztOrUsd: '~€3 000 – 4 000 в год (очень доступная цена в ЕС)',
    scholarshipAvailability: 'Частичные стипендии',
    hasDormitory: true,
    matchCategory: 'safety',
    matchScore: 92,
    whyFits: [
      '№1 технический университет Польши с официальным званием инженера (Inżynier)',
      'Очень лояльный и предсказуемый процесс зачисления по школьному аттестату без сложных экзаменов',
      'Варшава — крупнейший IT-хаб Восточной Европы со штаб-квартирами Google Campus, CD Projekt Red и Samsung R&D'
    ],
    keyStrengths: ['№1 политех Польши', 'Степень инженера ЕС', 'Доступная стоимость учебы и жизни'],
    avgGraduateSalary: '€34 000 / год',
    applicationDeadline: '15 июля 2026',
    officialSiteUrl: 'https://www.pw.edu.pl',
    details: {
      aboutCampus: 'Величественный классический главный корпус в центре Варшавы и ультрасовременный кампус факультета электроники и IT.',
      studentLife: 'Динамичная жизнь в европейской столице, доступные цены, легкая адаптация для русскоговорящих студентов.',
      livingCostsPerMonth: '~€450 – 650 в месяц',
      dormitoryDetails: '11 студенческих домов (Domy Studenckie) с ценами от €120/мес.',
      topEmployers: ['CD Projekt Red', 'Google Warsaw', 'Samsung R&D Poland', 'Intel Gdańsk', 'Goldman Sachs Warsaw'],
      rounds: {
        early: {
          name: 'Early Intake Window',
          deadline: '1 февраля — 30 апреля 2026',
          description: 'Раннее бронирование мест на англоязычных программах.',
          recommendedFor: 'Кандидатам с готовыми табелями за 10–11 класс.'
        },
        regular: {
          name: 'Main Summer Intake',
          deadline: '1 мая — 15 июля 2026',
          description: 'Основной поток зачисления выпускников школ.',
          recommendedFor: 'Всем абитуриентам.'
        },
        late: {
          name: 'Late Intake Round',
          deadline: '16 июля — 15 августа 2026',
          description: 'Добор на оставшиеся места.',
          recommendedFor: 'Запасной поток.'
        }
      },
      grantStats: {
        lastYearGrantsCount: 'Скидки и стипендии ректора лучшим студентам после 1 семестра',
        lastYearCutoff: 'GPA 4.0+ / профильные точные предметы на 4 и 5',
        competitionRatio: '2.1 человека на место',
        grantChanceSummary: 'Превосходный европейский Safety-вариант с высокой вероятностью зачисления.'
      }
    }
  },

  // ==========================================================================
  // =============================== США И КАНАДА =============================
  // ==========================================================================
  {
    id: 'harvard-mit-us',
    name: 'Harvard University / MIT (Лига Плюща & Массачусетский тех.)',
    shortName: 'MIT / Harvard',
    city: 'Кембридж / Бостон',
    country: 'США',
    region: 'usa',
    fields: ['cs_it', 'engineering', 'business_econ', 'medicine_bio'],
    programTitle: 'B.S. in Computer Science & Artificial Intelligence',
    degrees: ['Бакалавриат (4 года)'],
    acceptanceRate: '3.4%',
    avgGpa: 4.98,
    languageRequirement: 'IELTS 7.5+ / TOEFL 105+',
    examRequirement: 'SAT (1520+) + олимпиадные достижения мирового уровня / медали IOI/IMO',
    tuitionYearKztOrUsd: '100% Need-Blind Financial Aid (покрывает всё при доходе семьи < $85k)',
    scholarshipAvailability: '100% гранты',
    hasDormitory: true,
    matchCategory: 'reach',
    matchScore: 68,
    whyFits: [
      'Вершина мировой науки, высшего образования и технологий (№1 в мире)',
      'Политика 100% Need-Blind Financial Aid: для принятых студентов с низким доходом обучение и жизнь полностью бесплатны',
      'Прямой доступ к ведущим профессорам, лауреатам Нобелевской премии и венчурным фондам Кремниевой долины'
    ],
    keyStrengths: ['№1 в мире', '100% Need-Blind финансовая помощь', 'Элитная сеть выпускников'],
    avgGraduateSalary: '$120 000 / год',
    applicationDeadline: '1 января 2026',
    officialSiteUrl: 'https://mit.edu',
    details: {
      aboutCampus: 'Культовый кампус вдоль реки Чарльз в Кембридже рядом с Бостоном. Бесконечные исследовательские коридоры Infinite Corridor и медиалаборатории MIT Media Lab.',
      studentLife: 'Интеллектуальная элита мира, студенческие хакатоны HackMIT, традиции «хаков» и стартапы прямо из общежитий.',
      livingCostsPerMonth: 'Полностью покрывается стипендией при предоставлении финансовой помощи CSS Profile',
      dormitoryDetails: 'Гарантированное кампусное проживание в знаменитых резиденциях Simmons Hall, Baker House.',
      topEmployers: ['Google DeepMind', 'OpenAI', 'Apple', 'Jane Street', 'Citadel', 'NVIDIA', 'NASA'],
      rounds: {
        early: {
          name: 'Early Action (Раннее действие)',
          deadline: '1 ноября 2025',
          description: 'Необязывающая ранняя подача для сильнейших кандидатов с готовым пакетом тестов.',
          recommendedFor: 'Кандидатам с SAT 1530+ и победами на республиканских/международных олимпиадах.'
        },
        regular: {
          name: 'Regular Decision (Основная подача)',
          deadline: '1 января 2026',
          description: 'Основной международный конкурс через Common Application.',
          recommendedFor: 'Всем абитуриентам.'
        },
        late: {
          name: 'Waitlist Notification',
          deadline: '1 мая — 1 июля 2026',
          description: 'Рассмотрение кандидатов из листа ожидания.',
          recommendedFor: 'Кандидатам из пула ожидания.'
        }
      },
      grantStats: {
        lastYearGrantsCount: '100% финансовая помощь всем принятым иностранцам с подтвержденной финансовой потребностью',
        lastYearCutoff: 'SAT 1520+ / GPA 5.0 / международные награды',
        competitionRatio: '29 претендентов на 1 место (отказ 96.6%)',
        grantChanceSummary: 'ЧЕСТНОЕ ПРЕДУПРЕЖДЕНИЕ: вероятность поступления менее 4-5%. Без олимпиад мирового уровня или уникальных научных открытий подача имеет характер «смелой мечты».'
      }
    }
  },
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
  },
  {
    id: 'usf-us',
    name: 'University of South Florida (USF)',
    shortName: 'USF',
    city: 'Тампа',
    country: 'США',
    region: 'usa',
    fields: ['cs_it', 'engineering', 'business_econ', 'medicine_bio'],
    programTitle: 'B.S. in Computer Engineering & Data Science',
    degrees: ['Бакалавриат (4 года)'],
    acceptanceRate: '41%',
    avgGpa: 4.4,
    languageRequirement: 'IELTS 6.5 / TOEFL 79 / Duolingo 110',
    examRequirement: 'SAT Reasoning (1280+) для гарантированной стипендии',
    tuitionYearKztOrUsd: 'Стипендия USF Green & Gold покрывает до $12 000/год',
    scholarshipAvailability: 'Частичные стипендии',
    hasDormitory: true,
    matchCategory: 'target',
    matchScore: 92,
    whyFits: [
      'Щедрые автоматические стипендии Green & Gold Waivers для иностранных студентов при наличии SAT 1280+',
      'Теплый солнечный климат Флориды и статус ведущего исследовательского университета Preeminent Research',
      'Стоимость обучения со стипендией снижается до уровня государственных вузов РК (~$5 000/год)'
    ],
    keyStrengths: ['Автоматические стипендии за SAT', 'Солнечная Флорида', 'Статус Preeminent'],
    avgGraduateSalary: '$68 000 / год',
    applicationDeadline: '15 января 2026',
    officialSiteUrl: 'https://www.usf.edu',
    details: {
      aboutCampus: 'Огромный зеленый тропический кампус в заливе Тампа с пальмовыми аллеями, фитнес-центрами и исследовательскими клиниками.',
      studentLife: 'Пляжи Мексиканского залива, студенческий спорт Bulls, сотни академических и карьерных сообществ.',
      livingCostsPerMonth: '~$900 – 1 300 в месяц',
      dormitoryDetails: 'Современные резиденции The Village на кампусе с собственным открытым бассейном.',
      topEmployers: ['Raymond James Financial', 'JPMorgan Chase Tampa', 'Tech Data', 'Jabil', 'Citigroup'],
      rounds: {
        early: {
          name: 'Priority Scholarship Deadline (Критически важен!)',
          deadline: '15 января 2026',
          description: 'Финальный дедлайн для гарантированного рассмотрения на стипендии Green & Gold.',
          recommendedFor: 'Кандидатам с SAT 1280+.'
        },
        regular: {
          name: 'General Admission Deadline',
          deadline: '1 марта 2026',
          description: 'Стандартный поток зачисления без гарантии максимальной стипендии.',
          recommendedFor: 'Всем абитуриентам.'
        },
        late: {
          name: 'Final Decision Date',
          deadline: '1 мая 2026',
          description: 'Подтверждение зачисления и внесение депозита.',
          recommendedFor: 'Принятым кандидатам.'
        }
      },
      grantStats: {
        lastYearGrantsCount: 'Стипендии Green & Gold ($6 000 – $12 000/год) получили более 70% подавших до 15 января с SAT 1300+',
        lastYearCutoff: 'SAT 1280+ / GPA 4.3+',
        competitionRatio: 'Прямое начисление по формальным критериям баллов',
        grantChanceSummary: 'Один из самых выгодных и предсказуемых вариантов в США по соотношению цена/качество.'
      }
    }
  },
  {
    id: 'utoronto-ca',
    name: 'University of Toronto (Университет Торонто)',
    shortName: 'U of T',
    city: 'Торонто',
    country: 'Канада',
    region: 'usa',
    fields: ['cs_it', 'engineering', 'business_econ', 'medicine_bio'],
    programTitle: 'Honours Bachelor of Science in Computer Science',
    degrees: ['Бакалавриат (4 года)'],
    acceptanceRate: '38%',
    avgGpa: 4.85,
    languageRequirement: 'IELTS 6.5 (min 6.0) / TOEFL 100',
    examRequirement: 'Аттестат с отличием + сильные оценки по высшей математике и физике',
    tuitionYearKztOrUsd: 'Lester B. Pearson Scholarship (100% грант) или CAD $60 000/год',
    scholarshipAvailability: '100% гранты',
    hasDormitory: true,
    matchCategory: 'reach',
    matchScore: 87,
    whyFits: [
      '№1 университет Канады и топ-20 мира (родина современного Deep Learning — Джеффри Хинтон)',
      'Престижнейшая полная международная стипендия Lester B. Pearson International Scholarship',
      'Возможность получения 3-летней канадской рабочей визы (PGWP) и последующего ПМЖ'
    ],
    keyStrengths: ['№1 в Канаде', 'Мировая столица AI', 'Легкая рабочая виза PGWP в Канаде'],
    avgGraduateSalary: 'CAD $78 000 / год',
    applicationDeadline: '15 января 2026',
    officialSiteUrl: 'https://www.utoronto.ca',
    details: {
      aboutCampus: 'Кампус Сент-Джордж в центре мегаполиса Торонто с готической архитектурой в стиле Оксфорда и суперсовременным центром векторных вычислений Vector Institute.',
      studentLife: 'Система колледжей (как в Оксфорде и Кембридже), клубы робототехники, мультикультурная среда Канады.',
      livingCostsPerMonth: '~CAD $1 200 – 1 600 в месяц',
      dormitoryDetails: 'Проживание в колледжах университета (University College, Trinity, Victoria).',
      topEmployers: ['Google Brain Toronto', 'Amazon Canada', 'RBC Royal Bank', 'Shopify', 'Meta AI'],
      rounds: {
        early: {
          name: 'Подача на стипендию Lester B. Pearson',
          deadline: '30 ноября 2025 (номинация школы) — 15 декабря 2025',
          description: 'Номинация от школы и подача на полный международный грант.',
          recommendedFor: 'Кандидатам с выдающимися лидерскими качествами и GPA 4.9+.'
        },
        regular: {
          name: 'Early / Regular OUAC Application',
          deadline: '15 декабря 2025 — 15 января 2026',
          description: 'Основная подача через единый портал OUAC 105.',
          recommendedFor: 'Всем абитуриентам.'
        },
        late: {
          name: 'Document Completion',
          deadline: '1 февраля 2026',
          description: 'Загрузка транскриптов и языковых сертификатов в портал Join U of T.',
          recommendedFor: 'Финальный этап.'
        }
      },
      grantStats: {
        lastYearGrantsCount: '37 полных стипендий Lester B. Pearson выделено иностранцам на весь мир',
        lastYearCutoff: 'GPA 4.95+ / выдающееся лидерское портфолио',
        competitionRatio: 'Очень высокий конкурс на 100% грант, умеренный на платное зачисление',
        grantChanceSummary: 'Поступление на программу CS требует высокого GPA. Шанс на стипендию Пирсона требует исключительного портфолио.'
      }
    }
  }
];
