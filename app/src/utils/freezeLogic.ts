import { toISODate } from './date';

/** Returns the Monday ISO date (YYYY-MM-DD) for the week containing `date`. */
export function getMondayOfWeek(date: string): string {
  const d = new Date(date + 'T12:00:00');
  const day = d.getDay(); // 0=Sun, 1=Mon, ...
  const offset = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - offset);
  return toISODate(d);
}

/**
 * Should the weekly freeze be refilled?
 * True if freeze was used and current week's Monday is after the used week's Monday.
 */
export function shouldRefillFreeze(
  available: boolean,
  usedOn: string | null,
  today: string,
): boolean {
  if (available) return false;
  if (!usedOn) return false;
  return getMondayOfWeek(today) > getMondayOfWeek(usedOn);
}

/**
 * Should a freeze be consumed today?
 * True if freeze is available, yesterday was unlogged, and the day before yesterday
 * was active (logged or frozen) — meaning the streak would otherwise break.
 */
export function shouldConsumeFreeze(
  available: boolean,
  usedOn: string | null,
  dailyData: { date: string; calories: number }[],
  today: string,
): { consume: boolean; freezeDate: string | null } {
  if (!available) return { consume: false, freezeDate: null };
  // Already used a freeze this week
  if (usedOn && getMondayOfWeek(usedOn) === getMondayOfWeek(today)) {
    return { consume: false, freezeDate: null };
  }

  const loggedDates = new Set(
    dailyData.filter((d) => d.calories > 0).map((d) => d.date),
  );
  const frozenDates = new Set(usedOn ? [usedOn] : []);

  const todayDate = new Date(today + 'T12:00:00');

  const yesterday = new Date(todayDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toISODate(yesterday);

  const dayBefore = new Date(todayDate);
  dayBefore.setDate(dayBefore.getDate() - 2);
  const dayBeforeStr = toISODate(dayBefore);

  const yesterdayActive = loggedDates.has(yesterdayStr) || frozenDates.has(yesterdayStr);
  const dayBeforeActive = loggedDates.has(dayBeforeStr) || frozenDates.has(dayBeforeStr);

  // Consume freeze if yesterday is NOT active and day-before-yesterday WAS active
  if (!yesterdayActive && dayBeforeActive) {
    return { consume: true, freezeDate: yesterdayStr };
  }

  return { consume: false, freezeDate: null };
}
