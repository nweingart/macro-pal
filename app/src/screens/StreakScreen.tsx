import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { StreakHero } from '../components/StreakHero';
import { useStreak } from '../hooks/useStreak';
import { useMealLog } from '../hooks/useMealLog';
import { useTeddyMood } from '../hooks/useTeddyMood';
import { useTheme } from '../context/ThemeContext';
import { toISODate } from '../utils/date';

const MILESTONES = [7, 30, 100];

export function StreakScreen() {
  const { colors, radius, shadows } = useTheme();
  const today = toISODate(new Date());
  const { currentStreak, daysSinceLastLog, weeklyDayStatus, freezeAvailable, monthDaysLogged, refresh } = useStreak();
  const { dailyLog } = useMealLog(today);
  const entries = dailyLog?.entries || [];
  const { mood, message } = useTeddyMood(entries.length, currentStreak, daysSinceLastLog);

  const nextMilestone = useMemo(() => MILESTONES.find((m) => m > currentStreak), [currentStreak]);

  const daysElapsedThisMonth = new Date().getDate();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const milestoneLabel = (threshold: number) => {
    if (threshold === 7) return '1 week streak!';
    if (threshold === 30) return '1 month streak!';
    return `${threshold} day streak!`;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <StreakHero
        currentStreak={currentStreak}
        weeklyDayStatus={weeklyDayStatus}
        freezeAvailable={freezeAvailable}
        mood={mood}
        message={message}
      />

      {/* Next milestone card */}
      <View style={[styles.card, { backgroundColor: colors.card, borderRadius: radius.md }, shadows.small]}>
        {nextMilestone ? (
          <>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Next: {milestoneLabel(nextMilestone)}
            </Text>
            <View style={[styles.progressTrack, { backgroundColor: colors.border, borderRadius: radius.sm }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.primary,
                    borderRadius: radius.sm,
                    width: `${Math.min((currentStreak / nextMilestone) * 100, 100)}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
              {currentStreak} / {nextMilestone} days
            </Text>
          </>
        ) : (
          <>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Keep going!</Text>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
              You've passed all milestones — incredible!
            </Text>
          </>
        )}
      </View>

      {/* This month card */}
      <View style={[styles.card, { backgroundColor: colors.card, borderRadius: radius.md }, shadows.small]}>
        <View style={styles.monthRow}>
          <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>This month</Text>
        </View>
        <Text style={[styles.monthSubtitle, { color: colors.textSecondary }]}>
          {monthDaysLogged} of {daysElapsedThisMonth} days logged
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 24,
  },
  card: {
    padding: 16,
    marginTop: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressTrack: {
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
  },
  progressLabel: {
    fontSize: 13,
    marginTop: 6,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  monthSubtitle: {
    fontSize: 14,
    marginLeft: 28,
  },
});
