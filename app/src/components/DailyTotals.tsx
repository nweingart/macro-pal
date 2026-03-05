import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MacroBar } from './MacroBar';
import { MacroTotals, MacroTargets } from '../types';
import { useTheme } from '../context/ThemeContext';

interface DailyTotalsProps {
  totals: MacroTotals;
  targets: MacroTargets;
  onViewMicronutrients?: () => void;
}

export function DailyTotals({ totals, targets, onViewMicronutrients }: DailyTotalsProps) {
  const { colors, spacing, radius, shadows } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderRadius: radius.md }, shadows.small]}>
      <View style={styles.calorieHeader}>
        <Text style={[styles.calorieValue, { color: colors.text }]}>{Math.round(totals.calories).toLocaleString()}</Text>
        <Text style={[styles.calorieLabel, { color: colors.textSecondary }]}>/ {targets.calories.toLocaleString()} kcal</Text>
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
      {onViewMicronutrients && (
        <>
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
          <TouchableOpacity style={styles.microLink} onPress={onViewMicronutrients} accessibilityLabel="View micronutrients" accessibilityRole="button">
            <Text style={[styles.microLinkText, { color: colors.primary }]}>View micronutrients</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </>
      )}
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
  separator: {
    height: 1,
    marginTop: 14,
    marginBottom: 10,
  },
  microLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  microLinkText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
