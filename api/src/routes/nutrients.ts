import { Router, RequestHandler } from 'express';
import { createClient } from '@supabase/supabase-js';
import { AuthenticatedRequest, FoodForAnalysis } from '../types';
import { analyzeMicronutrients } from '../services/ai';
import { logger } from '../logger';

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET /api/nutrients/:date - Get aggregated micronutrients for a day's food log
// Uses Sonnet on-demand for accurate micronutrient estimates (not stored per-food)
const getNutrients: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { date } = req.params;
    const userId = authReq.userId;

    // Fetch all log entries for the date with their food data
    const { data: entries, error } = await supabase
      .from('meal_log')
      .select(`
        *,
        food:food_library(*)
      `)
      .eq('user_id', userId)
      .eq('logged_at', date);

    if (error) {
      throw error;
    }

    // Build food list for AI analysis
    const foods: FoodForAnalysis[] = (entries || [])
      .filter((e) => e.food)
      .map((e) => ({
        name: e.food.name,
        servings: e.servings,
        serving_unit: e.food.serving_unit,
      }));

    // Delegate to Sonnet for accurate micronutrient estimation
    const analysis = await analyzeMicronutrients(foods);

    res.json(analysis);
  } catch (err) {
    logger.error({ err }, 'Error getting nutrients');
    res.status(400).json({ error: 'Failed to get nutrients' });
  }
};

router.get('/:date', getNutrients);

export default router;
