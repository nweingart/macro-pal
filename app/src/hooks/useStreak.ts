import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { toISODate } from '../utils/date';
import { calculateStreak, daysSinceLastLog } from '../utils/streak';
import { shouldRefillFreeze, shouldConsumeFreeze } from '../utils/freezeLogic';
import { useDevMode } from '../dev/DevModeContext';
import { DayStatus } from '../types';

interface UseStreakResult {
  currentStreak: number;
  daysSinceLastLog: number;
  weeklyDayStatus: DayStatus[];
  freezeAvailable: boolean;
  monthDaysLogged: number;
  loading: boolean;
  refresh: () => void;
}

function computeWeeklyDayStatus(
  dailyData: { date: string; calories: number }[],
  frozenDates: Set<string>,
): DayStatus[] {
  const now = new Date();
  const today = toISODate(now);
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ...
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(monday.getDate() - mondayOffset);

  const loggedSet = new Set(
    dailyData.filter((d) => d.calories > 0).map((d) => d.date),
  );

  const result: DayStatus[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(day.getDate() + i);
    const dateStr = toISODate(day);

    if (dateStr > today) {
      result.push('future');
    } else if (loggedSet.has(dateStr)) {
      result.push('logged');
    } else if (frozenDates.has(dateStr)) {
      result.push('frozen');
    } else {
      result.push('missed');
    }
  }
  return result;
}

export function useStreak(): UseStreakResult {
  const dev = useDevMode();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [daysSince, setDaysSince] = useState(0);
  const [weeklyDayStatus, setWeeklyDayStatus] = useState<DayStatus[]>([
    'missed', 'missed', 'missed', 'missed', 'missed', 'missed', 'missed',
  ]);
  const [freezeAvailable, setFreezeAvailable] = useState(true);
  const [monthDaysLogged, setMonthDaysLogged] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchStreak = useCallback(async () => {
    if (dev.enabled) {
      const { streakByPreset } = require('../dev/mockData');
      const preset = streakByPreset[dev.dataPreset];
      setCurrentStreak(preset.currentStreak);
      setDaysSince(preset.daysSinceLastLog);
      setWeeklyDayStatus([...preset.weeklyDayStatus]);
      setFreezeAvailable(preset.freezeAvailable);
      setMonthDaysLogged(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const today = toISODate(new Date());
      const start = new Date();
      start.setDate(start.getDate() - 30);
      const startDate = toISODate(start);

      const [profile, summary] = await Promise.all([
        api.getProfile(),
        api.getTrackingSummary(startDate, today),
      ]);

      let freezeAvail = profile?.streak_freeze_available ?? true;
      let freezeUsedOn = profile?.streak_freeze_used_on ?? null;

      // Refill freeze if new week
      if (shouldRefillFreeze(freezeAvail, freezeUsedOn, today)) {
        await api.refillStreakFreeze();
        freezeAvail = true;
      }

      // Consume freeze if yesterday was missed but streak was active
      const { consume, freezeDate } = shouldConsumeFreeze(
        freezeAvail,
        freezeUsedOn,
        summary.daily_data,
        today,
      );
      if (consume && freezeDate) {
        await api.consumeStreakFreeze(freezeDate);
        freezeAvail = false;
        freezeUsedOn = freezeDate;
      }

      const { currentStreak: streak, lastLoggedDate, frozenDates } =
        calculateStreak(summary.daily_data, today, freezeUsedOn);

      // Count days logged in the current calendar month
      const now = new Date();
      const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const monthLogged = summary.daily_data.filter(
        (d) => d.date.startsWith(monthPrefix) && d.calories > 0,
      ).length;

      setCurrentStreak(streak);
      setDaysSince(daysSinceLastLog(lastLoggedDate, today));
      setWeeklyDayStatus(computeWeeklyDayStatus(summary.daily_data, frozenDates));
      setFreezeAvailable(freezeAvail);
      setMonthDaysLogged(monthLogged);
    } catch (err) {
      console.error('Failed to fetch streak:', err);
    } finally {
      setLoading(false);
    }
  }, [dev.enabled, dev.dataPreset]);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  return {
    currentStreak,
    daysSinceLastLog: daysSince,
    weeklyDayStatus,
    freezeAvailable,
    monthDaysLogged,
    loading,
    refresh: fetchStreak,
  };
}
