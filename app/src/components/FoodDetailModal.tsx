import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { NutrientRow } from './NutrientRow';
import { MealLogEntry } from '../types';
import { computeFoodMicronutrients, VITAMIN_LABELS, MINERAL_LABELS } from '../utils/micronutrients';

interface Props {
  visible: boolean;
  onClose: () => void;
  entry: MealLogEntry | null;
}

export function FoodDetailModal({ visible, onClose, entry }: Props) {
  const { colors, radius } = useTheme();

  const analysis = useMemo(() => {
    if (!entry?.food) return null;
    return computeFoodMicronutrients(entry.food, entry.servings);
  }, [entry]);

  if (!entry?.food || !analysis) return null;

  const food = entry.food;
  const totalCalories = Math.round(food.calories_per_serving * entry.servings);
  const totalProtein = Math.round(food.protein_per_serving * entry.servings);
  const totalCarbs = Math.round(food.carbs_per_serving * entry.servings);
  const totalFat = Math.round(food.fat_per_serving * entry.servings);

  const getBarColor = (percentDV: number): string => {
    if (percentDV >= 80) return colors.success;
    if (percentDV >= 40) return colors.warning;
    return colors.error;
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityLabel="Close" accessibilityRole="button">
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {food.name}
          </Text>
          <View style={styles.closeButton} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Macro Summary Card */}
          <View style={[styles.macroCard, { backgroundColor: colors.card, borderRadius: radius.md }]}>
            <Text style={[styles.servingsText, { color: colors.textSecondary }]}>
              {entry.servings} x {food.serving_unit}
            </Text>
            <Text style={[styles.caloriesText, { color: colors.text }]}>{totalCalories} kcal</Text>
            <View style={styles.macroRow}>
              <View style={styles.macroItem}>
                <View style={[styles.macroDot, { backgroundColor: colors.protein }]} />
                <Text style={[styles.macroValue, { color: colors.text }]}>{totalProtein}g</Text>
                <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>Protein</Text>
              </View>
              <View style={styles.macroItem}>
                <View style={[styles.macroDot, { backgroundColor: colors.carbs }]} />
                <Text style={[styles.macroValue, { color: colors.text }]}>{totalCarbs}g</Text>
                <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>Carbs</Text>
              </View>
              <View style={styles.macroItem}>
                <View style={[styles.macroDot, { backgroundColor: colors.fat }]} />
                <Text style={[styles.macroValue, { color: colors.text }]}>{totalFat}g</Text>
                <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>Fat</Text>
              </View>
            </View>
          </View>

          {/* Disclaimer Banner */}
          <View style={[styles.disclaimerBanner, { backgroundColor: colors.warningLight, borderRadius: radius.md }]}>
            <Ionicons name="information-circle-outline" size={18} color={colors.warning} />
            <Text style={[styles.disclaimerBannerText, { color: colors.warningDark }]}>
              These are AI-estimated values and may not be 100% accurate
            </Text>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>Good (80%+)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>Moderate (40-80%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>Low (&lt;40%)</Text>
            </View>
          </View>

          {/* Vitamins */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Vitamins</Text>
          <View style={[styles.section, { backgroundColor: colors.card, borderRadius: radius.md }]}>
            {Object.entries(analysis.vitamins).map(([key, value]) => (
              <NutrientRow
                key={key}
                label={VITAMIN_LABELS[key] || key}
                nutrient={value}
                color={getBarColor(value.percentDV)}
              />
            ))}
          </View>

          {/* Minerals */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Minerals</Text>
          <View style={[styles.section, { backgroundColor: colors.card, borderRadius: radius.md }]}>
            {Object.entries(analysis.minerals).map(([key, value]) => (
              <NutrientRow
                key={key}
                label={MINERAL_LABELS[key] || key}
                nutrient={value}
                color={getBarColor(value.percentDV)}
              />
            ))}
          </View>

          {/* Disclaimer */}
          <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
            These values are AI-estimated based on your logged foods and may not be 100% accurate.
            For precise nutritional information, consult a registered dietitian.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  macroCard: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  servingsText: {
    fontSize: 13,
    marginBottom: 4,
  },
  caloriesText: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  macroItem: {
    alignItems: 'center',
    gap: 2,
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 2,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  macroLabel: {
    fontSize: 12,
  },
  disclaimerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
    marginBottom: 12,
  },
  disclaimerBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  section: {
    padding: 12,
    marginBottom: 20,
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
  },
});
