import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Mascot } from './Mascot';

type MascotMood = 'happy' | 'excited' | 'thinking' | 'celebrating' | 'sleepy';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  showMascot?: boolean;
  mascotMood?: MascotMood;
}

export function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  showMascot = false,
  mascotMood = 'thinking',
}: EmptyStateProps) {
  const { colors, radius } = useTheme();

  return (
    <View style={styles.container}>
      {showMascot ? (
        <View style={styles.mascotContainer}>
          <Mascot size={100} mood={mascotMood} />
        </View>
      ) : icon ? (
        <View style={[styles.iconContainer, { backgroundColor: colors.borderLight, borderRadius: radius.full }]}>
          <Ionicons name={icon} size={32} color={colors.textMuted} />
        </View>
      ) : null}
      <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
      )}
      {actionLabel && onAction && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary, borderRadius: radius.sm }]}
          onPress={onAction}
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
        >
          <Text style={[styles.actionButtonText, { color: colors.white }]}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  mascotContainer: {
    marginBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
  actionButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
