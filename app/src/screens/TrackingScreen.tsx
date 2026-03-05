import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CalendarView } from '../components/CalendarView';
import { TrendCard } from '../components/TrendCard';
import { DailyTotals } from '../components/DailyTotals';
import { useTheme } from '../context/ThemeContext';
import { useDevMode } from '../dev/DevModeContext';
import { api } from '../services/api';
import { TrackingSummary, MacroTargets } from '../types';
import { toISODate } from '../utils/date';

const DEFAULT_TARGETS: MacroTargets = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65,
};

type PeriodTab = 'week' | 'month';

interface PeriodStats {
  days_logged: number;
  avg_calories: number;
  avg_protein: number;
  avg_carbs: number;
  avg_fat: number;
}

function getMonthRange(date: Date): { start: string; end: string } {
  const year = date.getFullYear();
  const month = date.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return { start: toISODate(start), end: toISODate(end) };
}

function getPrevMonthRange(date: Date): { start: string; end: string } {
  const year = date.getFullYear();
  const month = date.getMonth();
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return { start: toISODate(start), end: toISODate(end) };
}

function getWeekRange(): { start: string; end: string } {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 6);
  return { start: toISODate(weekAgo), end: toISODate(today) };
}

function getPrevWeekRange(): { start: string; end: string } {
  const today = new Date();
  const end = new Date(today);
  end.setDate(today.getDate() - 7);
  const start = new Date(end);
  start.setDate(end.getDate() - 6);
  return { start: toISODate(start), end: toISODate(end) };
}

function computeStats(dailyData: { calories: number; protein: number; carbs: number; fat: number }[]): PeriodStats | null {
  const days = dailyData.filter(d => d.calories > 0);
  if (days.length === 0) return null;
  return {
    days_logged: days.length,
    avg_calories: days.reduce((s, d) => s + d.calories, 0) / days.length,
    avg_protein: days.reduce((s, d) => s + d.protein, 0) / days.length,
    avg_carbs: days.reduce((s, d) => s + d.carbs, 0) / days.length,
    avg_fat: days.reduce((s, d) => s + d.fat, 0) / days.length,
  };
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export function TrackingScreen() {
  const { colors, radius, shadows } = useTheme();
  const dev = useDevMode();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [summary, setSummary] = useState<TrackingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [markedDates, setMarkedDates] = useState<Set<string>>(new Set());
  const [periodTab, setPeriodTab] = useState<PeriodTab>('week');

  // Current & previous period stats
  const [weekStats, setWeekStats] = useState<PeriodStats | null>(null);
  const [prevWeekStats, setPrevWeekStats] = useState<PeriodStats | null>(null);
  const [monthStats, setMonthStats] = useState<PeriodStats | null>(null);
  const [prevMonthStats, setPrevMonthStats] = useState<PeriodStats | null>(null);

  const fetchSummary = useCallback(async () => {
    if (dev.enabled) {
      const { getMockTrackingSummary } = require('../dev/mockData');
      const { start: monthStart, end: monthEnd } = getMonthRange(selectedDate);
      const monthlyData: TrackingSummary = getMockTrackingSummary(dev.dataPreset, monthStart, monthEnd);
      setSummary(monthlyData);

      const marked = new Set<string>();
      monthlyData.daily_data.forEach((day: TrackingSummary['daily_data'][number]) => {
        if (day.calories > 0) marked.add(day.date);
      });
      setMarkedDates(marked);

      // Week
      const { start: ws, end: we } = getWeekRange();
      const { start: pws, end: pwe } = getPrevWeekRange();
      setWeekStats(computeStats(getMockTrackingSummary(dev.dataPreset, ws, we).daily_data));
      setPrevWeekStats(computeStats(getMockTrackingSummary(dev.dataPreset, pws, pwe).daily_data));

      // Month
      setMonthStats(computeStats(monthlyData.daily_data));
      const { start: pms, end: pme } = getPrevMonthRange(selectedDate);
      setPrevMonthStats(computeStats(getMockTrackingSummary(dev.dataPreset, pms, pme).daily_data));

      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { start: monthStart, end: monthEnd } = getMonthRange(selectedDate);
      const { start: ws, end: we } = getWeekRange();
      const { start: pws, end: pwe } = getPrevWeekRange();
      const { start: pms, end: pme } = getPrevMonthRange(selectedDate);

      const [monthlyData, weeklyData, prevWeekData, prevMonthData] = await Promise.all([
        api.getTrackingSummary(monthStart, monthEnd),
        api.getTrackingSummary(ws, we),
        api.getTrackingSummary(pws, pwe),
        api.getTrackingSummary(pms, pme),
      ]);

      setSummary(monthlyData);

      const marked = new Set<string>();
      monthlyData.daily_data.forEach((day) => {
        if (day.calories > 0) marked.add(day.date);
      });
      setMarkedDates(marked);

      setWeekStats(computeStats(weeklyData.daily_data));
      setPrevWeekStats(computeStats(prevWeekData.daily_data));
      setMonthStats(computeStats(monthlyData.daily_data));
      setPrevMonthStats(computeStats(prevMonthData.daily_data));
    } catch (err: any) {
      if (err?.response?.status !== 401) {
        console.error('Failed to fetch tracking summary:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedDate, dev.enabled, dev.dataPreset]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const selectedDateStr = toISODate(selectedDate);
  const selectedDayData = summary?.daily_data.find((d) => d.date === selectedDateStr);

  // Pick stats for the active tab
  const currentStats = periodTab === 'week' ? weekStats : monthStats;
  const previousStats = periodTab === 'week' ? prevWeekStats : prevMonthStats;
  const periodLabel = periodTab === 'week' ? 'this week' : 'this month';
  const minDays = periodTab === 'week' ? 3 : 7;
  const hasEnoughData = (currentStats?.days_logged ?? 0) >= minDays;

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

      {/* Period toggle + averages */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Averages</Text>

      <View style={[styles.toggle, { backgroundColor: colors.card, borderRadius: radius.md }]}>
        {(['week', 'month'] as PeriodTab[]).map((tab) => {
          const active = periodTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[
                styles.toggleTab,
                {
                  backgroundColor: active ? colors.primary : 'transparent',
                  borderRadius: radius.sm,
                },
              ]}
              onPress={() => setPeriodTab(tab)}
              activeOpacity={0.7}
              accessibilityLabel={tab === 'week' ? 'Show weekly view' : 'Show monthly view'}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.toggleText,
                  { color: active ? colors.white : colors.textSecondary },
                ]}
              >
                {tab === 'week' ? 'Week' : 'Month'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : hasEnoughData && currentStats ? (
        <>
          <View style={styles.trendRow}>
            <TrendCard
              title="Days Logged"
              value={currentStats.days_logged}
              subtitle={periodLabel}
              color={colors.primary}
              change={previousStats ? pctChange(currentStats.days_logged, previousStats.days_logged) : null}
            />
            <View style={styles.gap} />
            <TrendCard
              title="Avg Calories"
              value={Math.round(currentStats.avg_calories)}
              subtitle="kcal/day"
              color={colors.primary}
              change={previousStats ? pctChange(currentStats.avg_calories, previousStats.avg_calories) : null}
            />
          </View>
          <View style={styles.trendRow}>
            <TrendCard
              title="Avg Protein"
              value={`${Math.round(currentStats.avg_protein)}g`}
              color={colors.protein}
              change={previousStats ? pctChange(currentStats.avg_protein, previousStats.avg_protein) : null}
            />
            <View style={styles.gap} />
            <TrendCard
              title="Avg Carbs"
              value={`${Math.round(currentStats.avg_carbs)}g`}
              color={colors.carbs}
              change={previousStats ? pctChange(currentStats.avg_carbs, previousStats.avg_carbs) : null}
            />
            <View style={styles.gap} />
            <TrendCard
              title="Avg Fat"
              value={`${Math.round(currentStats.avg_fat)}g`}
              color={colors.fat}
              change={previousStats ? pctChange(currentStats.avg_fat, previousStats.avg_fat) : null}
            />
          </View>
        </>
      ) : (
        <View style={[styles.placeholderCard, { backgroundColor: colors.card, borderRadius: radius.md }]}>
          <Ionicons name="trending-up-outline" size={28} color={colors.textMuted} />
          <View style={styles.placeholderContent}>
            <Text style={[styles.placeholderTitle, { color: colors.textSecondary }]}>
              {periodTab === 'week'
                ? 'Log at least 3 days this week to see averages'
                : 'Log at least 7 days this month to see averages'}
            </Text>
            <Text style={[styles.placeholderText, { color: colors.textMuted }]}>
              {currentStats?.days_logged ?? 0} of {minDays} days logged
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
  toggle: {
    flexDirection: 'row',
    padding: 4,
    marginBottom: 16,
  },
  toggleTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  trendRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  gap: {
    width: 12,
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
