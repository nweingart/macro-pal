import { Router, Response, RequestHandler } from 'express';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types';
import { parseFoodInput } from '../services/ai';
import { logger } from '../logger';

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const createLogSchema = z.object({
  input: z.string().min(1).max(500),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(d => !isNaN(Date.parse(d)), 'Invalid date').optional(),
});

const updateLogSchema = z.object({
  servings: z.number().positive().max(100),
});

// POST /api/log - Parse food input and create log entry
const createLogEntry: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { input, date } = createLogSchema.parse(req.body);
    const userId = authReq.userId;

    // Parse food with AI
    const parsedFood = await parseFoodInput(input);

    // Insert-first, catch unique-violation pattern (race-safe)
    let foodId: string;

    const { data: newFood, error: insertError } = await supabase
      .from('food_library')
      .insert({
        user_id: userId,
        name: parsedFood.name,
        serving_unit: parsedFood.serving_unit,
        calories_per_serving: parsedFood.calories_per_serving,
        protein_per_serving: parsedFood.protein_per_serving,
        carbs_per_serving: parsedFood.carbs_per_serving,
        fat_per_serving: parsedFood.fat_per_serving,
      })
      .select()
      .single();

    if (insertError) {
      // Unique violation (duplicate food name for this user) — fetch existing and bump times_used
      if (insertError.code === '23505') {
        const { data: existingFood, error: fetchError } = await supabase
          .from('food_library')
          .select('*')
          .eq('user_id', userId)
          .ilike('name', parsedFood.name)
          .single();

        if (fetchError || !existingFood) {
          throw new Error('Failed to find existing food after conflict');
        }

        await supabase
          .from('food_library')
          .update({ times_used: existingFood.times_used + 1 })
          .eq('id', existingFood.id);

        foodId = existingFood.id;
      } else {
        throw insertError;
      }
    } else if (!newFood) {
      throw new Error('Failed to create food');
    } else {
      foodId = newFood.id;
    }

    // Create log entry
    const { data: logEntry, error: logError } = await supabase
      .from('meal_log')
      .insert({
        user_id: userId,
        food_library_id: foodId,
        servings: parsedFood.servings,
        logged_at: date || new Date().toISOString().split('T')[0],
      })
      .select(`
        *,
        food:food_library(*)
      `)
      .single();

    if (logError) {
      throw logError;
    }

    res.json(logEntry);
  } catch (err) {
    logger.error({ err }, 'Error creating log entry');
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to create log entry' });
  }
};

// GET /api/log/:date - Get day's entries with totals
const getLogByDate: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { date } = req.params;
    const userId = authReq.userId;

    const { data: entries, error } = await supabase
      .from('meal_log')
      .select(`
        *,
        food:food_library(*)
      `)
      .eq('user_id', userId)
      .eq('logged_at', date)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    // Calculate totals
    const totals = (entries || []).reduce(
      (acc, entry) => {
        const food = entry.food;
        if (food) {
          acc.calories += food.calories_per_serving * entry.servings;
          acc.protein += food.protein_per_serving * entry.servings;
          acc.carbs += food.carbs_per_serving * entry.servings;
          acc.fat += food.fat_per_serving * entry.servings;
        }
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    res.json({
      entries: entries || [],
      totals,
    });
  } catch (err) {
    logger.error({ err }, 'Error fetching log');
    res.status(400).json({ error: 'Failed to fetch log' });
  }
};

// PATCH /api/log/:id - Update servings
const updateLogEntry: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const { servings } = updateLogSchema.parse(req.body);
    const userId = authReq.userId;

    const { data: entry, error } = await supabase
      .from('meal_log')
      .update({ servings })
      .eq('id', id)
      .eq('user_id', userId)
      .select(`
        *,
        food:food_library(*)
      `)
      .single();

    if (error) {
      throw error;
    }

    res.json(entry);
  } catch (err) {
    logger.error({ err }, 'Error updating log entry');
    res.status(400).json({ error: 'Failed to update log entry' });
  }
};

// DELETE /api/log/:id - Delete entry
const deleteLogEntry: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const userId = authReq.userId;

    const { error } = await supabase
      .from('meal_log')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, 'Error deleting log entry');
    res.status(400).json({ error: 'Failed to delete log entry' });
  }
};

router.post('/', createLogEntry);
router.get('/:date', getLogByDate);
router.patch('/:id', updateLogEntry);
router.delete('/:id', deleteLogEntry);

export default router;
