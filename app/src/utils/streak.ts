import { toISODate } from './date';

interface DailyDataEntry {
  date: string;
  calories: number;
}

interface StreakResult {
  currentStreak: number;
  lastLoggedDate: string | null;
  frozenDates: Set<string>;
}

/**
 * Walk backward from `today` through daily_data to compute the current
 * consecutive-day logging streak. Frozen days count toward the streak.
 */
export function calculateStreak(
  dailyData: DailyDataEntry[],
  today: string,
  freezeUsedOn: string | null = null,
): StreakResult {
  const loggedDates = new Set(
    dailyData.filter((d) => d.calories > 0).map((d) => d.date),
  );

  const frozenDates = new Set<string>();
  if (freezeUsedOn) frozenDates.add(freezeUsedOn);

  let streak = 0;
  let lastLoggedDate: string | null = null;

  // Find the most recent logged date
  const sorted = [...loggedDates].sort().reverse();
  if (sorted.length > 0) {
    lastLoggedDate = sorted[0];
  }

  // Walk backward from today (or yesterday if today has no log yet and not frozen)
  const startDate = new Date(today + 'T12:00:00');
  const cursor = new Date(startDate);

  if (!loggedDates.has(today) && !frozenDates.has(today)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const dateStr = toISODate(cursor);
    if (loggedDates.has(dateStr) || frozenDates.has(dateStr)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return { currentStreak: streak, lastLoggedDate, frozenDates };
}

/**
 * Return the number of full days since the last logged date.
 * Returns Infinity if no date is provided.
 */
export function daysSinceLastLog(
  lastLoggedDate: string | null,
  today: string,
): number {
  if (!lastLoggedDate) return Infinity;
  const last = new Date(lastLoggedDate + 'T12:00:00');
  const now = new Date(today + 'T12:00:00');
  return Math.round((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
}
