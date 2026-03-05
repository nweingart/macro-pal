import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  userId: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  gender: string | null;
  birthday: string | null; // ISO date string YYYY-MM-DD
  age: number | null; // Computed from birthday
  height_inches: number | null;
  weight_lbs: number | null;
  activity_level: string | null;
  diet_plan: string | null;
  calorie_target: number | null;
  protein_target_g: number | null;
  carbs_target_g: number | null;
  fat_target_g: number | null;
  created_at: string;
  updated_at: string;
}

export interface MicronutrientsPerServing {
  // Vitamins
  vitamin_a_mcg: number;
  vitamin_b1_mg: number;
  vitamin_b2_mg: number;
  vitamin_b3_mg: number;
  vitamin_b5_mg: number;
  vitamin_b6_mg: number;
  vitamin_b7_mcg: number;
  vitamin_b9_mcg: number;
  vitamin_b12_mcg: number;
  vitamin_c_mg: number;
  vitamin_d_mcg: number;
  vitamin_e_mg: number;
  vitamin_k_mcg: number;
  // Minerals
  calcium_mg: number;
  iron_mg: number;
  magnesium_mg: number;
  phosphorus_mg: number;
  potassium_mg: number;
  sodium_mg: number;
  zinc_mg: number;
  copper_mg: number;
  manganese_mg: number;
  selenium_mcg: number;
}

export interface Food {
  id: string;
  user_id: string;
  name: string;
  serving_unit: string;
  calories_per_serving: number;
  protein_per_serving: number;
  carbs_per_serving: number;
  fat_per_serving: number;
  times_used: number;
  // Micronutrients per serving
  vitamin_a_mcg: number;
  vitamin_b1_mg: number;
  vitamin_b2_mg: number;
  vitamin_b3_mg: number;
  vitamin_b5_mg: number;
  vitamin_b6_mg: number;
  vitamin_b7_mcg: number;
  vitamin_b9_mcg: number;
  vitamin_b12_mcg: number;
  vitamin_c_mg: number;
  vitamin_d_mcg: number;
  vitamin_e_mg: number;
  vitamin_k_mcg: number;
  calcium_mg: number;
  iron_mg: number;
  magnesium_mg: number;
  phosphorus_mg: number;
  potassium_mg: number;
  sodium_mg: number;
  zinc_mg: number;
  copper_mg: number;
  manganese_mg: number;
  selenium_mcg: number;
  created_at: string;
  updated_at: string;
}

export interface MealLogEntry {
  id: string;
  user_id: string;
  food_library_id: string;
  servings: number;
  logged_at: string;
  created_at: string;
  food?: Food;
}

export interface ParsedFood {
  name: string;
  servings: number;
  serving_unit: string;
  calories_per_serving: number;
  protein_per_serving: number;
  carbs_per_serving: number;
  fat_per_serving: number;
}

export interface FoodForAnalysis {
  name: string;
  servings: number;
  serving_unit: string;
}

export interface NutrientValue {
  amount: number;
  unit: string;
  percentDV: number;
}

export interface MicronutrientAnalysis {
  vitamins: {
    a: NutrientValue;
    b1: NutrientValue;
    b2: NutrientValue;
    b3: NutrientValue;
    b5: NutrientValue;
    b6: NutrientValue;
    b7: NutrientValue;
    b9: NutrientValue;
    b12: NutrientValue;
    c: NutrientValue;
    d: NutrientValue;
    e: NutrientValue;
    k: NutrientValue;
  };
  minerals: {
    calcium: NutrientValue;
    iron: NutrientValue;
    magnesium: NutrientValue;
    phosphorus: NutrientValue;
    potassium: NutrientValue;
    sodium: NutrientValue;
    zinc: NutrientValue;
    copper: NutrientValue;
    manganese: NutrientValue;
    selenium: NutrientValue;
  };
  summary: string;
}
