import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { OnboardingLayout } from '../../components/OnboardingLayout';

interface Targets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Props {
  onContinue: (targets?: Targets) => void;
  onBack: () => void;
  targets: Targets;
  goal: string;
}

export function TargetsScreen({ onContinue, onBack, targets, goal }: Props) {
  const [showCustomize, setShowCustomize] = useState(false);
  const [customTargets, setCustomTargets] = useState(targets);
  const [editCalories, setEditCalories] = useState(String(targets.calories));
  const [editProtein, setEditProtein] = useState(String(targets.protein));
  const [editCarbs, setEditCarbs] = useState(String(targets.carbs));
  const [editFat, setEditFat] = useState(String(targets.fat));

  const calorieScale = useSharedValue(0);
  const macroOpacity = useSharedValue(0);

  useEffect(() => {
    calorieScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    macroOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
  }, []);

  const calorieStyle = useAnimatedStyle(() => ({
    transform: [{ scale: calorieScale.value }],
  }));

  const macroStyle = useAnimatedStyle(() => ({
    opacity: macroOpacity.value,
  }));

  const goalLabel =
    goal === 'lose' ? 'Weight Loss' : goal === 'gain' ? 'Weight Gain' : 'Maintenance';

  const handleCustomize = () => {
    setEditCalories(String(customTargets.calories));
    setEditProtein(String(customTargets.protein));
    setEditCarbs(String(customTargets.carbs));
    setEditFat(String(customTargets.fat));
    setShowCustomize(true);
  };

  const handleSaveCustom = () => {
    const newTargets = {
      calories: parseInt(editCalories) || customTargets.calories,
      protein: parseInt(editProtein) || customTargets.protein,
      carbs: parseInt(editCarbs) || customTargets.carbs,
      fat: parseInt(editFat) || customTargets.fat,
    };
    setCustomTargets(newTargets);
    setShowCustomize(false);
  };

  const handleContinue = () => {
    // Pass custom targets if they were modified
    if (
      customTargets.calories !== targets.calories ||
      customTargets.protein !== targets.protein ||
      customTargets.carbs !== targets.carbs ||
      customTargets.fat !== targets.fat
    ) {
      onContinue(customTargets);
    } else {
      onContinue();
    }
  };

  const displayTargets = customTargets;

  return (
    <OnboardingLayout
      currentStep={16}
      onContinue={handleContinue}
      onBack={onBack}
    >
      <View style={styles.content}>
        <Text style={styles.label}>YOUR TARGETS</Text>
        <Text style={styles.title}>Here's your{'\n'}personalized plan</Text>

        <View style={styles.goalBadge}>
          <Text style={styles.goalText}>{goalLabel} Plan</Text>
        </View>

        <Animated.View style={[styles.calorieCard, calorieStyle]}>
          <Text style={styles.calorieLabel}>Daily Calories</Text>
          <Text style={styles.calorieValue}>{displayTargets.calories.toLocaleString()}</Text>
          <Text style={styles.calorieUnit}>kcal / day</Text>
        </Animated.View>

        <Animated.View style={[styles.macrosContainer, macroStyle]}>
          <Text style={styles.macrosTitle}>Macro Breakdown</Text>
          <View style={styles.macrosRow}>
            <View style={styles.macroCard}>
              <View style={[styles.macroIcon, { backgroundColor: '#DBEAFE' }]}>
                <Text style={styles.macroIconText}>P</Text>
              </View>
              <Text style={styles.macroValue}>{displayTargets.protein}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroCard}>
              <View style={[styles.macroIcon, { backgroundColor: '#FEF3C7' }]}>
                <Text style={styles.macroIconText}>C</Text>
              </View>
              <Text style={styles.macroValue}>{displayTargets.carbs}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroCard}>
              <View style={[styles.macroIcon, { backgroundColor: '#D1FAE5' }]}>
                <Text style={styles.macroIconText}>F</Text>
              </View>
              <Text style={styles.macroValue}>{displayTargets.fat}g</Text>
              <Text style={styles.macroLabel}>Fat</Text>
            </View>
          </View>
        </Animated.View>

        <TouchableOpacity style={styles.customizeButton} onPress={handleCustomize}>
          <Ionicons name="options-outline" size={18} color="#3B82F6" />
          <Text style={styles.customizeText}>Customize targets</Text>
        </TouchableOpacity>

        <View style={styles.noteBox}>
          <Text style={styles.noteText}>
            You can always adjust these later in the Macros tab.
          </Text>
        </View>
      </View>

      <Modal visible={showCustomize} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Customize Targets</Text>
              <TouchableOpacity onPress={() => setShowCustomize(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Daily Calories</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={editCalories}
                    onChangeText={setEditCalories}
                    keyboardType="number-pad"
                    placeholder="2000"
                  />
                  <Text style={styles.inputUnit}>kcal</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Protein</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={editProtein}
                    onChangeText={setEditProtein}
                    keyboardType="number-pad"
                    placeholder="150"
                  />
                  <Text style={styles.inputUnit}>g</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Carbs</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={editCarbs}
                    onChangeText={setEditCarbs}
                    keyboardType="number-pad"
                    placeholder="200"
                  />
                  <Text style={styles.inputUnit}>g</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Fat</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={editFat}
                    onChangeText={setEditFat}
                    keyboardType="number-pad"
                    placeholder="65"
                  />
                  <Text style={styles.inputUnit}>g</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveCustom}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    letterSpacing: 1,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    lineHeight: 36,
    alignSelf: 'flex-start',
  },
  goalBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  goalText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  calorieCard: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  calorieLabel: {
    fontSize: 14,
    color: '#BFDBFE',
    marginBottom: 4,
  },
  calorieValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  calorieUnit: {
    fontSize: 16,
    color: '#BFDBFE',
    marginTop: 4,
  },
  macrosContainer: {
    width: '100%',
    marginBottom: 20,
  },
  macrosTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textAlign: 'center',
  },
  macrosRow: {
    flexDirection: 'row',
    gap: 12,
  },
  macroCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  macroIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  macroIconText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  macroValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  macroLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  customizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  customizeText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#3B82F6',
  },
  noteBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
    width: '100%',
  },
  noteText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    paddingVertical: 14,
  },
  inputUnit: {
    fontSize: 16,
    color: '#6B7280',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
