import { Router, RequestHandler } from 'express';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types';
import { calculateTDEE, calculateMacroTargets } from '../services/nutrition';

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const updateProfileSchema = z.object({
  gender: z.enum(['male', 'female', 'other']).nullable().optional(),
  birthday: z.string().nullable().optional(), // ISO date string YYYY-MM-DD
  height_inches: z.number().positive().nullable().optional(),
  weight_lbs: z.number().positive().nullable().optional(),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']).nullable().optional(),
  diet_plan: z.enum(['maintain', 'lose', 'gain']).nullable().optional(),
  calorie_target: z.number().positive().nullable().optional(),
  protein_target_g: z.number().nonnegative().nullable().optional(),
  carbs_target_g: z.number().nonnegative().nullable().optional(),
  fat_target_g: z.number().nonnegative().nullable().optional(),
});

// Calculate age from birthday
function calculateAgeFromBirthday(birthday: string | null): number | null {
  if (!birthday) return null;
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// GET /api/profile - Get user profile
const getProfile: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId;

    const { data: profile, error } = await supabase
      .from('user_profile')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // Calculate age from birthday if available
    if (profile && profile.birthday) {
      profile.age = calculateAgeFromBirthday(profile.birthday);
    }

    res.json(profile);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(400).json({ error: 'Failed to fetch profile' });
  }
};

// PUT /api/profile - Update profile + targets
const updateProfile: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId;
    const updates = updateProfileSchema.parse(req.body);

    // Check if profile exists
    const { data: existing } = await supabase
      .from('user_profile')
      .select('id')
      .eq('user_id', userId)
      .single();

    // Calculate age from birthday if provided
    const age = updates.birthday ? calculateAgeFromBirthday(updates.birthday) : null;

    // Calculate TDEE and macro targets if we have all the data
    let calculatedTargets: {
      calorie_target?: number;
      protein_target_g?: number;
      carbs_target_g?: number;
      fat_target_g?: number;
    } = {};

    if (
      updates.gender &&
      age &&
      updates.height_inches &&
      updates.weight_lbs &&
      updates.activity_level &&
      updates.diet_plan &&
      // Only auto-calculate if user hasn't set custom targets
      !updates.calorie_target
    ) {
      const tdee = calculateTDEE({
        gender: updates.gender as 'male' | 'female' | 'other',
        age,
        height_inches: updates.height_inches,
        weight_lbs: updates.weight_lbs,
        activity_level: updates.activity_level as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
      });

      const macros = calculateMacroTargets(
        tdee,
        updates.diet_plan as 'maintain' | 'lose' | 'gain',
        updates.weight_lbs
      );

      calculatedTargets = {
        calorie_target: macros.calories,
        protein_target_g: macros.protein,
        carbs_target_g: macros.carbs,
        fat_target_g: macros.fat,
      };
    }

    const profileData = {
      ...updates,
      ...calculatedTargets,
      updated_at: new Date().toISOString(),
    };

    let profile;
    if (existing) {
      const { data, error } = await supabase
        .from('user_profile')
        .update(profileData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      profile = data;
    } else {
      const { data, error } = await supabase
        .from('user_profile')
        .insert({ user_id: userId, ...profileData })
        .select()
        .single();

      if (error) throw error;
      profile = data;
    }

    res.json(profile);
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(400).json({ error: 'Failed to update profile' });
  }
};

// GET /api/tracking/summary - Get trends/stats for date range
const getTrackingSummary: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId;
    const startDate = req.query.start_date as string;
    const endDate = req.query.end_date as string;

    if (!startDate || !endDate) {
      res.status(400).json({ error: 'start_date and end_date are required' });
      return;
    }

    const { data: entries, error } = await supabase
      .from('meal_log')
      .select(`
        *,
        food:food_library(*)
      `)
      .eq('user_id', userId)
      .gte('logged_at', startDate)
      .lte('logged_at', endDate)
      .order('logged_at', { ascending: true });

    if (error) {
      throw error;
    }

    // Group by date and calculate daily totals
    const dailyData: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {};

    (entries || []).forEach((entry) => {
      const date = entry.logged_at;
      if (!dailyData[date]) {
        dailyData[date] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      }
      const food = entry.food;
      if (food) {
        dailyData[date].calories += food.calories_per_serving * entry.servings;
        dailyData[date].protein += food.protein_per_serving * entry.servings;
        dailyData[date].carbs += food.carbs_per_serving * entry.servings;
        dailyData[date].fat += food.fat_per_serving * entry.servings;
      }
    });

    const dailyDataArray = Object.entries(dailyData).map(([date, data]) => ({
      date,
      ...data,
    }));

    const daysLogged = dailyDataArray.length;
    const avgCalories = daysLogged > 0 ? dailyDataArray.reduce((sum, d) => sum + d.calories, 0) / daysLogged : 0;
    const avgProtein = daysLogged > 0 ? dailyDataArray.reduce((sum, d) => sum + d.protein, 0) / daysLogged : 0;
    const avgCarbs = daysLogged > 0 ? dailyDataArray.reduce((sum, d) => sum + d.carbs, 0) / daysLogged : 0;
    const avgFat = daysLogged > 0 ? dailyDataArray.reduce((sum, d) => sum + d.fat, 0) / daysLogged : 0;

    res.json({
      start_date: startDate,
      end_date: endDate,
      days_logged: daysLogged,
      avg_calories: avgCalories,
      avg_protein: avgProtein,
      avg_carbs: avgCarbs,
      avg_fat: avgFat,
      daily_data: dailyDataArray,
    });
  } catch (err) {
    console.error('Error fetching tracking summary:', err);
    res.status(400).json({ error: 'Failed to fetch tracking summary' });
  }
};

// DELETE /api/profile/account - Delete user account and all data (atomic)
const deleteAccount: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId;

    // Single transactional RPC — all-or-nothing deletion
    const { error } = await supabase.rpc('delete_user_account', {
      target_user_id: userId,
    });

    if (error) {
      console.error('Error deleting account via RPC:', error);
      throw new Error('Failed to delete account');
    }

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Error deleting account:', err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};

router.get('/', getProfile);
router.put('/', updateProfile);
router.get('/tracking/summary', getTrackingSummary);
router.delete('/account', deleteAccount);

export default router;
