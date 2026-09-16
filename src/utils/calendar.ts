import type { RoadmapStep } from '../types';

/**
 * Генерирует и инициирует скачивание файла .ics (iCalendar)
 * со всеми дедлайнами и шагами поступления
 */
export function exportRoadmapToIcs(steps: RoadmapStep[], applicantName: string): void {
  const events = steps.map((step, index) => {
    // Generate approximate date string (YYYYMMDD)
    const now = new Date();
    const eventYear = 2026;
    const eventMonth = String((index % 12) + 4).padStart(2, '0'); // April to August
    const eventDay = String(Math.min(25, 10 + index * 3)).padStart(2, '0');
    const dateStr = `${eventYear}${eventMonth}${eventDay}`;

    return [
      'BEGIN:VEVENT',
      `UID:admitroute-${step.id}-${Date.now()}@locus.hackathon`,
      `DTSTAMP:${now.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART;VALUE=DATE:${dateStr}`,
      `DTEND;VALUE=DATE:${dateStr}`,
      `SUMMARY:Дедлайн: ${step.title}`,
      `DESCRIPTION:${step.description.replace(/\n/g, ' ')} (Ориентировочный срок: ${step.deadlineDate})`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    ].join('\r\n');
  });

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AdmitRoute//Admission Roadmap Calendar//RU',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Маршрут поступления — ${applicantName || 'Абитуриент'}`,
    ...events,
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `admitroute-calendar-${Date.now()}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
