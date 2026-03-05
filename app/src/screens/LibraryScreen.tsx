import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useFoodLibrary } from '../hooks/useFoodLibrary';
import { useTheme } from '../context/ThemeContext';
import { Food } from '../types';

interface EditModalProps {
  food: Food | null;
  visible: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Food>) => void;
}

function EditFoodModal({ food, visible, onClose, onSave }: EditModalProps) {
  const { colors, radius } = useTheme();
  const [name, setName] = useState('');
  const [servingUnit, setServingUnit] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  React.useEffect(() => {
    if (food) {
      setName(food.name);
      setServingUnit(food.serving_unit);
      setCalories(String(food.calories_per_serving));
      setProtein(String(food.protein_per_serving));
      setCarbs(String(food.carbs_per_serving));
      setFat(String(food.fat_per_serving));
    }
  }, [food]);

  const handleSave = () => {
    onSave({
      name,
      serving_unit: servingUnit,
      calories_per_serving: parseFloat(calories) || 0,
      protein_per_serving: parseFloat(protein) || 0,
      carbs_per_serving: parseFloat(carbs) || 0,
      fat_per_serving: parseFloat(fat) || 0,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[modalStyles.container, { backgroundColor: colors.background }]}>
        <View style={[modalStyles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} accessibilityLabel="Cancel" accessibilityRole="button">
            <Text style={[modalStyles.cancelButton, { color: colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[modalStyles.title, { color: colors.text }]}>Edit Food</Text>
          <TouchableOpacity onPress={handleSave} accessibilityLabel="Save" accessibilityRole="button">
            <Text style={[modalStyles.saveButton, { color: colors.primary }]}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={modalStyles.form}>
          <Text style={[modalStyles.label, { color: colors.text }]}>Name</Text>
          <TextInput
            style={[modalStyles.input, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.sm, color: colors.text }]}
            value={name}
            onChangeText={setName}
            accessibilityLabel="Food name"
          />

          <Text style={[modalStyles.label, { color: colors.text }]}>Serving Unit</Text>
          <TextInput
            style={[modalStyles.input, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.sm, color: colors.text }]}
            value={servingUnit}
            onChangeText={setServingUnit}
            placeholder="e.g., 1 large egg, 1 cup"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Serving unit"
          />

          <Text style={[modalStyles.label, { color: colors.text }]}>Calories per Serving</Text>
          <TextInput
            style={[modalStyles.input, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.sm, color: colors.text }]}
            value={calories}
            onChangeText={setCalories}
            keyboardType="numeric"
            accessibilityLabel="Calories per serving"
          />

          <View style={modalStyles.macroRow}>
            <View style={modalStyles.macroField}>
              <Text style={[modalStyles.label, { color: colors.text }]}>Protein (g)</Text>
              <TextInput
                style={[modalStyles.input, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.sm, color: colors.text }]}
                value={protein}
                onChangeText={setProtein}
                keyboardType="numeric"
                accessibilityLabel="Protein in grams"
              />
            </View>
            <View style={modalStyles.macroField}>
              <Text style={[modalStyles.label, { color: colors.text }]}>Carbs (g)</Text>
              <TextInput
                style={[modalStyles.input, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.sm, color: colors.text }]}
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="numeric"
                accessibilityLabel="Carbs in grams"
              />
            </View>
            <View style={modalStyles.macroField}>
              <Text style={[modalStyles.label, { color: colors.text }]}>Fat (g)</Text>
              <TextInput
                style={[modalStyles.input, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.sm, color: colors.text }]}
                value={fat}
                onChangeText={setFat}
                keyboardType="numeric"
                accessibilityLabel="Fat in grams"
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  cancelButton: {
    fontSize: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  macroRow: {
    flexDirection: 'row',
    gap: 12,
  },
  macroField: {
    flex: 1,
  },
});

export function LibraryScreen() {
  const { colors, radius, shadows } = useTheme();
  const { foods, loading, refresh, updateFood, deleteFood } = useFoodLibrary();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingFood, setEditingFood] = useState<Food | null>(null);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedFoods = [...filteredFoods].sort(
    (a, b) => b.times_used - a.times_used
  );

  const handleEdit = (food: Food) => {
    setEditingFood(food);
  };

  const handleSave = async (updates: Partial<Food>) => {
    if (editingFood) {
      await updateFood(editingFood.id, updates);
    }
  };

  const handleDelete = (food: Food) => {
    Alert.alert(
      'Delete Food',
      `Are you sure you want to delete "${food.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteFood(food.id),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: colors.card,
              borderRadius: radius.md,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="Search foods..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Search foods in your library"
        />
      </View>

      <FlatList
        data={sortedFoods}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.foodCard, { backgroundColor: colors.card, borderRadius: radius.md }, shadows.small]}
            onPress={() => handleEdit(item)}
            onLongPress={() => handleDelete(item)}
            accessibilityLabel={item.name}
            accessibilityRole="button"
          >
            <View style={styles.foodHeader}>
              <Text style={[styles.foodName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.timesUsed, { color: colors.textMuted }]}>Used {item.times_used}x</Text>
            </View>
            <Text style={[styles.servingUnit, { color: colors.textSecondary }]}>{item.serving_unit}</Text>
            <View style={styles.macros}>
              <Text style={[styles.macro, { color: colors.textSecondary }]}>{item.calories_per_serving} kcal</Text>
              <Text style={[styles.macroDivider, { color: colors.textLight }]}>·</Text>
              <Text style={[styles.macro, { color: colors.textSecondary }]}>P: {item.protein_per_serving}g</Text>
              <Text style={[styles.macroDivider, { color: colors.textLight }]}>·</Text>
              <Text style={[styles.macro, { color: colors.textSecondary }]}>C: {item.carbs_per_serving}g</Text>
              <Text style={[styles.macroDivider, { color: colors.textLight }]}>·</Text>
              <Text style={[styles.macro, { color: colors.textSecondary }]}>F: {item.fat_per_serving}g</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={styles.loader} color={colors.primary} />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="library-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Your food library is empty</Text>
              <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
                Foods you log will appear here
              </Text>
            </View>
          )
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.primary} />
        }
      />

      <EditFoodModal
        food={editingFood}
        visible={editingFood !== null}
        onClose={() => setEditingFood(null)}
        onSave={handleSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchInput: {
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  foodCard: {
    padding: 16,
    marginBottom: 12,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  timesUsed: {
    fontSize: 12,
  },
  servingUnit: {
    fontSize: 14,
    marginTop: 4,
  },
  macros: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
  },
  macro: {
    fontSize: 13,
  },
  macroDivider: {
    marginHorizontal: 6,
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
});
