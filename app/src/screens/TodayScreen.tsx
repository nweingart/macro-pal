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
import { EmptyState } from '../components/EmptyState';
import { useMealLog } from '../hooks/useMealLog';
import { useFoodLibrary } from '../hooks/useFoodLibrary';
import { useTheme } from '../context/ThemeContext';
import { MacroTargets } from '../types';
import { toISODate } from '../utils/date';

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
  const [modalVisible, setModalVisible] = useState(false);
  const [nutrientsModalVisible, setNutrientsModalVisible] = useState(false);
  const [addingFood, setAddingFood] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleAddFood = async (input: string) => {
    setAddingFood(true);
    await addEntry(input);
    setAddingFood(false);
  };

  const handleUpdateServings = async (id: string, servings: number) => {
    await updateServings(id, servings);
  };

  const handleDelete = async (id: string) => {
    await deleteEntry(id);
  };

  const totals = dailyLog?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const entries = dailyLog?.entries || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <DailyTotals totals={totals} targets={DEFAULT_TARGETS} />

            {/* Micronutrients Button */}
            {entries.length > 0 && (
              <TouchableOpacity
                style={[styles.nutrientsButton, { backgroundColor: colors.card, borderRadius: radius.md }]}
                onPress={() => setNutrientsModalVisible(true)}
              >
                <View style={styles.nutrientsButtonContent}>
                  <View style={[styles.nutrientsIcon, { backgroundColor: colors.primaryLight }]}>
                    <Ionicons name="leaf-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.nutrientsTextContainer}>
                    <Text style={[styles.nutrientsTitle, { color: colors.text }]}>Vitamins & Minerals</Text>
                    <Text style={[styles.nutrientsSubtitle, { color: colors.textSecondary }]}>
                      See estimated micronutrients
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            )}

            {entries.length > 0 && (
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Food</Text>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <FoodEntryCard
            entry={item}
            onUpdateServings={(servings) => handleUpdateServings(item.id, servings)}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={styles.loader} color={colors.primary} />
          ) : (
            <EmptyState
              showMascot
              mascotMood="thinking"
              title="No food logged today"
              subtitle="Tap the + button to add your first meal"
              actionLabel="Add Food"
              onAction={() => setModalVisible(true)}
            />
          )
        }
        contentContainerStyle={styles.listContent}
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
        date={today}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
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
  nutrientsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    marginTop: 12,
    marginBottom: 8,
  },
  nutrientsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nutrientsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nutrientsTextContainer: {
    gap: 2,
  },
  nutrientsTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  nutrientsSubtitle: {
    fontSize: 13,
  },
});
