import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { ProfileSettingsModal } from '../components/ProfileSettingsModal';
import {
  validateMacros,
  hasCompleteProfile,
  getMissingProfileFields,
  getQuickFixSuggestion,
  UserProfile,
  ValidationLevel,
  MacroValidationResults,
  MacroType,
  QuickFixSuggestion,
} from '../utils/nutritionValidation';

type MacroName = 'protein' | 'carbs' | 'fat';

interface LockedMacros {
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}

export function MacrosScreen() {
  const { colors, radius } = useTheme();
  const toast = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [calorieTarget, setCalorieTarget] = useState('');
  // Support locking up to 2 macros - the third is always calculated
  const [lockedMacros, setLockedMacros] = useState<LockedMacros>({
    protein: null,
    carbs: null,
    fat: null,
  });
  // Track which macro is currently being edited (has the text input)
  const [editingMacro, setEditingMacro] = useState<MacroName>('protein');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    weight_lbs: null,
    height_inches: null,
    age: null,
    gender: null,
    activity_level: null,
  });

  const loadProfile = useCallback(async () => {
    // Don't make API calls if user is logged out (e.g., after account deletion)
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const profile = await api.getProfile();
      if (profile) {
        setCalorieTarget(profile.calorie_target ? String(profile.calorie_target) : '2000');
        // Default to locking protein with the saved value
        setLockedMacros({
          protein: profile.protein_target_g || 150,
          carbs: null,
          fat: null,
        });
        setEditingMacro('protein');
        setUserProfile({
          weight_lbs: profile.weight_lbs,
          height_inches: profile.height_inches,
          age: profile.age,
          gender: profile.gender as UserProfile['gender'],
          activity_level: profile.activity_level as UserProfile['activity_level'],
        });
      }
    } catch (err: any) {
      // Ignore 401 errors (user logged out or deleted) - not a real error
      if (err?.response?.status !== 401) {
        console.error('Failed to load profile:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleProfileModalClose = () => {
    setShowProfileModal(false);
    loadProfile(); // Reload profile after modal closes to get updated data
  };

  const calculatedMacros = useMemo(() => {
    const calories = parseInt(calorieTarget) || 0;

    if (calories === 0) {
      return { protein: 0, carbs: 0, fat: 0 };
    }

    const { protein: lockedProtein, carbs: lockedCarbs, fat: lockedFat } = lockedMacros;

    // Count how many macros are locked
    const lockedCount = [lockedProtein, lockedCarbs, lockedFat].filter(v => v !== null).length;

    let protein = 0, carbs = 0, fat = 0;

    if (lockedCount === 2) {
      // Two macros locked - calculate the third exactly
      if (lockedProtein !== null && lockedCarbs !== null) {
        protein = lockedProtein;
        carbs = lockedCarbs;
        const remaining = calories - (protein * 4) - (carbs * 4);
        fat = Math.round(remaining / 9);
      } else if (lockedProtein !== null && lockedFat !== null) {
        protein = lockedProtein;
        fat = lockedFat;
        const remaining = calories - (protein * 4) - (fat * 9);
        carbs = Math.round(remaining / 4);
      } else if (lockedCarbs !== null && lockedFat !== null) {
        carbs = lockedCarbs;
        fat = lockedFat;
        const remaining = calories - (carbs * 4) - (fat * 9);
        protein = Math.round(remaining / 4);
      }
    } else if (lockedCount === 1) {
      // One macro locked - calculate others with ratios
      if (lockedProtein !== null) {
        protein = lockedProtein;
        const remaining = calories - (protein * 4);
        carbs = Math.round((remaining * 0.55) / 4);
        fat = Math.round((remaining * 0.45) / 9);
      } else if (lockedCarbs !== null) {
        carbs = lockedCarbs;
        const remaining = calories - (carbs * 4);
        protein = Math.round((remaining * 0.5) / 4);
        fat = Math.round((remaining * 0.5) / 9);
      } else if (lockedFat !== null) {
        fat = lockedFat;
        const remaining = calories - (fat * 9);
        protein = Math.round((remaining * 0.4) / 4);
        carbs = Math.round((remaining * 0.6) / 4);
      }
    } else {
      // No macros locked - use default ratios
      protein = Math.round((calories * 0.3) / 4);
      carbs = Math.round((calories * 0.4) / 4);
      fat = Math.round((calories * 0.3) / 9);
    }

    return {
      protein: Math.max(0, protein),
      carbs: Math.max(0, carbs),
      fat: Math.max(0, fat),
    };
  }, [calorieTarget, lockedMacros]);

  const totalCalories = useMemo(() => {
    return calculatedMacros.protein * 4 + calculatedMacros.carbs * 4 + calculatedMacros.fat * 9;
  }, [calculatedMacros]);

  const validation = useMemo((): MacroValidationResults => {
    return validateMacros(
      parseInt(calorieTarget) || 0,
      calculatedMacros.protein,
      calculatedMacros.carbs,
      calculatedMacros.fat,
      userProfile
    );
  }, [calorieTarget, calculatedMacros, userProfile]);

  const profileComplete = hasCompleteProfile(userProfile);
  const missingFields = getMissingProfileFields(userProfile);
  const canSave = validation.overall.level !== 'danger';

  const handleSave = async () => {
    if (!user) return;
    if (!canSave) {
      toast.error('Please fix the dangerous values before saving');
      return;
    }

    try {
      setSaving(true);
      await api.updateProfile({
        calorie_target: parseInt(calorieTarget) || null,
        protein_target_g: calculatedMacros.protein,
        carbs_target_g: calculatedMacros.carbs,
        fat_target_g: calculatedMacros.fat,
      });
      toast.success('Macro targets saved!');
    } catch (err: any) {
      // Ignore 401 errors (user logged out or deleted) - not a real error
      if (err?.response?.status !== 401) {
        toast.error('Failed to save targets');
      }
    } finally {
      setSaving(false);
    }
  };

  const getValidationColor = (level: ValidationLevel): string => {
    switch (level) {
      case 'danger':
        return colors.error;
      case 'warning':
        return colors.warning;
      default:
        return colors.success;
    }
  };

  const getValidationIcon = (level: ValidationLevel): keyof typeof Ionicons.glyphMap => {
    switch (level) {
      case 'danger':
        return 'alert-circle';
      case 'warning':
        return 'warning';
      default:
        return 'checkmark-circle';
    }
  };

  const getMacroValue = (macro: MacroName): number => {
    // If this macro is locked, return the locked value
    if (lockedMacros[macro] !== null) {
      return lockedMacros[macro]!;
    }
    // Otherwise return the calculated value
    return calculatedMacros[macro];
  };

  const isLocked = (macro: MacroName): boolean => {
    return lockedMacros[macro] !== null;
  };

  const handleMacroPress = (macro: MacroName) => {
    const currentValue = getMacroValue(macro);

    if (isLocked(macro)) {
      // If already locked, just make it editable
      setEditingMacro(macro);
    } else {
      // Lock this macro with its current value
      // Count current locks
      const lockedCount = [lockedMacros.protein, lockedMacros.carbs, lockedMacros.fat]
        .filter(v => v !== null).length;

      if (lockedCount >= 2) {
        // Already have 2 locked - unlock the one that's not being edited, then lock this one
        // Find a locked macro that isn't the editing one
        const macroToUnlock = (['protein', 'carbs', 'fat'] as MacroName[])
          .find(m => m !== macro && lockedMacros[m] !== null && m !== editingMacro);

        if (macroToUnlock) {
          setLockedMacros(prev => ({
            ...prev,
            [macroToUnlock]: null,
            [macro]: currentValue,
          }));
        }
      } else {
        // Less than 2 locked - just lock this one
        setLockedMacros(prev => ({
          ...prev,
          [macro]: currentValue,
        }));
      }
      setEditingMacro(macro);
    }
  };

  const handleMacroValueChange = (macro: MacroName, value: string) => {
    const numValue = parseInt(value) || 0;
    setLockedMacros(prev => ({
      ...prev,
      [macro]: numValue,
    }));
  };

  // Get quick fix suggestions for each macro
  const getFixSuggestion = (macro: MacroType): QuickFixSuggestion | null => {
    const value = getMacroValue(macro as MacroName);
    return getQuickFixSuggestion(macro, value, userProfile);
  };

  const handleApplyFix = (fix: QuickFixSuggestion) => {
    // Count current locks
    const lockedCount = [lockedMacros.protein, lockedMacros.carbs, lockedMacros.fat]
      .filter(v => v !== null).length;

    if (lockedCount >= 2) {
      // Already have 2 locked - find the unlocked one (which should be the one we're fixing)
      // and set it to the suggested value, unlocking one of the others
      const unlockedMacro = (['protein', 'carbs', 'fat'] as MacroName[])
        .find(m => lockedMacros[m] === null);

      if (unlockedMacro === fix.macro) {
        // The fix is for the unlocked macro - we need to unlock one of the existing locks
        // Find a locked macro that isn't being edited
        const macroToUnlock = (['protein', 'carbs', 'fat'] as MacroName[])
          .find(m => m !== fix.macro && lockedMacros[m] !== null && m !== editingMacro);

        if (macroToUnlock) {
          setLockedMacros(prev => ({
            ...prev,
            [macroToUnlock]: null,
            [fix.macro]: fix.suggestedValue,
          }));
        }
      }
    } else {
      // Less than 2 locked - just add this lock (keeps existing lock)
      setLockedMacros(prev => ({
        ...prev,
        [fix.macro]: fix.suggestedValue,
      }));
    }

    setEditingMacro(fix.macro);
    toast.success(`${fix.macro.charAt(0).toUpperCase() + fix.macro.slice(1)} adjusted to ${fix.suggestedValue}g`);
  };

  const renderMacroCard = (macro: MacroName, label: string, color: string) => {
    const macroIsLocked = isLocked(macro);
    const isEditing = editingMacro === macro && macroIsLocked;
    const value = getMacroValue(macro);
    const cals = macro === 'fat' ? value * 9 : value * 4;
    const macroValidation = validation[macro];
    const hasIssue = macroValidation.level !== 'ok';

    return (
      <TouchableOpacity
        key={macro}
        style={[
          styles.macroCard,
          {
            backgroundColor: macroIsLocked ? color + '20' : colors.background,
            borderColor: hasIssue ? getValidationColor(macroValidation.level) : (macroIsLocked ? color : colors.border),
            borderRadius: radius.md,
          },
        ]}
        onPress={() => handleMacroPress(macro)}
        activeOpacity={0.7}
      >
        <View style={styles.macroHeader}>
          <Text style={[styles.macroLabel, { color: macroIsLocked ? color : colors.textSecondary }]}>
            {label}
          </Text>
          {macroIsLocked && <Ionicons name="lock-closed" size={14} color={color} />}
          {hasIssue && (
            <Ionicons
              name={getValidationIcon(macroValidation.level)}
              size={14}
              color={getValidationColor(macroValidation.level)}
              style={{ marginLeft: 4 }}
            />
          )}
        </View>

        {isEditing ? (
          <TextInput
            style={[styles.macroInput, { color: colors.text }]}
            value={String(lockedMacros[macro] || '')}
            onChangeText={(text) => handleMacroValueChange(macro, text)}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            selectTextOnFocus
            autoFocus
            maxLength={4}
          />
        ) : (
          <Text style={[styles.macroValue, { color: colors.text }]}>{value}</Text>
        )}

        <Text style={[styles.macroUnit, { color: colors.textMuted }]}>grams</Text>
        <Text style={[styles.macroCals, { color: colors.textSecondary }]}>{cals} cal</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]} edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>Daily Targets</Text>
              <Text style={[styles.title, { color: colors.text }]}>Your Macros</Text>
            </View>
            <TouchableOpacity
              style={[styles.settingsButton, { backgroundColor: colors.card, borderRadius: radius.sm }]}
              onPress={() => setShowProfileModal(true)}
            >
              <Ionicons name="person-circle-outline" size={28} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Calorie Target */}
          <View style={[styles.calorieCard, { backgroundColor: colors.primary, borderRadius: radius.lg }]}>
            <Text style={styles.calorieLabel}>Daily Calories</Text>
            <View style={styles.calorieInputRow}>
              <TextInput
                style={styles.calorieInput}
                value={calorieTarget}
                onChangeText={setCalorieTarget}
                keyboardType="number-pad"
                placeholder="2000"
                placeholderTextColor="rgba(255,255,255,0.5)"
                selectTextOnFocus
                maxLength={5}
              />
              <Text style={styles.calorieUnit}>kcal</Text>
            </View>
          </View>

          {/* Incomplete Profile Warning */}
          {!profileComplete && (
            <TouchableOpacity
              style={[styles.warningBox, { backgroundColor: colors.warning + '20', borderRadius: radius.md }]}
              onPress={() => setShowProfileModal(true)}
            >
              <Ionicons name="person-outline" size={20} color={colors.warning} />
              <View style={styles.warningContent}>
                <Text style={[styles.warningTitle, { color: colors.warning }]}>
                  Complete your profile for personalized limits
                </Text>
                <Text style={[styles.warningText, { color: colors.textSecondary }]}>
                  Missing: {missingFields.join(', ')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.warning} />
            </TouchableOpacity>
          )}

          {/* Instructions */}
          <View style={[styles.instructionBox, { backgroundColor: colors.card, borderRadius: radius.md }]}>
            <Ionicons name="information-circle" size={20} color={colors.primary} />
            <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
              Tap a macro to lock it. Lock up to 2 macros and we'll calculate the third to match your calorie goal.
            </Text>
          </View>

          {/* Macro Cards - Inline rendering to prevent re-mount */}
          <View style={styles.macrosGrid}>
            {renderMacroCard('protein', 'Protein', '#3B82F6')}
            {renderMacroCard('carbs', 'Carbs', '#F59E0B')}
            {renderMacroCard('fat', 'Fat', '#10B981')}
          </View>

          {/* Summary */}
          <View style={[styles.summaryBox, { backgroundColor: colors.card, borderRadius: radius.md }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Calculated Total</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{totalCalories} kcal</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Target</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{calorieTarget || 0} kcal</Text>
            </View>
            {Math.abs(totalCalories - (parseInt(calorieTarget) || 0)) > 50 && (
              <Text style={[styles.summaryNote, { color: colors.warning }]}>
                Adjust your locked macro to better match your calorie target
              </Text>
            )}
          </View>

          {/* Validation Alerts */}
          {validation.calories.level !== 'ok' && (
            <View
              style={[
                styles.validationAlert,
                {
                  backgroundColor: getValidationColor(validation.calories.level) + '15',
                  borderLeftColor: getValidationColor(validation.calories.level),
                  borderRadius: radius.sm,
                },
              ]}
            >
              <Ionicons
                name={getValidationIcon(validation.calories.level)}
                size={18}
                color={getValidationColor(validation.calories.level)}
              />
              <Text style={[styles.validationText, { color: colors.text }]}>
                {validation.calories.message}
              </Text>
            </View>
          )}

          {validation.protein.level !== 'ok' && (() => {
            const fix = getFixSuggestion('protein');
            return (
              <View
                style={[
                  styles.validationAlert,
                  {
                    backgroundColor: getValidationColor(validation.protein.level) + '15',
                    borderLeftColor: getValidationColor(validation.protein.level),
                    borderRadius: radius.sm,
                  },
                ]}
              >
                <Ionicons
                  name={getValidationIcon(validation.protein.level)}
                  size={18}
                  color={getValidationColor(validation.protein.level)}
                />
                <View style={styles.validationContent}>
                  <Text style={[styles.validationText, { color: colors.text }]}>
                    <Text style={styles.validationLabel}>Protein: </Text>
                    {validation.protein.message}
                  </Text>
                  {fix && !isLocked('protein') && (
                    <TouchableOpacity
                      style={[styles.fixButton, { backgroundColor: colors.primary, borderRadius: radius.sm }]}
                      onPress={() => handleApplyFix(fix)}
                    >
                      <Ionicons name="flash" size={14} color={colors.white} />
                      <Text style={[styles.fixButtonText, { color: colors.white }]}>{fix.label}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })()}

          {validation.carbs.level !== 'ok' && (() => {
            const fix = getFixSuggestion('carbs');
            return (
              <View
                style={[
                  styles.validationAlert,
                  {
                    backgroundColor: getValidationColor(validation.carbs.level) + '15',
                    borderLeftColor: getValidationColor(validation.carbs.level),
                    borderRadius: radius.sm,
                  },
                ]}
              >
                <Ionicons
                  name={getValidationIcon(validation.carbs.level)}
                  size={18}
                  color={getValidationColor(validation.carbs.level)}
                />
                <View style={styles.validationContent}>
                  <Text style={[styles.validationText, { color: colors.text }]}>
                    <Text style={styles.validationLabel}>Carbs: </Text>
                    {validation.carbs.message}
                  </Text>
                  {fix && !isLocked('carbs') && (
                    <TouchableOpacity
                      style={[styles.fixButton, { backgroundColor: colors.primary, borderRadius: radius.sm }]}
                      onPress={() => handleApplyFix(fix)}
                    >
                      <Ionicons name="flash" size={14} color={colors.white} />
                      <Text style={[styles.fixButtonText, { color: colors.white }]}>{fix.label}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })()}

          {validation.fat.level !== 'ok' && (() => {
            const fix = getFixSuggestion('fat');
            return (
              <View
                style={[
                  styles.validationAlert,
                  {
                    backgroundColor: getValidationColor(validation.fat.level) + '15',
                    borderLeftColor: getValidationColor(validation.fat.level),
                    borderRadius: radius.sm,
                  },
                ]}
              >
                <Ionicons
                  name={getValidationIcon(validation.fat.level)}
                  size={18}
                  color={getValidationColor(validation.fat.level)}
                />
                <View style={styles.validationContent}>
                  <Text style={[styles.validationText, { color: colors.text }]}>
                    <Text style={styles.validationLabel}>Fat: </Text>
                    {validation.fat.message}
                  </Text>
                  {fix && !isLocked('fat') && (
                    <TouchableOpacity
                      style={[styles.fixButton, { backgroundColor: colors.primary, borderRadius: radius.sm }]}
                      onPress={() => handleApplyFix(fix)}
                    >
                      <Ionicons name="flash" size={14} color={colors.white} />
                      <Text style={[styles.fixButtonText, { color: colors.white }]}>{fix.label}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })()}

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: !canSave
                  ? colors.error + '80'
                  : saving
                  ? colors.textMuted
                  : colors.primary,
                borderRadius: radius.md,
              },
            ]}
            onPress={handleSave}
            disabled={saving || !canSave}
          >
            {saving ? (
              <ActivityIndicator color={colors.white} />
            ) : !canSave ? (
              <View style={styles.saveButtonContent}>
                <Ionicons name="alert-circle" size={20} color={colors.white} />
                <Text style={styles.saveButtonText}>Fix Issues to Save</Text>
              </View>
            ) : (
              <Text style={styles.saveButtonText}>Save Targets</Text>
            )}
          </TouchableOpacity>

          {/* Disclaimer */}
          <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
            These are estimates. Consult a healthcare professional for personalized nutrition advice.
          </Text>
        </ScrollView>

        <ProfileSettingsModal
          visible={showProfileModal}
          onClose={handleProfileModalClose}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  settingsButton: {
    padding: 8,
  },
  calorieCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  calorieLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  calorieInputRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  calorieInput: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    minWidth: 140,
  },
  calorieUnit: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 8,
  },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 20,
    gap: 10,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  macrosGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  macroCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  macroLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  macroInput: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
    padding: 0,
    minHeight: 36,
  },
  macroValue: {
    fontSize: 28,
    fontWeight: '700',
    minHeight: 36,
  },
  macroUnit: {
    fontSize: 11,
    marginTop: 2,
  },
  macroCals: {
    fontSize: 11,
    marginTop: 4,
  },
  summaryBox: {
    padding: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryNote: {
    fontSize: 13,
    marginTop: 8,
    fontStyle: 'italic',
  },
  saveButton: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 16,
    gap: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  warningText: {
    fontSize: 13,
  },
  validationAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    gap: 10,
  },
  validationContent: {
    flex: 1,
  },
  validationText: {
    fontSize: 13,
    lineHeight: 18,
  },
  validationLabel: {
    fontWeight: '600',
  },
  fixButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 10,
    gap: 6,
  },
  fixButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
