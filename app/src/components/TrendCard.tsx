import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface TrendCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

export function TrendCard({ title, value, subtitle, trend, color }: TrendCardProps) {
  const { colors, radius, shadows } = useTheme();
  const displayColor = color || colors.primary;
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '';
  const trendColor = trend === 'up' ? colors.success : trend === 'down' ? colors.error : colors.textSecondary;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderRadius: radius.md }, shadows.small]}>
      <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color: displayColor }]}>{value}</Text>
        {trend && (
          <Text style={[styles.trend, { color: trendColor }]}>{trendIcon}</Text>
        )}
      </View>
      {subtitle && <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>}
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
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
  },
  trend: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
  },
});
