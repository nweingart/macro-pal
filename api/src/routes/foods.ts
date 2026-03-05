import { Router, RequestHandler } from 'express';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types';
import { logger } from '../logger';

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const updateFoodSchema = z.object({
  name: z.string().min(1).optional(),
  serving_unit: z.string().min(1).optional(),
  calories_per_serving: z.number().nonnegative().optional(),
  protein_per_serving: z.number().nonnegative().optional(),
  carbs_per_serving: z.number().nonnegative().optional(),
  fat_per_serving: z.number().nonnegative().optional(),
});

// GET /api/foods - List user's food library
const getFoods: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId;

    const { data: foods, error } = await supabase
      .from('food_library')
      .select('*')
      .eq('user_id', userId)
      .order('times_used', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(foods || []);
  } catch (err) {
    logger.error({ err }, 'Error fetching foods');
    res.status(400).json({ error: 'Failed to fetch foods' });
  }
};

// PATCH /api/foods/:id - Update food macros
const updateFood: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const updates = updateFoodSchema.parse(req.body);
    const userId = authReq.userId;

    const { data: food, error } = await supabase
      .from('food_library')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json(food);
  } catch (err) {
    logger.error({ err }, 'Error updating food');
    res.status(400).json({ error: 'Failed to update food' });
  }
};

// DELETE /api/foods/:id - Delete food
const deleteFood: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const userId = authReq.userId;

    // First, delete all log entries referencing this food
    await supabase
      .from('meal_log')
      .delete()
      .eq('food_library_id', id)
      .eq('user_id', userId);

    // Then delete the food
    const { error } = await supabase
      .from('food_library')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, 'Error deleting food');
    res.status(400).json({ error: 'Failed to delete food' });
  }
};

router.get('/', getFoods);
router.patch('/:id', updateFood);
router.delete('/:id', deleteFood);

export default router;
