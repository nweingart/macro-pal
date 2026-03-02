import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MacroBar } from './MacroBar';
import { MacroTotals, MacroTargets } from '../types';
import { useTheme } from '../context/ThemeContext';

interface DailyTotalsProps {
  totals: MacroTotals;
  targets: MacroTargets;
}

export function DailyTotals({ totals, targets }: DailyTotalsProps) {
  const { colors, spacing, radius, shadows } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderRadius: radius.md }, shadows.small]}>
      <View style={styles.calorieHeader}>
        <Text style={[styles.calorieValue, { color: colors.text }]}>{Math.round(totals.calories)}</Text>
        <Text style={[styles.calorieLabel, { color: colors.textSecondary }]}>/ {targets.calories} kcal</Text>
      </View>
      <View style={styles.macros}>
        <MacroBar
          label="Protein"
          current={totals.protein}
          target={targets.protein}
          color={colors.protein}
        />
        <MacroBar
          label="Carbs"
          current={totals.carbs}
          target={targets.carbs}
          color={colors.carbs}
        />
        <MacroBar
          label="Fat"
          current={totals.fat}
          target={targets.fat}
          color={colors.fat}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 16,
  },
  calorieHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  calorieValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  calorieLabel: {
    fontSize: 16,
    marginLeft: 4,
  },
  macros: {
    gap: 8,
  },
});
