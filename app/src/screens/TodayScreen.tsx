import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { DailyTotals } from '../components/DailyTotals';
import { FoodEntryCard } from '../components/FoodEntryCard';
import { AddFoodModal } from '../components/AddFoodModal';
import { MicronutrientsModal } from '../components/MicronutrientsModal';
import { FoodDetailModal } from '../components/FoodDetailModal';
import { EmptyState } from '../components/EmptyState';
import { useMealLog } from '../hooks/useMealLog';
import { useFoodLibrary } from '../hooks/useFoodLibrary';
import { useStreak } from '../hooks/useStreak';
import { useTheme } from '../context/ThemeContext';
import { MacroTargets, MealLogEntry } from '../types';
import { toISODate } from '../utils/date';
import { analytics } from '../utils/analytics';
import { useReviewPrompt } from '../hooks/useReviewPrompt';

const DEFAULT_TARGETS: MacroTargets = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65,
};

export function TodayScreen() {
  const { colors, radius, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const today = toISODate(new Date());
  const { dailyLog, loading, error, refresh, addEntry, updateServings, deleteEntry } = useMealLog(today);
  const { foods } = useFoodLibrary();
  const { refresh: refreshStreak } = useStreak();
  const { maybeTrigger: maybePromptReview } = useReviewPrompt();
  const entries = dailyLog?.entries || [];
  const [modalVisible, setModalVisible] = useState(false);
  const [nutrientsModalVisible, setNutrientsModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<MealLogEntry | null>(null);
  const [addingFood, setAddingFood] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleAddFood = async (input: string) => {
    setAddingFood(true);
    await addEntry(input);
    analytics.foodLogged('text');
    refreshStreak();
    maybePromptReview();
    setAddingFood(false);
  };

  const handleUpdateServings = async (id: string, servings: number) => {
    await updateServings(id, servings);
  };

  const handleDelete = async (id: string) => {
    await deleteEntry(id);
  };

  const totals = dailyLog?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.fixedHeader}>
        <DailyTotals
          totals={totals}
          targets={DEFAULT_TARGETS}
          onViewMicronutrients={entries.length > 0 ? () => setNutrientsModalVisible(true) : undefined}
        />
      </View>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          entries.length > 0 ? (
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Food</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <FoodEntryCard
            entry={item}
            onUpdateServings={(servings) => handleUpdateServings(item.id, servings)}
            onDelete={() => handleDelete(item.id)}
            onPress={() => setSelectedEntry(item)}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={styles.loader} color={colors.primary} />
          ) : (
            <EmptyState
              title="No food logged today"
              subtitle="Tap the + button to add your first meal"
              actionLabel="Add Food"
              onAction={() => setModalVisible(true)}
            />
          )
        }
        contentContainerStyle={[styles.listContent, { paddingBottom: 16 + 56 + 16 + insets.bottom }]}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.primary} />
        }
      />

      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: colors.primary,
            borderRadius: radius.full,
            bottom: 16 + insets.bottom,
          },
          shadows.large,
        ]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
        accessibilityLabel="Add food"
        accessibilityRole="button"
      >
        <Ionicons name="add" size={32} color={colors.white} />
      </TouchableOpacity>

      <AddFoodModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddFood}
        foods={foods}
        loading={addingFood}
      />

      <MicronutrientsModal
        visible={nutrientsModalVisible}
        onClose={() => setNutrientsModalVisible(false)}
        entries={entries}
      />

      <FoodDetailModal
        visible={selectedEntry !== null}
        onClose={() => setSelectedEntry(null)}
        entry={selectedEntry}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    right: 16,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
