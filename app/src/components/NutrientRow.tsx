import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { NutrientValue } from '../types';

interface Props {
  label: string;
  nutrient: NutrientValue;
  color: string;
}

export function NutrientRow({ label, nutrient, color }: Props) {
  const { colors, radius } = useTheme();
  const percentage = Math.min(nutrient.percentDV, 100);

  return (
    <View style={styles.nutrientRow}>
      <View style={styles.nutrientInfo}>
        <Text style={[styles.nutrientLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.nutrientAmount, { color: colors.textSecondary }]}>
          {nutrient.amount.toFixed(1)} {nutrient.unit}
        </Text>
      </View>
      <View style={styles.nutrientBarContainer}>
        <View style={[styles.nutrientBarBg, { backgroundColor: colors.border, borderRadius: radius.sm }]}>
          <View
            style={[
              styles.nutrientBar,
              {
                backgroundColor: color,
                width: `${percentage}%`,
                borderRadius: radius.sm,
              },
            ]}
          />
        </View>
        <Text style={[styles.nutrientPercent, { color: colors.textSecondary }]}>
          {Math.round(nutrient.percentDV)}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nutrientRow: {
    paddingVertical: 10,
  },
  nutrientInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  nutrientLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  nutrientAmount: {
    fontSize: 13,
  },
  nutrientBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nutrientBarBg: {
    flex: 1,
    height: 8,
    overflow: 'hidden',
  },
  nutrientBar: {
    height: '100%',
  },
  nutrientPercent: {
    width: 40,
    fontSize: 13,
    textAlign: 'right',
    fontWeight: '500',
  },
});
