import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { DailyLog, MealLogEntry } from '../types';
import { useDevMode } from '../dev/DevModeContext';

export function useMealLog(date: string) {
  const dev = useDevMode();
  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLog = useCallback(async () => {
    if (dev.enabled) {
      const { dailyLogByPreset } = require('../dev/mockData');
      setDailyLog(dailyLogByPreset[dev.dataPreset]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.getLogByDate(date);
      setDailyLog(data);
    } catch (err: any) {
      // Ignore 401 errors (user logged out or deleted)
      if (err?.response?.status !== 401) {
        setError(err instanceof Error ? err.message : 'Failed to fetch log');
      }
    } finally {
      setLoading(false);
    }
  }, [date, dev.enabled, dev.dataPreset]);

  useEffect(() => {
    fetchLog();
  }, [fetchLog]);

  const addEntry = async (input: string): Promise<MealLogEntry | null> => {
    if (dev.enabled) {
      // Mock: create a fake entry and append it locally
      const fakeEntry: MealLogEntry = {
        id: `dev-entry-${Date.now()}`,
        user_id: 'dev-user-000',
        food_library_id: 'dev-food-new',
        servings: 1,
        logged_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      setDailyLog((prev) => prev ? {
        entries: [...prev.entries, fakeEntry],
        totals: prev.totals,
      } : prev);
      return fakeEntry;
    }

    try {
      setError(null);
      const entry = await api.createLogEntry(input);
      await fetchLog();
      return entry;
    } catch (err: any) {
      // Ignore 401 errors (user logged out or deleted)
      if (err?.response?.status !== 401) {
        setError(err instanceof Error ? err.message : 'Failed to add entry');
      }
      return null;
    }
  };

  const updateServings = async (id: string, servings: number): Promise<boolean> => {
    if (dev.enabled) return true;

    try {
      setError(null);
      await api.updateLogEntry(id, servings);
      await fetchLog();
      return true;
    } catch (err: any) {
      // Ignore 401 errors (user logged out or deleted)
      if (err?.response?.status !== 401) {
        setError(err instanceof Error ? err.message : 'Failed to update entry');
      }
      return false;
    }
  };

  const deleteEntry = async (id: string): Promise<boolean> => {
    if (dev.enabled) {
      setDailyLog((prev) => prev ? {
        entries: prev.entries.filter((e) => e.id !== id),
        totals: prev.totals,
      } : prev);
      return true;
    }

    try {
      setError(null);
      await api.deleteLogEntry(id);
      await fetchLog();
      return true;
    } catch (err: any) {
      // Ignore 401 errors (user logged out or deleted)
      if (err?.response?.status !== 401) {
        setError(err instanceof Error ? err.message : 'Failed to delete entry');
      }
      return false;
    }
  };

  return {
    dailyLog,
    loading,
    error,
    refresh: fetchLog,
    addEntry,
    updateServings,
    deleteEntry,
  };
}
