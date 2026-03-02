import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CalendarView } from '../components/CalendarView';
import { TrendCard } from '../components/TrendCard';
import { DailyTotals } from '../components/DailyTotals';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { TrackingSummary, MacroTargets } from '../types';
import { toISODate } from '../utils/date';

const DEFAULT_TARGETS: MacroTargets = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65,
};

function getMonthRange(date: Date): { start: string; end: string } {
  const year = date.getFullYear();
  const month = date.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return {
    start: toISODate(start),
    end: toISODate(end),
  };
}

function getWeekRange(): { start: string; end: string } {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 6); // Last 7 days including today
  return {
    start: toISODate(weekAgo),
    end: toISODate(today),
  };
}

interface WeeklyStats {
  days_logged: number;
  avg_calories: number;
  avg_protein: number;
  avg_carbs: number;
  avg_fat: number;
}

export function TrackingScreen() {
  const { colors, radius, shadows } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [summary, setSummary] = useState<TrackingSummary | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [markedDates, setMarkedDates] = useState<Set<string>>(new Set());

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch monthly data
      const { start: monthStart, end: monthEnd } = getMonthRange(selectedDate);
      const monthlyData = await api.getTrackingSummary(monthStart, monthEnd);
      setSummary(monthlyData);

      // Calculate marked dates from monthly data
      const marked = new Set<string>();
      monthlyData.daily_data.forEach((day) => {
        if (day.calories > 0) {
          marked.add(day.date);
        }
      });
      setMarkedDates(marked);

      // Fetch weekly data (last 7 days)
      const { start: weekStart, end: weekEnd } = getWeekRange();
      const weeklyData = await api.getTrackingSummary(weekStart, weekEnd);

      // Calculate weekly stats
      const daysWithData = weeklyData.daily_data.filter(d => d.calories > 0);
      if (daysWithData.length > 0) {
        setWeeklyStats({
          days_logged: daysWithData.length,
          avg_calories: daysWithData.reduce((sum, d) => sum + d.calories, 0) / daysWithData.length,
          avg_protein: daysWithData.reduce((sum, d) => sum + d.protein, 0) / daysWithData.length,
          avg_carbs: daysWithData.reduce((sum, d) => sum + d.carbs, 0) / daysWithData.length,
          avg_fat: daysWithData.reduce((sum, d) => sum + d.fat, 0) / daysWithData.length,
        });
      } else {
        setWeeklyStats(null);
      }
    } catch (err: any) {
      // Ignore 401 errors (user logged out or deleted)
      if (err?.response?.status !== 401) {
        console.error('Failed to fetch tracking summary:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const selectedDateStr = toISODate(selectedDate);
  const selectedDayData = summary?.daily_data.find((d) => d.date === selectedDateStr);

  // Calculate days with actual data for threshold checks
  const daysWithMonthlyData = summary?.daily_data.filter(d => d.calories > 0).length ?? 0;
  const hasEnoughWeeklyData = (weeklyStats?.days_logged ?? 0) >= 7;
  const hasEnoughMonthlyData = daysWithMonthlyData >= 30;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchSummary} tintColor={colors.primary} />
      }
    >
      <CalendarView
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        markedDates={markedDates}
      />

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Selected Day</Text>
      {selectedDayData ? (
        <DailyTotals
          totals={{
            calories: selectedDayData.calories,
            protein: selectedDayData.protein,
            carbs: selectedDayData.carbs,
            fat: selectedDayData.fat,
          }}
          targets={DEFAULT_TARGETS}
        />
      ) : (
        <View style={[styles.noDataCard, { backgroundColor: colors.card, borderRadius: radius.md }]}>
          <Ionicons name="calendar-outline" size={32} color={colors.textMuted} />
          <Text style={[styles.noDataText, { color: colors.textMuted }]}>No data for this day</Text>
        </View>
      )}

      {/* Weekly Averages */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Weekly Averages</Text>
      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : hasEnoughWeeklyData && weeklyStats ? (
        <>
          <View style={styles.trendRow}>
            <TrendCard
              title="Days Logged"
              value={weeklyStats.days_logged}
              subtitle="this week"
              color={colors.primary}
            />
            <View style={{ width: 12 }} />
            <TrendCard
              title="Avg Calories"
              value={Math.round(weeklyStats.avg_calories)}
              subtitle="kcal/day"
              color={colors.carbs}
            />
          </View>
          <View style={styles.trendRow}>
            <TrendCard
              title="Avg Protein"
              value={`${Math.round(weeklyStats.avg_protein)}g`}
              color={colors.protein}
            />
            <View style={{ width: 12 }} />
            <TrendCard
              title="Avg Carbs"
              value={`${Math.round(weeklyStats.avg_carbs)}g`}
              color={colors.carbs}
            />
            <View style={{ width: 12 }} />
            <TrendCard
              title="Avg Fat"
              value={`${Math.round(weeklyStats.avg_fat)}g`}
              color={colors.fat}
            />
          </View>
        </>
      ) : (
        <View style={[styles.placeholderCard, { backgroundColor: colors.card, borderRadius: radius.md }]}>
          <Ionicons name="calendar-outline" size={28} color={colors.textMuted} />
          <View style={styles.placeholderContent}>
            <Text style={[styles.placeholderTitle, { color: colors.textSecondary }]}>
              Weekly averages available after 7 days
            </Text>
            <Text style={[styles.placeholderText, { color: colors.textMuted }]}>
              {weeklyStats?.days_logged ?? 0} of 7 days logged this week
            </Text>
          </View>
        </View>
      )}

      {/* Monthly Averages */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Monthly Averages</Text>
      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : hasEnoughMonthlyData && summary ? (
        <>
          <View style={styles.trendRow}>
            <TrendCard
              title="Days Logged"
              value={daysWithMonthlyData}
              subtitle="this month"
              color={colors.primary}
            />
            <View style={{ width: 12 }} />
            <TrendCard
              title="Avg Calories"
              value={Math.round(summary.avg_calories)}
              subtitle="kcal/day"
              color={colors.carbs}
            />
          </View>
          <View style={styles.trendRow}>
            <TrendCard
              title="Avg Protein"
              value={`${Math.round(summary.avg_protein)}g`}
              color={colors.protein}
            />
            <View style={{ width: 12 }} />
            <TrendCard
              title="Avg Carbs"
              value={`${Math.round(summary.avg_carbs)}g`}
              color={colors.carbs}
            />
            <View style={{ width: 12 }} />
            <TrendCard
              title="Avg Fat"
              value={`${Math.round(summary.avg_fat)}g`}
              color={colors.fat}
            />
          </View>
        </>
      ) : (
        <View style={[styles.placeholderCard, { backgroundColor: colors.card, borderRadius: radius.md }]}>
          <Ionicons name="trending-up-outline" size={28} color={colors.textMuted} />
          <View style={styles.placeholderContent}>
            <Text style={[styles.placeholderTitle, { color: colors.textSecondary }]}>
              Monthly averages available after 30 days
            </Text>
            <Text style={[styles.placeholderText, { color: colors.textMuted }]}>
              {daysWithMonthlyData} of 30 days logged this month
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
  },
  trendRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  noDataCard: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  noDataText: {
    fontSize: 14,
  },
  placeholderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  placeholderContent: {
    flex: 1,
  },
  placeholderTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  placeholderText: {
    fontSize: 13,
  },
  loader: {
    marginTop: 20,
  },
});
