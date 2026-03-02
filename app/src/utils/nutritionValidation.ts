/**
 * Nutrition Validation System
 *
 * Provides personalized safety limits for macro targets based on user profile.
 * Shows warnings for unusual values and blocks truly dangerous extremes.
 */

export type ValidationLevel = 'ok' | 'warning' | 'danger';

export interface ValidationResult {
  level: ValidationLevel;
  message?: string;
}

export interface MacroValidationResults {
  calories: ValidationResult;
  protein: ValidationResult;
  carbs: ValidationResult;
  fat: ValidationResult;
  overall: ValidationResult;
}

export interface UserProfile {
  weight_lbs: number | null;
  height_inches: number | null;
  age: number | null;
  gender: 'male' | 'female' | 'other' | null;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null;
}

// Absolute hard limits - these apply to everyone regardless of profile
const ABSOLUTE_LIMITS = {
  calories: { min: 800, max: 6000 },
  protein: { min: 20, max: 400 },    // grams
  carbs: { min: 0, max: 700 },       // grams (0 for keto)
  fat: { min: 15, max: 400 },        // grams
};

// Activity level multipliers for TDEE calculation
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// Default profile for when user data is incomplete
const DEFAULT_PROFILE: Required<UserProfile> = {
  weight_lbs: 160,
  height_inches: 67, // 5'7"
  age: 30,
  gender: 'other',
  activity_level: 'moderate',
};

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor equation
 */
function calculateBMR(profile: Required<UserProfile>): number {
  const weightKg = profile.weight_lbs * 0.453592;
  const heightCm = profile.height_inches * 2.54;

  // Mifflin-St Jeor equation
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * profile.age;

  if (profile.gender === 'male') {
    bmr += 5;
  } else if (profile.gender === 'female') {
    bmr -= 161;
  } else {
    bmr -= 78; // Average for 'other'
  }

  return Math.round(bmr);
}

/**
 * Calculate Total Daily Energy Expenditure
 */
function calculateTDEE(profile: Required<UserProfile>): number {
  const bmr = calculateBMR(profile);
  const multiplier = ACTIVITY_MULTIPLIERS[profile.activity_level];
  return Math.round(bmr * multiplier);
}

/**
 * Fill in missing profile data with defaults
 */
function normalizeProfile(profile: UserProfile): Required<UserProfile> {
  return {
    weight_lbs: profile.weight_lbs ?? DEFAULT_PROFILE.weight_lbs,
    height_inches: profile.height_inches ?? DEFAULT_PROFILE.height_inches,
    age: profile.age ?? DEFAULT_PROFILE.age,
    gender: profile.gender ?? DEFAULT_PROFILE.gender,
    activity_level: profile.activity_level ?? DEFAULT_PROFILE.activity_level,
  };
}

/**
 * Get personalized limits based on user profile
 */
export function getPersonalizedLimits(profile: UserProfile) {
  const normalized = normalizeProfile(profile);
  const bmr = calculateBMR(normalized);
  const tdee = calculateTDEE(normalized);
  const weightLbs = normalized.weight_lbs;

  return {
    calories: {
      dangerMin: Math.max(ABSOLUTE_LIMITS.calories.min, Math.round(bmr * 0.7)),
      warningMin: Math.round(bmr * 0.9),
      warningMax: Math.round(tdee + 1000),
      dangerMax: Math.min(ABSOLUTE_LIMITS.calories.max, Math.round(tdee + 2000)),
    },
    protein: {
      // Based on grams per pound of body weight
      dangerMin: Math.max(ABSOLUTE_LIMITS.protein.min, Math.round(weightLbs * 0.3)),
      warningMin: Math.round(weightLbs * 0.5),
      warningMax: Math.round(weightLbs * 1.5),
      dangerMax: Math.min(ABSOLUTE_LIMITS.protein.max, Math.round(weightLbs * 2.2)),
    },
    carbs: {
      dangerMin: ABSOLUTE_LIMITS.carbs.min, // 0 for keto support
      warningMin: 20, // Strict keto threshold
      warningMax: Math.round((tdee * 0.65) / 4), // 65% of TDEE from carbs
      dangerMax: ABSOLUTE_LIMITS.carbs.max,
    },
    fat: {
      dangerMin: Math.max(ABSOLUTE_LIMITS.fat.min, Math.round(weightLbs * 0.2)),
      warningMin: Math.round(weightLbs * 0.3),
      warningMax: Math.round(weightLbs * 1.2),
      dangerMax: Math.min(ABSOLUTE_LIMITS.fat.max, Math.round(weightLbs * 1.8)),
    },
    // Include calculated values for reference
    bmr,
    tdee,
  };
}

/**
 * Validate a single macro value
 */
function validateValue(
  value: number,
  limits: { dangerMin: number; warningMin: number; warningMax: number; dangerMax: number },
  labels: { tooLow: string; lowWarning: string; highWarning: string; tooHigh: string }
): ValidationResult {
  if (value < limits.dangerMin) {
    return { level: 'danger', message: labels.tooLow };
  }
  if (value < limits.warningMin) {
    return { level: 'warning', message: labels.lowWarning };
  }
  if (value > limits.dangerMax) {
    return { level: 'danger', message: labels.tooHigh };
  }
  if (value > limits.warningMax) {
    return { level: 'warning', message: labels.highWarning };
  }
  return { level: 'ok' };
}

/**
 * Validate all macro targets
 */
export function validateMacros(
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  profile: UserProfile
): MacroValidationResults {
  const limits = getPersonalizedLimits(profile);

  const caloriesResult = validateValue(calories, limits.calories, {
    tooLow: `Dangerously low. Eating below ${limits.calories.dangerMin} kcal can cause serious health issues including muscle loss, nutrient deficiencies, and metabolic damage.`,
    lowWarning: `This is quite low. Consider whether ${calories} kcal is sustainable. Your estimated BMR is ${limits.bmr} kcal.`,
    highWarning: `This is quite high. Make sure ${calories} kcal aligns with your activity level and goals.`,
    tooHigh: `Extremely high calorie target. ${calories} kcal is well above typical needs and may indicate an error.`,
  });

  const proteinResult = validateValue(protein, limits.protein, {
    tooLow: `Dangerously low protein. Less than ${limits.protein.dangerMin}g can lead to muscle wasting and weakened immunity.`,
    lowWarning: `Protein may be too low. ${protein}g might not support your body's needs.`,
    highWarning: `Very high protein. ${protein}g is above typical recommendations and may stress kidneys over time.`,
    tooHigh: `Extremely high protein. ${protein}g could be harmful to kidney function. Please reconsider.`,
  });

  const carbsResult = validateValue(carbs, limits.carbs, {
    tooLow: 'No carbs at all? Even strict keto includes some carbs from vegetables.',
    lowWarning: `Very low carbs (${carbs}g). This is fine for keto but may affect energy and mood initially.`,
    highWarning: `High carb intake. ${carbs}g is significant - ensure these come from quality sources.`,
    tooHigh: `Extremely high carbs. ${carbs}g is unusual and may indicate an error.`,
  });

  const fatResult = validateValue(fat, limits.fat, {
    tooLow: `Dangerously low fat. Your body needs at least ${limits.fat.dangerMin}g for hormone production and nutrient absorption.`,
    lowWarning: `Fat may be too low. ${fat}g might not support hormone health.`,
    highWarning: `High fat intake. ${fat}g is significant - prioritize healthy fat sources.`,
    tooHigh: `Extremely high fat. ${fat}g could lead to health issues. Please reconsider.`,
  });

  // Calculate overall result - worst of all validations
  const results = [caloriesResult, proteinResult, carbsResult, fatResult];
  const hasDanger = results.some(r => r.level === 'danger');
  const hasWarning = results.some(r => r.level === 'warning');

  let overall: ValidationResult;
  if (hasDanger) {
    const dangerMessages = results.filter(r => r.level === 'danger').map(r => r.message);
    overall = {
      level: 'danger',
      message: `Cannot save: ${dangerMessages.length} dangerous value(s) detected.`,
    };
  } else if (hasWarning) {
    const warningCount = results.filter(r => r.level === 'warning').length;
    overall = {
      level: 'warning',
      message: `${warningCount} value(s) outside typical ranges. Review before saving.`,
    };
  } else {
    overall = { level: 'ok' };
  }

  return {
    calories: caloriesResult,
    protein: proteinResult,
    carbs: carbsResult,
    fat: fatResult,
    overall,
  };
}

/**
 * Check if profile has enough data for personalized validation
 */
export function hasCompleteProfile(profile: UserProfile): boolean {
  return !!(
    profile.weight_lbs &&
    profile.height_inches &&
    profile.age &&
    profile.gender &&
    profile.activity_level
  );
}

/**
 * Get a summary of missing profile fields
 */
export function getMissingProfileFields(profile: UserProfile): string[] {
  const missing: string[] = [];
  if (!profile.weight_lbs) missing.push('weight');
  if (!profile.height_inches) missing.push('height');
  if (!profile.age) missing.push('age');
  if (!profile.gender) missing.push('gender');
  if (!profile.activity_level) missing.push('activity level');
  return missing;
}

export type MacroType = 'protein' | 'carbs' | 'fat';

export interface QuickFixSuggestion {
  macro: MacroType;
  currentValue: number;
  suggestedValue: number;
  action: 'increase' | 'decrease';
  label: string;
}

/**
 * Get a suggested quick fix for a macro that's outside healthy limits.
 * Returns the macro to adjust, the suggested value, and a user-friendly label.
 */
export function getQuickFixSuggestion(
  macro: MacroType,
  currentValue: number,
  profile: UserProfile
): QuickFixSuggestion | null {
  const limits = getPersonalizedLimits(profile);
  const macroLimits = limits[macro];

  // Check if value is too low
  if (currentValue < macroLimits.warningMin) {
    const suggestedValue = macroLimits.warningMin;
    const macroLabel = macro.charAt(0).toUpperCase() + macro.slice(1);
    return {
      macro,
      currentValue,
      suggestedValue,
      action: 'increase',
      label: `Increase ${macroLabel.toLowerCase()} to ${suggestedValue}g?`,
    };
  }

  // Check if value is too high
  if (currentValue > macroLimits.warningMax) {
    const suggestedValue = macroLimits.warningMax;
    const macroLabel = macro.charAt(0).toUpperCase() + macro.slice(1);
    return {
      macro,
      currentValue,
      suggestedValue,
      action: 'decrease',
      label: `Decrease ${macroLabel.toLowerCase()} to ${suggestedValue}g?`,
    };
  }

  return null;
}
