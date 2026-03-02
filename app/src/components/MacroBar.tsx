import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface MacroBarProps {
  label: string;
  current: number;
  target: number;
  color: string;
  unit?: string;
}

export function MacroBar({ label, current, target, color, unit = 'g' }: MacroBarProps) {
  const { colors, spacing, radius, typography } = useTheme();
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isOver = current > target;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.value, { color: isOver ? colors.error : colors.textSecondary }]}>
          {Math.round(current)}/{target}{unit === 'kcal' ? '' : unit}
        </Text>
      </View>
      <View style={[styles.barBackground, { backgroundColor: colors.border, borderRadius: radius.xs }]}>
        <View
          style={[
            styles.barFill,
            {
              width: `${percentage}%`,
              backgroundColor: isOver ? colors.error : color,
              borderRadius: radius.xs,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
  },
  barBackground: {
    height: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
  },
});
