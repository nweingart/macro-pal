import { User } from '@supabase/supabase-js';
import { DailyLog, DayStatus, Food, MealLogEntry, TrackingSummary } from '../types';
import { UserProfile } from '../utils/nutritionValidation';

// ── Mock User ──────────────────────────────────────────────────────

export const mockUser = {
  id: 'dev-user-000',
  email: 'dev@macropal.test',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2025-01-01T00:00:00Z',
} as User;

// ── Mock Profile ───────────────────────────────────────────────────

export const mockProfile = {
  id: 'dev-profile-000',
  user_id: 'dev-user-000',
  gender: 'male' as const,
  birthday: '1998-03-15',
  age: 28,
  height_inches: 70,
  weight_lbs: 175,
  activity_level: 'moderate' as const,
  diet_plan: 'maintain' as const,
  calorie_target: 2000,
  protein_target_g: 150,
  carbs_target_g: 200,
  fat_target_g: 65,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

export const mockUserProfile: UserProfile = {
  weight_lbs: 175,
  height_inches: 70,
  age: 28,
  gender: 'male',
  activity_level: 'moderate',
};

// ── Helper: create a zero-micronutrient Food ───────────────────────

function makeFood(
  id: string,
  name: string,
  unit: string,
  cals: number,
  protein: number,
  carbs: number,
  fat: number,
  timesUsed: number,
): Food {
  return {
    id,
    user_id: 'dev-user-000',
    name,
    serving_unit: unit,
    calories_per_serving: cals,
    protein_per_serving: protein,
    carbs_per_serving: carbs,
    fat_per_serving: fat,
    times_used: timesUsed,
    vitamin_a_mcg: 0, vitamin_b1_mg: 0, vitamin_b2_mg: 0, vitamin_b3_mg: 0,
    vitamin_b5_mg: 0, vitamin_b6_mg: 0, vitamin_b7_mcg: 0, vitamin_b9_mcg: 0,
    vitamin_b12_mcg: 0, vitamin_c_mg: 0, vitamin_d_mcg: 0, vitamin_e_mg: 0,
    vitamin_k_mcg: 0, calcium_mg: 0, iron_mg: 0, magnesium_mg: 0,
    phosphorus_mg: 0, potassium_mg: 0, sodium_mg: 0, zinc_mg: 0,
    copper_mg: 0, manganese_mg: 0, selenium_mcg: 0,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  };
}

function makeEntry(
  id: string,
  food: Food,
  servings: number,
  loggedAt: string,
): MealLogEntry {
  return {
    id,
    user_id: 'dev-user-000',
    food_library_id: food.id,
    servings,
    logged_at: loggedAt,
    created_at: loggedAt,
    food,
  };
}

// ── Foods ──────────────────────────────────────────────────────────

const eggs      = makeFood('dev-food-1', 'Scrambled Eggs',   '2 eggs',     180, 12, 2,  14, 12);
const oatmeal   = makeFood('dev-food-2', 'Oatmeal',         '1 cup',      300, 10, 54, 5,  8);
const coffee    = makeFood('dev-food-3', 'Black Coffee',     '1 cup',      5,   0,  1,  0,  20);
const chicken   = makeFood('dev-food-4', 'Grilled Chicken',  '6 oz',       280, 52, 0,  6,  15);
const rice      = makeFood('dev-food-5', 'Brown Rice',       '1 cup',      220, 5,  45, 2,  10);
const salad     = makeFood('dev-food-6', 'Mixed Salad',      '1 bowl',     150, 4,  12, 10, 6);
const salmon    = makeFood('dev-food-7', 'Baked Salmon',     '6 oz',       350, 40, 0,  20, 5);
const yogurt    = makeFood('dev-food-8', 'Greek Yogurt',     '1 cup',      130, 20, 8,  0,  9);

// ── Preset: Empty ──────────────────────────────────────────────────

const emptyDailyLog: DailyLog = {
  entries: [],
  totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
};

// ── Preset: Light (breakfast items) ────────────────────────────────

const today = new Date().toISOString();

const lightEntries: MealLogEntry[] = [
  makeEntry('dev-entry-1', eggs,    1, today),
  makeEntry('dev-entry-2', oatmeal, 1, today),
  makeEntry('dev-entry-3', coffee,  1, today),
];

const lightDailyLog: DailyLog = {
  entries: lightEntries,
  totals: {
    calories: 485,
    protein: 22,
    carbs: 57,
    fat: 19,
  },
};

// ── Preset: Full (full day of eating) ──────────────────────────────

const fullEntries: MealLogEntry[] = [
  makeEntry('dev-entry-1', eggs,    1, today),
  makeEntry('dev-entry-2', oatmeal, 1, today),
  makeEntry('dev-entry-3', coffee,  2, today),
  makeEntry('dev-entry-4', chicken, 1, today),
  makeEntry('dev-entry-5', rice,    1, today),
  makeEntry('dev-entry-6', salad,   1, today),
];

const fullDailyLog: DailyLog = {
  entries: fullEntries,
  totals: {
    calories: 1140,
    protein: 83,
    carbs: 114,
    fat: 37,
  },
};

// ── Preset: Streak values ──────────────────────────────────────────

export const streakByPreset: Record<string, {
  currentStreak: number;
  daysSinceLastLog: number;
  weeklyDayStatus: DayStatus[];
  freezeAvailable: boolean;
}> = {
  empty: {
    currentStreak: 0,
    daysSinceLastLog: Infinity,
    weeklyDayStatus: ['missed', 'missed', 'missed', 'missed', 'missed', 'future', 'future'],
    freezeAvailable: true,
  },
  light: {
    currentStreak: 2,
    daysSinceLastLog: 0,
    weeklyDayStatus: ['logged', 'frozen', 'logged', 'missed', 'future', 'future', 'future'],
    freezeAvailable: false,
  },
  full: {
    currentStreak: 7,
    daysSinceLastLog: 0,
    weeklyDayStatus: ['logged', 'logged', 'logged', 'logged', 'logged', 'future', 'future'],
    freezeAvailable: true,
  },
};

// ── Preset: Food libraries ─────────────────────────────────────────

export const foodsByPreset = {
  empty: [] as Food[],
  light: [eggs, oatmeal, coffee],
  full:  [eggs, oatmeal, coffee, chicken, rice, salad, salmon, yogurt],
} as const;

// ── Preset: Daily logs ─────────────────────────────────────────────

export const dailyLogByPreset = {
  empty: emptyDailyLog,
  light: lightDailyLog,
  full:  fullDailyLog,
} as const;

// ── Tracking Summary Generator ─────────────────────────────────────

export type DataPreset = 'empty' | 'light' | 'full';

export function getMockTrackingSummary(
  preset: DataPreset,
  startDate: string,
  endDate: string,
): TrackingSummary {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daily_data: TrackingSummary['daily_data'] = [];

  const current = new Date(start);
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    let dayData = { date: dateStr, calories: 0, protein: 0, carbs: 0, fat: 0 };

    if (preset === 'light') {
      // ~40% of days have data
      const hash = current.getDate() * 7 + current.getMonth();
      if (hash % 5 < 2) {
        dayData = {
          date: dateStr,
          calories: 1400 + (hash % 600),
          protein: 80 + (hash % 70),
          carbs: 120 + (hash % 80),
          fat: 40 + (hash % 30),
        };
      }
    } else if (preset === 'full') {
      // Every day has data
      const hash = current.getDate() * 13 + current.getMonth();
      dayData = {
        date: dateStr,
        calories: 1800 + (hash % 400),
        protein: 130 + (hash % 40),
        carbs: 180 + (hash % 40),
        fat: 55 + (hash % 20),
      };
    }

    daily_data.push(dayData);
    current.setDate(current.getDate() + 1);
  }

  const daysWithData = daily_data.filter(d => d.calories > 0);
  const days_logged = daysWithData.length;

  if (days_logged === 0) {
    return {
      start_date: startDate,
      end_date: endDate,
      days_logged: 0,
      avg_calories: 0,
      avg_protein: 0,
      avg_carbs: 0,
      avg_fat: 0,
      daily_data,
    };
  }

  return {
    start_date: startDate,
    end_date: endDate,
    days_logged,
    avg_calories: Math.round(daysWithData.reduce((s, d) => s + d.calories, 0) / days_logged),
    avg_protein: Math.round(daysWithData.reduce((s, d) => s + d.protein, 0) / days_logged),
    avg_carbs: Math.round(daysWithData.reduce((s, d) => s + d.carbs, 0) / days_logged),
    avg_fat: Math.round(daysWithData.reduce((s, d) => s + d.fat, 0) / days_logged),
    daily_data,
  };
}
