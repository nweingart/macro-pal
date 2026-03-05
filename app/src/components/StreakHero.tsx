import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Mascot, MascotMood } from './Mascot';
import { SpeechBubble } from './SpeechBubble';
import { useTheme } from '../context/ThemeContext';
import { DayStatus } from '../types';

interface StreakHeroProps {
  currentStreak: number;
  weeklyDayStatus: DayStatus[];
  freezeAvailable: boolean;
  mood: MascotMood;
  message: string;
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function getMilestoneLabel(streak: number): string | null {
  if (streak >= 100) return '100 day streak!';
  if (streak >= 30) return '30 day streak!';
  if (streak >= 7) return '1 week streak!';
  return null;
}

function getDotColor(
  status: DayStatus,
  colors: { primary: string; info: string; borderLight: string },
): string {
  if (status === 'logged') return colors.primary;
  if (status === 'frozen') return colors.info;
  return colors.borderLight;
}

export function StreakHero({
  currentStreak,
  weeklyDayStatus,
  freezeAvailable,
  mood,
  message,
}: StreakHeroProps) {
  const { colors, radius, shadows } = useTheme();
  const milestone = getMilestoneLabel(currentStreak);

  // Determine which day index is "today" (Mon=0 ... Sun=6)
  const dayOfWeek = new Date().getDay();
  const todayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  return (
    <View style={styles.wrapper}>
      {/* Teddy — big and centered */}
      <View style={styles.teddySection}>
        <SpeechBubble message={message} maxWidth={220} />
        <Mascot size={200} mood={mood} />
      </View>

      {/* Streak card below Teddy */}
      <View style={[styles.card, { backgroundColor: colors.card, borderRadius: radius.lg }, shadows.small]}>
        {/* Flame + streak count */}
        <View style={styles.streakRow}>
          <Ionicons name="flame" size={32} color={currentStreak > 0 ? '#f97316' : colors.textMuted} />
          <Text style={[styles.streakNumber, { color: colors.text }]}>{currentStreak}</Text>
        </View>
        <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>day streak</Text>

        {/* Milestone banner */}
        {milestone && (
          <View style={[styles.milestoneBadge, { backgroundColor: colors.primaryLight, borderRadius: radius.sm }]}>
            <Text style={[styles.milestoneText, { color: colors.primaryDark }]}>{milestone}</Text>
          </View>
        )}

        {/* Weekly dot grid */}
        <View style={styles.weekRow}>
          {DAY_LABELS.map((label, i) => {
            const status = weeklyDayStatus[i];
            const isToday = i === todayIndex;
            const dotColor = getDotColor(status, colors);
            return (
              <View key={i} style={styles.dayColumn}>
                <Text style={[styles.dayLabel, { color: colors.textMuted }]}>{label}</Text>
                <View style={styles.dotContainer}>
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: dotColor },
                      isToday && {
                        borderWidth: 2,
                        borderColor: colors.primary,
                      },
                    ]}
                  />
                  {status === 'frozen' && (
                    <Ionicons
                      name="snow"
                      size={8}
                      color={colors.white}
                      style={styles.snowflake}
                    />
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Freeze inventory */}
        <View style={styles.freezeRow}>
          <Ionicons
            name="snow"
            size={14}
            color={freezeAvailable ? colors.info : colors.textMuted}
          />
          <Text
            style={[
              styles.freezeText,
              { color: freezeAvailable ? colors.info : colors.textMuted },
            ]}
          >
            {freezeAvailable ? '1 freeze available' : 'No freeze \u2014 refills Monday'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  teddySection: {
    alignItems: 'center',
    marginBottom: 4,
  },
  card: {
    padding: 20,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: '700',
  },
  streakLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: -2,
    marginBottom: 12,
  },
  milestoneBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
  },
  milestoneText: {
    fontSize: 13,
    fontWeight: '600',
  },
  weekRow: {
    flexDirection: 'row',
    gap: 16,
  },
  dayColumn: {
    alignItems: 'center',
    gap: 6,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  dotContainer: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  snowflake: {
    position: 'absolute',
  },
  freezeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  freezeText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
