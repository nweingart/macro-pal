import { describe, it, expect } from 'vitest';
import { calculateTDEE, calculateMacroTargets } from '../nutrition';

describe('calculateTDEE', () => {
  const baseProfile = {
    gender: 'male' as const,
    age: 30,
    height_inches: 70, // 5'10"
    weight_lbs: 170,
  };

  it('calculates sedentary TDEE', () => {
    const tdee = calculateTDEE({ ...baseProfile, activity_level: 'sedentary' });
    expect(tdee).toBeGreaterThan(1500);
    expect(tdee).toBeLessThan(2500);
  });

  it('calculates light activity TDEE', () => {
    const tdee = calculateTDEE({ ...baseProfile, activity_level: 'light' });
    const sedentary = calculateTDEE({ ...baseProfile, activity_level: 'sedentary' });
    expect(tdee).toBeGreaterThan(sedentary);
  });

  it('calculates moderate activity TDEE', () => {
    const tdee = calculateTDEE({ ...baseProfile, activity_level: 'moderate' });
    const light = calculateTDEE({ ...baseProfile, activity_level: 'light' });
    expect(tdee).toBeGreaterThan(light);
  });

  it('calculates active TDEE', () => {
    const tdee = calculateTDEE({ ...baseProfile, activity_level: 'active' });
    const moderate = calculateTDEE({ ...baseProfile, activity_level: 'moderate' });
    expect(tdee).toBeGreaterThan(moderate);
  });

  it('calculates very active TDEE', () => {
    const tdee = calculateTDEE({ ...baseProfile, activity_level: 'very_active' });
    const active = calculateTDEE({ ...baseProfile, activity_level: 'active' });
    expect(tdee).toBeGreaterThan(active);
  });

  it('produces higher BMR for males than females (same stats)', () => {
    const male = calculateTDEE({ ...baseProfile, activity_level: 'moderate' });
    const female = calculateTDEE({ ...baseProfile, gender: 'female', activity_level: 'moderate' });
    expect(male).toBeGreaterThan(female);
  });

  it('treats "other" gender same as female formula', () => {
    const other = calculateTDEE({ ...baseProfile, gender: 'other', activity_level: 'moderate' });
    const female = calculateTDEE({ ...baseProfile, gender: 'female', activity_level: 'moderate' });
    expect(other).toBe(female);
  });
});

describe('calculateMacroTargets', () => {
  const tdee = 2500;
  const weight = 170;

  it('maintains calories for maintain goal', () => {
    const targets = calculateMacroTargets(tdee, 'maintain', weight);
    expect(targets.calories).toBe(tdee);
  });

  it('creates 500 calorie deficit for lose goal', () => {
    const targets = calculateMacroTargets(tdee, 'lose', weight);
    expect(targets.calories).toBe(tdee - 500);
  });

  it('creates 300 calorie surplus for gain goal', () => {
    const targets = calculateMacroTargets(tdee, 'gain', weight);
    expect(targets.calories).toBe(tdee + 300);
  });

  it('macro calories approximately sum to target calories', () => {
    for (const goal of ['maintain', 'lose', 'gain'] as const) {
      const targets = calculateMacroTargets(tdee, goal, weight);
      const macroCals = targets.protein * 4 + targets.carbs * 4 + targets.fat * 9;
      // Allow rounding tolerance
      expect(Math.abs(macroCals - targets.calories)).toBeLessThan(15);
    }
  });

  it('sets protein based on body weight', () => {
    const targets = calculateMacroTargets(tdee, 'maintain', weight);
    // 0.9g per lb
    expect(targets.protein).toBe(Math.round(weight * 0.9));
  });
});
