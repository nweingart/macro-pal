import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { DailyLog, MealLogEntry } from '../types';

export function useMealLog(date: string) {
  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLog = useCallback(async () => {
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
  }, [date]);

  useEffect(() => {
    fetchLog();
  }, [fetchLog]);

  const addEntry = async (input: string): Promise<MealLogEntry | null> => {
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
