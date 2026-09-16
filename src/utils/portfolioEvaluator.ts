import type { UserProfile, PortfolioAudit } from '../types';

/**
 * Реалистичный оценщик портфолио и внеучебных активностей.
 * Строго соблюдает принцип «Честная неопределенность»: не завышает баллы
 * и открыто указывает на нехватку аргументов для зарубежных топ-вузов.
 */
export function evaluatePortfolio(profile: UserProfile): PortfolioAudit {
  const text = (profile.portfolioText || '').trim().toLowerCase();

  // If no portfolio text provided
  if (!text || text.length < 15) {
    return {
      rating: 'basic',
      scoreOutOf100: 25,
      abroadCompetitiveness: 'Недостаточная без усиления',
      strongPoints: [
        'Фокус на академических показателях (GPA и вступительные экзамены)'
      ],
      criticalGaps: [
        'Полное отсутствие подтвержденных внеучебных достижений (Extracurriculars)',
        'Для топовых зарубежных вузов (США, Европа, Азия) холистическая оценка составляет до 40% решения',
        'Нет подтверждения лидерских качеств или проектного опыта'
      ],
      honestVerdict: 'Профиль держится исключительно на академических оценках. Для большинства вузов Казахстана этого достаточно, но для топовых зарубежных программ и престижных грантов шансы крайне низкие без 2–3 сильных проектов или олимпиадных достижений.',
      recommendedNextActivities: [
        'Создать 1 завершенный прикладной проект по специальности (например, веб-сервис или научное исследование)',
        'Принять участие в региональном хакатоне или предметной олимпиаде',
        'Набрать минимум 30–40 часов подтвержденной волонтерской деятельности'
      ]
    };
  }

  // Realistic keyword analysis
  const hasOlympiad = /олимпиад|медал|призер|республиканск|международн|ioi|imo|жаутыков|научных соревнов/.test(text);
  const hasProjects = /проект|github|приложени|бот|сайт|разработ|стартап|исследован|стать|публикаци/.test(text);
  const hasLeadership = /капитан|президент|основа|организова|руководил|команд|клуб|дебат/.test(text);
  const hasVolunteering = /волонтер|благотворительн|помощь|экологи|социальн/.test(text);
  const hasHackathon = /хакатон|hackathon|чемпионат|конкурс/.test(text);

  const strongPoints: string[] = [];
  const criticalGaps: string[] = [];
  let score = 35;

  if (hasOlympiad) {
    strongPoints.push('Олимпиадный опыт или академические соревнования');
    score += 25;
  }
  if (hasProjects) {
    strongPoints.push('Наличие самостоятельных прикладных проектов');
    score += 15;
  }
  if (hasHackathon) {
    strongPoints.push('Опыт работы в командных хакатонах и соревнованиях');
    score += 10;
  }
  if (hasLeadership) {
    strongPoints.push('Признаки лидерской позиции и организаторских навыков');
    score += 10;
  }
  if (hasVolunteering) {
    strongPoints.push('Социальная вовлеченность и волонтерская деятельность');
    score += 5;
  }

  // Realistic critical gaps detection
  if (!hasOlympiad && !hasHackathon) {
    criticalGaps.push('Нет побед на независимых внешних соревнованиях (городских, республиканских)');
  }
  if (!hasProjects) {
    criticalGaps.push('Отсутствует осязаемый проектный результат (код, ссылка, действующий прототип)');
  }
  if (!hasLeadership) {
    criticalGaps.push('Не отражена лидерская инициатива (роль исполнителя, а не инициатора)');
  }
  if (!hasVolunteering && profile.targetRegion === 'usa') {
    criticalGaps.push('Для американских вузов критически важна социальная отдача (Community Service)');
  }

  if (criticalGaps.length === 0) {
    criticalGaps.push('Высокая конкуренция: среди международных кандидатов важен масштаб импакта (число пользователей, уровень медалей)');
  }

  // Cap score realistically: nobody gets 98% without Olympic medals
  const finalScore = Math.min(85, Math.max(30, score));

  let rating: 'strong' | 'moderate' | 'basic' = 'moderate';
  let abroadCompetitiveness: 'Высокая' | 'Умеренная' | 'Недостаточная без усиления' = 'Умеренная';
  let honestVerdict = '';

  if (finalScore >= 70) {
    rating = 'strong';
    abroadCompetitiveness = 'Высокая';
    honestVerdict = 'У вас сильное, сбалансированное портфолио выше среднего уровня абитуриентов. Вы конкурентоспособны на грантовые программы в Европе и Азии, но для топ-20 вузов США потребуется четко упаковать измеримый импакт каждого достижения.';
  } else if (finalScore >= 45) {
    rating = 'moderate';
    abroadCompetitiveness = 'Умеренная';
    honestVerdict = 'Портфолио имеет неплохой старт, но большинство активностей пока носят локальный или ознакомительный характер. Приемная комиссия зарубежного вуза увидит интерес, но не увидит выдающегося превосходства над тысячами других кандидатов.';
  } else {
    rating = 'basic';
    abroadCompetitiveness = 'Недостаточная без усиления';
    honestVerdict = 'Базовый уровень. Текущих активностей недостаточно для победы в конкурсах на престижные зарубежные стипендии с полным покрытием. Необходим упор либо на госгранты Казахстана (где решают только баллы ЕНТ), либо срочное усиление 1–2 ключевых проектов.';
  }

  return {
    rating,
    scoreOutOf100: finalScore,
    abroadCompetitiveness,
    strongPoints,
    criticalGaps,
    honestVerdict,
    recommendedNextActivities: [
      'Упаковать 1 ключевой проект в понятное портфолио с демонстрацией (демо-ссылка, видео 60 сек)',
      'Собрать подтверждающие сертификаты, рекомендации от наставников и диплом за последние 2 года',
      'Описать активности через формулу «Сделал X с помощью Y, что привело к измеримому результату Z»'
    ]
  };
}
