import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QuantityStepper } from './QuantityStepper';
import { MealLogEntry } from '../types';
import { useTheme } from '../context/ThemeContext';

interface FoodEntryCardProps {
  entry: MealLogEntry;
  onUpdateServings: (servings: number) => void;
  onDelete: () => void;
  onPress: () => void;
}

export function FoodEntryCard({
  entry,
  onUpdateServings,
  onDelete,
  onPress,
}: FoodEntryCardProps) {
  const { colors, radius, shadows } = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const deleteThreshold = -80;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(Math.max(gestureState.dx, -100));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < deleteThreshold) {
          Animated.timing(translateX, {
            toValue: -100,
            duration: 200,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const food = entry.food;
  if (!food) return null;

  const totalCalories = Math.round(food.calories_per_serving * entry.servings);
  const totalProtein = Math.round(food.protein_per_serving * entry.servings);
  const totalCarbs = Math.round(food.carbs_per_serving * entry.servings);
  const totalFat = Math.round(food.fat_per_serving * entry.servings);

  const handleIncrement = () => {
    onUpdateServings(entry.servings + 0.5);
  };

  const handleDecrement = () => {
    if (entry.servings > 0.5) {
      onUpdateServings(entry.servings - 0.5);
    }
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.deleteButton, { backgroundColor: colors.error, borderRadius: radius.md }]}
        onPress={onDelete}
        accessibilityLabel="Delete food entry"
        accessibilityRole="button"
      >
        <Text style={[styles.deleteText, { color: colors.white }]}>Delete</Text>
      </TouchableOpacity>
      <Animated.View
        style={[
          styles.container,
          { backgroundColor: colors.card, borderRadius: radius.md },
          shadows.small,
          { transform: [{ translateX }] }
        ]}
        {...panResponder.panHandlers}
      >
        <Pressable onPress={onPress} style={styles.content} accessibilityLabel={`View ${food.name} details`} accessibilityRole="button">
          <View style={styles.header}>
            <Text style={[styles.name, { color: colors.text }]}>{food.name}</Text>
            <View style={styles.caloriesRow}>
              <Text style={[styles.calories, { color: colors.text }]}>{totalCalories} kcal</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </View>
          </View>
          <View style={styles.footer}>
            <View style={styles.macros}>
              <Text style={[styles.macro, { color: colors.textSecondary }]}>P: {totalProtein}g</Text>
              <Text style={[styles.macro, { color: colors.textSecondary }]}>C: {totalCarbs}g</Text>
              <Text style={[styles.macro, { color: colors.textSecondary }]}>F: {totalFat}g</Text>
            </View>
            <QuantityStepper
              value={entry.servings}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
            />
          </View>
          <Text style={[styles.servingInfo, { color: colors.textMuted }]}>
            {entry.servings} x {food.serving_unit}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontWeight: '600',
    fontSize: 14,
  },
  container: {
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  caloriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  calories: {
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  macros: {
    flexDirection: 'row',
    gap: 12,
  },
  macro: {
    fontSize: 13,
  },
  servingInfo: {
    fontSize: 12,
    marginTop: 4,
  },
});
