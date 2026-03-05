import { Food, MealLogEntry, MicronutrientAnalysis, NutrientValue } from '../types';

// Daily Values for adults (FDA reference) — mirrors api/src/routes/nutrients.ts
export const DAILY_VALUES = {
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
} as const;

export const VITAMIN_LABELS: Record<string, string> = {
  a: 'Vitamin A',
  b1: 'Vitamin B1 (Thiamin)',
  b2: 'Vitamin B2 (Riboflavin)',
  b3: 'Vitamin B3 (Niacin)',
  b5: 'Vitamin B5 (Pantothenic)',
  b6: 'Vitamin B6',
  b7: 'Vitamin B7 (Biotin)',
  b9: 'Vitamin B9 (Folate)',
  b12: 'Vitamin B12',
  c: 'Vitamin C',
  d: 'Vitamin D',
  e: 'Vitamin E',
  k: 'Vitamin K',
};

export const MINERAL_LABELS: Record<string, string> = {
  calcium: 'Calcium',
  iron: 'Iron',
  magnesium: 'Magnesium',
  phosphorus: 'Phosphorus',
  potassium: 'Potassium',
  sodium: 'Sodium',
  zinc: 'Zinc',
  copper: 'Copper',
  manganese: 'Manganese',
  selenium: 'Selenium',
};

// Maps Food field names → [analysis key, unit]
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

type DVKey = keyof typeof DAILY_VALUES;

function createNutrientValue(amount: number, unit: string, nutrientKey: DVKey): NutrientValue {
  const dv = DAILY_VALUES[nutrientKey];
  return {
    amount: Math.round(amount * 10) / 10,
    unit,
    percentDV: Math.round((amount / dv) * 100),
  };
}

function buildAnalysis(totals: Record<string, number>): MicronutrientAnalysis {
  const vitamins: Record<string, NutrientValue> = {};
  for (const [dbKey, [analysisKey, unit]] of Object.entries(VITAMIN_MAP)) {
    vitamins[analysisKey] = createNutrientValue(totals[dbKey] || 0, unit, dbKey as DVKey);
  }

  const minerals: Record<string, NutrientValue> = {};
  for (const [dbKey, [analysisKey, unit]] of Object.entries(MINERAL_MAP)) {
    minerals[analysisKey] = createNutrientValue(totals[dbKey] || 0, unit, dbKey as DVKey);
  }

  return {
    vitamins: vitamins as MicronutrientAnalysis['vitamins'],
    minerals: minerals as MicronutrientAnalysis['minerals'],
    summary: '',
  };
}

/** Compute micronutrient analysis for a single food item * servings */
export function computeFoodMicronutrients(food: Food, servings: number): MicronutrientAnalysis {
  const nutrientKeys = Object.keys(DAILY_VALUES) as DVKey[];
  const totals: Record<string, number> = {};
  for (const key of nutrientKeys) {
    totals[key] = (food[key] || 0) * servings;
  }
  return buildAnalysis(totals);
}

/** Compute aggregated micronutrient analysis across all entries for a day */
export function computeDailyMicronutrients(entries: MealLogEntry[]): MicronutrientAnalysis {
  const nutrientKeys = Object.keys(DAILY_VALUES) as DVKey[];
  const totals: Record<string, number> = {};
  for (const key of nutrientKeys) {
    totals[key] = 0;
  }

  for (const entry of entries) {
    const food = entry.food;
    if (!food) continue;
    const servings = entry.servings || 1;
    for (const key of nutrientKeys) {
      totals[key] += (food[key] || 0) * servings;
    }
  }

  return buildAnalysis(totals);
}
