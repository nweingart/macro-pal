import { Router, RequestHandler } from 'express';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types';
import { logger } from '../logger';

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const summaryQuerySchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// GET /api/tracking/summary - Get tracking summary for date range
const getTrackingSummary: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { start_date, end_date } = summaryQuerySchema.parse(req.query);
    const userId = authReq.userId;

    // Fetch all log entries in the date range with their food data
    const { data: entries, error } = await supabase
      .from('meal_log')
      .select(`
        *,
        food:food_library(*)
      `)
      .eq('user_id', userId)
      .gte('logged_at', start_date)
      .lte('logged_at', end_date)
      .order('logged_at', { ascending: true });

    if (error) {
      throw error;
    }

    // Group entries by date and calculate daily totals
    const dailyDataMap = new Map<string, { calories: number; protein: number; carbs: number; fat: number }>();

    // Initialize all dates in range with zero values
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dailyDataMap.set(dateStr, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    }

    // Aggregate entries by date
    (entries || []).forEach((entry) => {
      const food = entry.food;
      if (food && entry.logged_at) {
        const existing = dailyDataMap.get(entry.logged_at) || { calories: 0, protein: 0, carbs: 0, fat: 0 };
        existing.calories += food.calories_per_serving * entry.servings;
        existing.protein += food.protein_per_serving * entry.servings;
        existing.carbs += food.carbs_per_serving * entry.servings;
        existing.fat += food.fat_per_serving * entry.servings;
        dailyDataMap.set(entry.logged_at, existing);
      }
    });

    // Convert to array
    const daily_data = Array.from(dailyDataMap.entries()).map(([date, totals]) => ({
      date,
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein),
      carbs: Math.round(totals.carbs),
      fat: Math.round(totals.fat),
    }));

    // Calculate averages (only for days with data)
    const daysWithData = daily_data.filter(d => d.calories > 0);
    const days_logged = daysWithData.length;

    let avg_calories = 0;
    let avg_protein = 0;
    let avg_carbs = 0;
    let avg_fat = 0;

    if (days_logged > 0) {
      avg_calories = daysWithData.reduce((sum, d) => sum + d.calories, 0) / days_logged;
      avg_protein = daysWithData.reduce((sum, d) => sum + d.protein, 0) / days_logged;
      avg_carbs = daysWithData.reduce((sum, d) => sum + d.carbs, 0) / days_logged;
      avg_fat = daysWithData.reduce((sum, d) => sum + d.fat, 0) / days_logged;
    }

    res.json({
      start_date,
      end_date,
      days_logged,
      avg_calories: Math.round(avg_calories),
      avg_protein: Math.round(avg_protein),
      avg_carbs: Math.round(avg_carbs),
      avg_fat: Math.round(avg_fat),
      daily_data,
    });
  } catch (err) {
    logger.error({ err }, 'Error fetching tracking summary');
    res.status(400).json({ error: 'Failed to fetch tracking summary' });
  }
};

router.get('/summary', getTrackingSummary);

export default router;
