import { Router, RequestHandler } from 'express';
import { createClient } from '@supabase/supabase-js';
import { AuthenticatedRequest, MicronutrientAnalysis, NutrientValue } from '../types';

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Daily Values for adults (FDA reference)
const DAILY_VALUES = {
  vitamin_a_mcg: 900,
  vitamin_b1_mg: 1.2,
  vitamin_b2_mg: 1.3,
  vitamin_b3_mg: 16,
  vitamin_b5_mg: 5,
  vitamin_b6_mg: 1.7,
  vitamin_b7_mcg: 30,
  vitamin_b9_mcg: 400,
  vitamin_b12_mcg: 2.4,
  vitamin_c_mg: 90,
  vitamin_d_mcg: 20,
  vitamin_e_mg: 15,
  vitamin_k_mcg: 120,
  calcium_mg: 1300,
  iron_mg: 18,
  magnesium_mg: 420,
  phosphorus_mg: 1250,
  potassium_mg: 4700,
  sodium_mg: 2300,
  zinc_mg: 11,
  copper_mg: 0.9,
  manganese_mg: 2.3,
  selenium_mcg: 55,
};

function calculatePercentDV(amount: number, nutrientKey: keyof typeof DAILY_VALUES): number {
  const dv = DAILY_VALUES[nutrientKey];
  return Math.round((amount / dv) * 100);
}

function createNutrientValue(amount: number, unit: string, nutrientKey: keyof typeof DAILY_VALUES): NutrientValue {
  return {
    amount: Math.round(amount * 10) / 10,
    unit,
    percentDV: calculatePercentDV(amount, nutrientKey),
  };
}

// Mapping from DB column → [analysis object key, unit]
const VITAMIN_MAP: Record<string, [string, string]> = {
  vitamin_a_mcg: ['a', 'mcg'],
  vitamin_b1_mg: ['b1', 'mg'],
  vitamin_b2_mg: ['b2', 'mg'],
  vitamin_b3_mg: ['b3', 'mg'],
  vitamin_b5_mg: ['b5', 'mg'],
  vitamin_b6_mg: ['b6', 'mg'],
  vitamin_b7_mcg: ['b7', 'mcg'],
  vitamin_b9_mcg: ['b9', 'mcg'],
  vitamin_b12_mcg: ['b12', 'mcg'],
  vitamin_c_mg: ['c', 'mg'],
  vitamin_d_mcg: ['d', 'mcg'],
  vitamin_e_mg: ['e', 'mg'],
  vitamin_k_mcg: ['k', 'mcg'],
};

const MINERAL_MAP: Record<string, [string, string]> = {
  calcium_mg: ['calcium', 'mg'],
  iron_mg: ['iron', 'mg'],
  magnesium_mg: ['magnesium', 'mg'],
  phosphorus_mg: ['phosphorus', 'mg'],
  potassium_mg: ['potassium', 'mg'],
  sodium_mg: ['sodium', 'mg'],
  zinc_mg: ['zinc', 'mg'],
  copper_mg: ['copper', 'mg'],
  manganese_mg: ['manganese', 'mg'],
  selenium_mcg: ['selenium', 'mcg'],
};

function generateSummary(analysis: MicronutrientAnalysis): string {
  const goodNutrients: string[] = [];
  const lowNutrients: string[] = [];

  // Check vitamins
  const vitaminNames: Record<string, string> = {
    a: 'Vitamin A', c: 'Vitamin C', d: 'Vitamin D', b12: 'B12',
  };
  Object.entries(analysis.vitamins).forEach(([key, value]) => {
    if (vitaminNames[key]) {
      if (value.percentDV >= 80) goodNutrients.push(vitaminNames[key]);
      else if (value.percentDV < 30) lowNutrients.push(vitaminNames[key]);
    }
  });

  // Check key minerals
  const mineralNames: Record<string, string> = {
    calcium: 'Calcium', iron: 'Iron', magnesium: 'Magnesium', potassium: 'Potassium',
  };
  Object.entries(analysis.minerals).forEach(([key, value]) => {
    if (mineralNames[key]) {
      if (value.percentDV >= 80) goodNutrients.push(mineralNames[key]);
      else if (value.percentDV < 30) lowNutrients.push(mineralNames[key]);
    }
  });

  if (goodNutrients.length === 0 && lowNutrients.length === 0) {
    return 'Your nutrient intake is moderate across the board. Consider adding more variety to your meals.';
  }

  const parts: string[] = [];
  if (goodNutrients.length > 0) {
    parts.push(`Good intake of ${goodNutrients.slice(0, 3).join(', ')}`);
  }
  if (lowNutrients.length > 0) {
    parts.push(`Consider adding foods rich in ${lowNutrients.slice(0, 3).join(', ')}`);
  }
  return parts.join('. ') + '.';
}

// GET /api/nutrients/:date - Get aggregated micronutrients for a day's food log
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

    // Aggregate micronutrients from stored data
    const nutrientKeys = Object.keys(DAILY_VALUES) as (keyof typeof DAILY_VALUES)[];
    const totals: Record<string, number> = {};
    for (const key of nutrientKeys) {
      totals[key] = 0;
    }

    (entries || []).forEach(entry => {
      const food = entry.food;
      if (!food) return;

      const servings = entry.servings || 1;
      for (const key of nutrientKeys) {
        totals[key] += (food[key] || 0) * servings;
      }
    });

    // Build vitamins and minerals objects from mapping configs
    const vitamins: Record<string, NutrientValue> = {};
    for (const [dbKey, [analysisKey, unit]] of Object.entries(VITAMIN_MAP)) {
      vitamins[analysisKey] = createNutrientValue(totals[dbKey], unit, dbKey as keyof typeof DAILY_VALUES);
    }

    const minerals: Record<string, NutrientValue> = {};
    for (const [dbKey, [analysisKey, unit]] of Object.entries(MINERAL_MAP)) {
      minerals[analysisKey] = createNutrientValue(totals[dbKey], unit, dbKey as keyof typeof DAILY_VALUES);
    }

    const analysis: MicronutrientAnalysis = {
      vitamins: vitamins as MicronutrientAnalysis['vitamins'],
      minerals: minerals as MicronutrientAnalysis['minerals'],
      summary: '',
    };

    // Generate summary based on aggregated data
    if ((entries || []).length === 0) {
      analysis.summary = 'No foods logged yet today.';
    } else {
      analysis.summary = generateSummary(analysis);
    }

    res.json(analysis);
  } catch (err) {
    console.error('Error getting nutrients:', err);
    res.status(400).json({ error: 'Failed to get nutrients' });
  }
};

router.get('/:date', getNutrients);

export default router;
