import type { ScholarshipItem } from '../types';

export const SCHOLARSHIPS_DATABASE: ScholarshipItem[] = [
  {
    id: 'kz-state-grant',
    title: 'Государственный образовательный грант РК',
    organization: 'Министерство науки и высшего образования РК',
    coverage: '100% стоимости обучения + ежемесячная гос. стипендия',
    eligibility: 'Выпускники школ и колледжей со сдачей ЕНТ. Проходной балл зависит от группы образовательных программ (IT: 105–120+, Инженерия: 85–100+).',
    region: 'kazakhstan',
    deadline: '13 — 20 июля 2026',
    officialUrl: 'https://testcenter.kz'
  },
  {
    id: 'kz-khalkyna',
    title: 'Образовательные гранты фонда «Қазақстан халқына»',
    organization: 'Общественный фонд «Қазақстан халқына»',
    coverage: '100% стоимости обучения в аккредитованных вузах РК + стипендия',
    eligibility: 'Абитуриенты из сельской местности, малообеспеченных семей, сироты или лица с особыми образовательными потребностями, сдавшие ЕНТ выше порогового балла.',
    region: 'kazakhstan',
    deadline: '1 — 17 августа 2026',
    officialUrl: 'https://qazaqstanhalqyna.kz'
  },
  {
    id: 'italy-dsu',
    title: 'Региональная стипендия DSU (Diritto allo Studio Universitario)',
    organization: 'Правительства регионов Италии (Ломбардия, Пьемонт и др.)',
    coverage: 'Полное освобождение от платы за учебу (€0) + выплата до €7 000 в год + льготное общежитие',
    eligibility: 'Присуждается на основе финансового дохода семьи (показатель ISEE Parificato < €24 000/год). Применяется в Politecnico di Milano, UniMi и др.',
    region: 'europe',
    deadline: 'Конец августа 2026',
    officialUrl: 'https://www.dsu.regione.lombardia.it'
  },
  {
    id: 'germany-daad',
    title: 'Стипендии DAAD и вузовские фонды Германии',
    organization: 'Германская служба академических обменов (DAAD)',
    coverage: 'Субсидии на проживание (~€934/мес) + страховка при бесплатном/квази-бесплатном обучении',
    eligibility: 'Высокая академическая успеваемость (GPA от 4.7), знание немецкого/английского языков (IELTS 6.5+ или TestDaF), мотивационное письмо.',
    region: 'europe',
    deadline: '15 июля 2026',
    officialUrl: 'https://www.daad.de'
  },
  {
    id: 'kaist-global',
    title: 'KAIST Global Undergraduate Scholarship',
    organization: 'Korea Advanced Institute of Science and Technology',
    coverage: '100% покрытие обучения на 8 семестров + ежемесячная стипендия ~350 000 KRW + медстраховка',
    eligibility: 'Все принятые иностранные студенты бакалавриата автоматически получают полное финансирование. Требуются выдающиеся успехи в математике/физике/CS и высокий GPA.',
    region: 'asia',
    deadline: '24 мая 2026',
    officialUrl: 'https://admission.kaist.ac.kr'
  }
];
