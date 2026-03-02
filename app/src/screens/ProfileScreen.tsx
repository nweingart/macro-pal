import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { UserProfile } from '../types';
import { toISODate } from '../utils/date';

type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
type DietPlan = 'maintain' | 'lose' | 'gain';
type Gender = 'male' | 'female' | 'other';

// Macro calculation helper component
function MacroCalculation({ calories, protein, carbs, fat, colors }: {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  colors: any;
}) {
  const proteinCals = protein * 4;
  const carbsCals = carbs * 4;
  const fatCals = fat * 9;
  const totalMacroCals = proteinCals + carbsCals + fatCals;
  const difference = calories - totalMacroCals;

  if (calories === 0 && protein === 0 && carbs === 0 && fat === 0) {
    return null;
  }

  const isBalanced = Math.abs(difference) <= 50; // Allow 50 cal tolerance
  const isOver = difference < -50;

  return (
    <View style={[styles.macroCalcBox, {
      backgroundColor: isBalanced ? '#ECFDF5' : isOver ? '#FEF2F2' : '#FEF3C7',
      marginTop: 16,
    }]}>
      <Text style={[styles.macroCalcTitle, {
        color: isBalanced ? '#065F46' : isOver ? '#991B1B' : '#92400E'
      }]}>
        Calorie Breakdown
      </Text>
      <View style={styles.macroCalcRow}>
        <Text style={styles.macroCalcItem}>Protein: {protein}g × 4 = {proteinCals} cal</Text>
      </View>
      <View style={styles.macroCalcRow}>
        <Text style={styles.macroCalcItem}>Carbs: {carbs}g × 4 = {carbsCals} cal</Text>
      </View>
      <View style={styles.macroCalcRow}>
        <Text style={styles.macroCalcItem}>Fat: {fat}g × 9 = {fatCals} cal</Text>
      </View>
      <View style={[styles.macroCalcRow, styles.macroCalcTotal]}>
        <Text style={[styles.macroCalcItem, { fontWeight: '600' }]}>
          Total: {totalMacroCals} / {calories} cal
        </Text>
      </View>
      {!isBalanced && (
        <Text style={[styles.macroCalcWarning, {
          color: isOver ? '#991B1B' : '#92400E'
        }]}>
          {isOver
            ? `Macros exceed calories by ${Math.abs(difference)} cal. Reduce macros or increase calorie target.`
            : `${difference} calories unaccounted for. Add more protein, carbs, or fat.`
          }
        </Text>
      )}
      {isBalanced && (
        <Text style={[styles.macroCalcWarning, { color: '#065F46' }]}>
          Macros are balanced with your calorie target.
        </Text>
      )}
    </View>
  );
}

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string }[] = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'light', label: 'Light' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'active', label: 'Active' },
  { value: 'very_active', label: 'Very Active' },
];

const DIET_PLANS: { value: DietPlan; label: string }[] = [
  { value: 'lose', label: 'Lose Weight' },
  { value: 'maintain', label: 'Maintain' },
  { value: 'gain', label: 'Gain Weight' },
];

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

function formatBirthday(date: Date): string {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function calculateAge(birthday: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const monthDiff = today.getMonth() - birthday.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
    age--;
  }
  return age;
}

export function ProfileScreen() {
  const { colors, radius, shadows } = useTheme();
  const { signOut, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [gender, setGender] = useState<Gender | null>(null);
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [calorieTarget, setCalorieTarget] = useState('');
  const [proteinTarget, setProteinTarget] = useState('');
  const [carbsTarget, setCarbsTarget] = useState('');
  const [fatTarget, setFatTarget] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profile = await api.getProfile();
      if (profile) {
        setGender(profile.gender as Gender);
        if (profile.birthday) {
          setBirthday(new Date(profile.birthday));
        }
        if (profile.height_inches) {
          setHeightFeet(String(Math.floor(profile.height_inches / 12)));
          setHeightInches(String(profile.height_inches % 12));
        }
        setWeight(profile.weight_lbs ? String(profile.weight_lbs) : '');
        setActivityLevel(profile.activity_level as ActivityLevel);
        setDietPlan(profile.diet_plan as DietPlan);
        setCalorieTarget(profile.calorie_target ? String(profile.calorie_target) : '');
        setProteinTarget(profile.protein_target_g ? String(profile.protein_target_g) : '');
        setCarbsTarget(profile.carbs_target_g ? String(profile.carbs_target_g) : '');
        setFatTarget(profile.fat_target_g ? String(profile.fat_target_g) : '');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const heightTotal =
        (parseInt(heightFeet) || 0) * 12 + (parseInt(heightInches) || 0);

      await api.updateProfile({
        gender,
        birthday: birthday ? toISODate(birthday) : null,
        height_inches: heightTotal || null,
        weight_lbs: parseFloat(weight) || null,
        activity_level: activityLevel,
        diet_plan: dietPlan,
        calorie_target: parseInt(calorieTarget) || null,
        protein_target_g: parseInt(proteinTarget) || null,
        carbs_target_g: parseInt(carbsTarget) || null,
        fat_target_g: parseInt(fatTarget) || null,
      });

      Alert.alert('Success', 'Profile saved successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setBirthday(selectedDate);
    }
  };

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 13);

  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 120);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This will permanently delete all your data including your food log, food library, and profile. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            // Second confirmation
            Alert.alert(
              'Final Confirmation',
              'This is your last chance. All your data will be permanently deleted.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete My Account',
                  style: 'destructive',
                  onPress: deleteAccount,
                },
              ]
            );
          },
        },
      ]
    );
  };

  const deleteAccount = async () => {
    try {
      setSaving(true);
      await api.deleteAccount();
      // Sign out after deletion (server-side auth is already deleted)
      await signOut();
    } catch (err) {
      Alert.alert('Error', 'Failed to delete account. Please try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={[styles.section, { backgroundColor: colors.card, borderRadius: radius.md }, shadows.small]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Body Stats</Text>

        <Text style={[styles.label, { color: colors.text }]}>Gender</Text>
        <View style={styles.buttonGroup}>
          {GENDERS.map((g) => (
            <TouchableOpacity
              key={g.value}
              style={[
                styles.optionButton,
                { backgroundColor: gender === g.value ? colors.primary : colors.borderLight, borderRadius: radius.sm },
              ]}
              onPress={() => setGender(g.value)}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  { color: gender === g.value ? colors.white : colors.textSecondary },
                  gender === g.value && { fontWeight: '500' },
                ]}
              >
                {g.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Birthday</Text>
        <TouchableOpacity
          style={[styles.birthdayButton, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: radius.sm }]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={[styles.birthdayText, { color: birthday ? colors.text : colors.textMuted }]}>
            {birthday ? formatBirthday(birthday) : 'Select birthday'}
          </Text>
          {birthday && (
            <Text style={[styles.ageDisplay, { color: colors.textSecondary }]}>
              ({calculateAge(birthday)} years old)
            </Text>
          )}
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={birthday || new Date(Date.now() - 30 * 365 * 24 * 60 * 60 * 1000)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={maxDate}
            minimumDate={minDate}
          />
        )}

        <Text style={[styles.label, { color: colors.text }]}>Height</Text>
        <View style={styles.heightRow}>
          <View style={styles.heightField}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: radius.sm, color: colors.text }]}
              value={heightFeet}
              onChangeText={setHeightFeet}
              keyboardType="numeric"
              placeholder="5"
              placeholderTextColor={colors.textMuted}
              maxLength={1}
            />
            <Text style={[styles.heightUnit, { color: colors.textSecondary }]}>ft</Text>
          </View>
          <View style={styles.heightField}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: radius.sm, color: colors.text }]}
              value={heightInches}
              onChangeText={setHeightInches}
              keyboardType="numeric"
              placeholder="10"
              placeholderTextColor={colors.textMuted}
              maxLength={2}
            />
            <Text style={[styles.heightUnit, { color: colors.textSecondary }]}>in</Text>
          </View>
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Weight (lbs)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: radius.sm, color: colors.text }]}
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          placeholder="170"
          placeholderTextColor={colors.textMuted}
          maxLength={4}
        />

        <Text style={[styles.label, { color: colors.text }]}>Activity Level</Text>
        <View style={styles.buttonGroup}>
          {ACTIVITY_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.value}
              style={[
                styles.optionButton,
                { backgroundColor: activityLevel === level.value ? colors.primary : colors.borderLight, borderRadius: radius.sm },
              ]}
              onPress={() => setActivityLevel(level.value)}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  { color: activityLevel === level.value ? colors.white : colors.textSecondary },
                  activityLevel === level.value && { fontWeight: '500' },
                ]}
              >
                {level.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Goal</Text>
        <View style={styles.buttonGroup}>
          {DIET_PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.value}
              style={[
                styles.optionButton,
                { backgroundColor: dietPlan === plan.value ? colors.primary : colors.borderLight, borderRadius: radius.sm },
              ]}
              onPress={() => setDietPlan(plan.value)}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  { color: dietPlan === plan.value ? colors.white : colors.textSecondary },
                  dietPlan === plan.value && { fontWeight: '500' },
                ]}
              >
                {plan.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderRadius: radius.md }, shadows.small]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Targets</Text>

        <Text style={[styles.label, { color: colors.text }]}>Calories</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: radius.sm, color: colors.text }]}
          value={calorieTarget}
          onChangeText={setCalorieTarget}
          keyboardType="numeric"
          placeholder="2000"
          placeholderTextColor={colors.textMuted}
          maxLength={5}
        />

        <View style={styles.macroRow}>
          <View style={styles.macroField}>
            <Text style={[styles.label, { color: colors.text }]}>Protein (g)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: radius.sm, color: colors.text }]}
              value={proteinTarget}
              onChangeText={setProteinTarget}
              keyboardType="numeric"
              placeholder="150"
              placeholderTextColor={colors.textMuted}
              maxLength={4}
            />
          </View>
          <View style={styles.macroField}>
            <Text style={[styles.label, { color: colors.text }]}>Carbs (g)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: radius.sm, color: colors.text }]}
              value={carbsTarget}
              onChangeText={setCarbsTarget}
              keyboardType="numeric"
              placeholder="200"
              placeholderTextColor={colors.textMuted}
              maxLength={4}
            />
          </View>
          <View style={styles.macroField}>
            <Text style={[styles.label, { color: colors.text }]}>Fat (g)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: radius.sm, color: colors.text }]}
              value={fatTarget}
              onChangeText={setFatTarget}
              keyboardType="numeric"
              placeholder="65"
              placeholderTextColor={colors.textMuted}
              maxLength={4}
            />
          </View>
        </View>

        <MacroCalculation
          calories={parseInt(calorieTarget) || 0}
          protein={parseInt(proteinTarget) || 0}
          carbs={parseInt(carbsTarget) || 0}
          fat={parseInt(fatTarget) || 0}
          colors={colors}
        />
      </View>

      <TouchableOpacity
        style={[
          styles.saveButton,
          { backgroundColor: saving ? colors.textMuted : colors.primary, borderRadius: radius.md },
        ]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={[styles.saveButtonText, { color: colors.white }]}>Save Profile</Text>
        )}
      </TouchableOpacity>

      <View style={[styles.accountSection, { borderTopColor: colors.border }]}>
        <Text style={[styles.emailText, { color: colors.textSecondary }]}>{user?.email}</Text>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={[styles.signOutButtonText, { color: colors.error }]}>Sign Out</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteAccountButton} onPress={handleDeleteAccount}>
          <Text style={[styles.deleteAccountButtonText, { color: colors.textMuted }]}>
            Delete Account
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
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
  birthdayButton: {
    padding: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  birthdayText: {
    fontSize: 16,
  },
  ageDisplay: {
    fontSize: 14,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  optionButtonText: {
    fontSize: 14,
  },
  heightRow: {
    flexDirection: 'row',
    gap: 12,
  },
  heightField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heightUnit: {
    marginLeft: 8,
    fontSize: 16,
  },
  macroRow: {
    flexDirection: 'row',
    gap: 12,
  },
  macroField: {
    flex: 1,
  },
  saveButton: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  accountSection: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  emailText: {
    fontSize: 14,
    marginBottom: 12,
  },
  signOutButton: {
    padding: 12,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  deleteAccountButton: {
    padding: 12,
    marginTop: 8,
  },
  deleteAccountButtonText: {
    fontSize: 14,
  },
  macroCalcBox: {
    borderRadius: 12,
    padding: 16,
  },
  macroCalcTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  macroCalcRow: {
    paddingVertical: 2,
  },
  macroCalcItem: {
    fontSize: 13,
    color: '#374151',
  },
  macroCalcTotal: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
    paddingTop: 8,
  },
  macroCalcWarning: {
    fontSize: 13,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
