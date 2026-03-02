import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Food } from '../types';

export function useFoodLibrary() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFoods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getFoods();
      setFoods(data);
    } catch (err: any) {
      if (err?.response?.status !== 401) {
        setError(err instanceof Error ? err.message : 'Failed to fetch foods');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  const updateFood = async (id: string, updates: Partial<Food>): Promise<boolean> => {
    try {
      setError(null);
      await api.updateFood(id, updates);
      await fetchFoods();
      return true;
    } catch (err: any) {
      if (err?.response?.status !== 401) {
        setError(err instanceof Error ? err.message : 'Failed to update food');
      }
      return false;
    }
  };

  const deleteFood = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await api.deleteFood(id);
      await fetchFoods();
      return true;
    } catch (err: any) {
      if (err?.response?.status !== 401) {
        setError(err instanceof Error ? err.message : 'Failed to delete food');
      }
      return false;
    }
  };

  return {
    foods,
    loading,
    error,
    refresh: fetchFoods,
    updateFood,
    deleteFood,
  };
}
