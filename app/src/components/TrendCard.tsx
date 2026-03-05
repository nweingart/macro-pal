import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface TrendCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  /** Percent change vs previous period. Positive = up, negative = down, null = no data. */
  change?: number | null;
}

export function TrendCard({ title, value, subtitle, color, change }: TrendCardProps) {
  const { colors, radius, shadows } = useTheme();
  const displayColor = color || colors.primary;

  const hasChange = change !== undefined && change !== null && isFinite(change);
  const changePositive = hasChange && change! > 0;
  const changeNegative = hasChange && change! < 0;
  const changeColor = changePositive ? colors.success : changeNegative ? colors.error : colors.textMuted;
  const changeIcon = changePositive ? 'arrow-up' : changeNegative ? 'arrow-down' : null;
  const changeText = hasChange ? `${Math.abs(Math.round(change!))}%` : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderRadius: radius.md }, shadows.small]}>
      <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
      <Text style={[styles.value, { color: displayColor }]}>{value}</Text>
      <View style={styles.footer}>
        {subtitle && <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>}
        {hasChange && changeIcon && changeText && (
          <View style={[styles.changeBadge, { backgroundColor: changeColor + '15' }]}>
            <Ionicons name={changeIcon} size={10} color={changeColor} />
            <Text style={[styles.changeText, { color: changeColor }]}>{changeText}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  title: {
    fontSize: 13,
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  subtitle: {
    fontSize: 12,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
