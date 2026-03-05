import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../hooks/useToast';
import { api } from '../services/api';
import { LegalModal } from './LegalModal';

type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
type DietPlan = 'maintain' | 'lose' | 'gain';
type Gender = 'male' | 'female' | 'other';

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; description: string }[] = [
  { value: 'sedentary', label: 'Sedentary', description: 'Little or no exercise' },
  { value: 'light', label: 'Light', description: '1-3 days/week' },
  { value: 'moderate', label: 'Moderate', description: '3-5 days/week' },
  { value: 'active', label: 'Active', description: '6-7 days/week' },
  { value: 'very_active', label: 'Very Active', description: 'Athlete level' },
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

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function ProfileSettingsModal({ visible, onClose }: Props) {
  const { colors, radius } = useTheme();
  const { signOut, user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [legalVisible, setLegalVisible] = useState(false);
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms'>('privacy');

  const [gender, setGender] = useState<Gender | null>(null);
  const [age, setAge] = useState('');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);

  useEffect(() => {
    if (visible) {
      loadProfile();
    }
  }, [visible]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profile = await api.getProfile();
      if (profile) {
        setGender(profile.gender as Gender);
        setAge(profile.age ? String(profile.age) : '');
        if (profile.height_inches) {
          setHeightFeet(String(Math.floor(profile.height_inches / 12)));
          setHeightInches(String(profile.height_inches % 12));
        }
        setWeight(profile.weight_lbs ? String(profile.weight_lbs) : '');
        setActivityLevel(profile.activity_level as ActivityLevel);
        setDietPlan(profile.diet_plan as DietPlan);
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
        age: parseInt(age) || null,
        height_inches: heightTotal || null,
        weight_lbs: parseFloat(weight) || null,
        activity_level: activityLevel,
        diet_plan: dietPlan,
      });

      toast.success('Profile updated!');
      onClose();
    } catch (err) {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    onClose();
    signOut();
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

      // Sign out FIRST to clear user state before closing modal
      // This prevents other screens from making API calls during re-render
      await signOut();

      onClose();
    } catch (err) {
      toast.error('Failed to delete account');
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityLabel="Close" accessibilityRole="button">
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Profile Settings</Text>
          <View style={styles.closeButton} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
          <ScrollView contentContainerStyle={styles.content}>
            {/* Account Info */}
            <View style={[styles.section, { backgroundColor: colors.card, borderRadius: radius.md }]}>
              <View style={styles.accountRow}>
                <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.accountEmail, { color: colors.text }]}>{user?.email}</Text>
              </View>
            </View>

            {/* Personal Info */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PERSONAL INFO</Text>
            <View style={[styles.section, { backgroundColor: colors.card, borderRadius: radius.md }]}>
              {/* Gender */}
              <Text style={[styles.fieldLabel, { color: colors.text }]}>Gender</Text>
              <View style={styles.buttonRow}>
                {GENDERS.map((g) => (
                  <TouchableOpacity
                    key={g.value}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: gender === g.value ? colors.primary : colors.background,
                        borderRadius: radius.sm,
                      },
                    ]}
                    onPress={() => setGender(g.value)}
                    accessibilityLabel={`Select ${g.label}`}
                    accessibilityRole="radio"
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        { color: gender === g.value ? colors.white : colors.textSecondary },
                      ]}
                    >
                      {g.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Age */}
              <Text style={[styles.fieldLabel, { color: colors.text }]}>Age</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, styles.inputSmall, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: radius.sm, color: colors.text }]}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  placeholder="30"
                  placeholderTextColor={colors.textMuted}
                  accessibilityLabel="Age in years"
                />
                <Text style={[styles.inputUnit, { color: colors.textSecondary }]}>years</Text>
              </View>

              {/* Height */}
              <Text style={[styles.fieldLabel, { color: colors.text }]}>Height</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, styles.inputSmall, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: radius.sm, color: colors.text }]}
                  value={heightFeet}
                  onChangeText={setHeightFeet}
                  keyboardType="numeric"
                  placeholder="5"
                  placeholderTextColor={colors.textMuted}
                  accessibilityLabel="Height in feet"
                />
                <Text style={[styles.inputUnit, { color: colors.textSecondary }]}>ft</Text>
                <TextInput
                  style={[styles.input, styles.inputSmall, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: radius.sm, color: colors.text }]}
                  value={heightInches}
                  onChangeText={setHeightInches}
                  keyboardType="numeric"
                  placeholder="10"
                  placeholderTextColor={colors.textMuted}
                  accessibilityLabel="Height in inches"
                />
                <Text style={[styles.inputUnit, { color: colors.textSecondary }]}>in</Text>
              </View>

              {/* Weight */}
              <Text style={[styles.fieldLabel, { color: colors.text }]}>Weight</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, styles.inputMedium, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: radius.sm, color: colors.text }]}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  placeholder="170"
                  placeholderTextColor={colors.textMuted}
                  accessibilityLabel="Weight in pounds"
                />
                <Text style={[styles.inputUnit, { color: colors.textSecondary }]}>lbs</Text>
              </View>
            </View>

            {/* Activity & Goals */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ACTIVITY & GOALS</Text>
            <View style={[styles.section, { backgroundColor: colors.card, borderRadius: radius.md }]}>
              {/* Activity Level */}
              <Text style={[styles.fieldLabel, { color: colors.text }]}>Activity Level</Text>
              <View style={styles.optionList}>
                {ACTIVITY_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level.value}
                    style={[
                      styles.optionRow,
                      {
                        backgroundColor: activityLevel === level.value ? colors.primaryLight : 'transparent',
                        borderRadius: radius.sm,
                      },
                    ]}
                    onPress={() => setActivityLevel(level.value)}
                    accessibilityLabel={`Select ${level.label} activity level`}
                    accessibilityRole="radio"
                  >
                    <View style={styles.optionRowContent}>
                      <Text
                        style={[
                          styles.optionRowLabel,
                          { color: activityLevel === level.value ? colors.primary : colors.text },
                        ]}
                      >
                        {level.label}
                      </Text>
                      <Text style={[styles.optionRowDesc, { color: colors.textMuted }]}>
                        {level.description}
                      </Text>
                    </View>
                    {activityLevel === level.value && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Diet Plan */}
              <Text style={[styles.fieldLabel, { color: colors.text, marginTop: 16 }]}>Goal</Text>
              <View style={styles.buttonRow}>
                {DIET_PLANS.map((plan) => (
                  <TouchableOpacity
                    key={plan.value}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: dietPlan === plan.value ? colors.primary : colors.background,
                        borderRadius: radius.sm,
                      },
                    ]}
                    onPress={() => setDietPlan(plan.value)}
                    accessibilityLabel={`Select ${plan.label}`}
                    accessibilityRole="radio"
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        { color: dietPlan === plan.value ? colors.white : colors.textSecondary },
                      ]}
                    >
                      {plan.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: saving ? colors.textMuted : colors.primary, borderRadius: radius.md },
              ]}
              onPress={handleSave}
              disabled={saving}
              accessibilityLabel="Save changes"
              accessibilityRole="button"
            >
              {saving ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>

            {/* Legal Links */}
            <View style={styles.legalSection}>
              <TouchableOpacity
                style={styles.legalRow}
                onPress={() => { setLegalTab('privacy'); setLegalVisible(true); }}
                accessibilityLabel="View privacy policy"
                accessibilityRole="button"
              >
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.legalRowText, { color: colors.textSecondary }]}>Privacy Policy</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.legalRow}
                onPress={() => { setLegalTab('terms'); setLegalVisible(true); }}
                accessibilityLabel="View terms of service"
                accessibilityRole="button"
              >
                <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.legalRowText, { color: colors.textSecondary }]}>Terms of Service</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Sign Out */}
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} accessibilityLabel="Sign out" accessibilityRole="button">
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
              <Text style={[styles.signOutText, { color: colors.error }]}>Sign Out</Text>
            </TouchableOpacity>

            {/* Delete Account */}
            <TouchableOpacity style={styles.deleteAccountButton} onPress={handleDeleteAccount} accessibilityLabel="Delete account" accessibilityRole="button">
              <Text style={[styles.deleteAccountText, { color: colors.textMuted }]}>
                Delete Account
              </Text>
            </TouchableOpacity>
          </ScrollView>

          <LegalModal
            visible={legalVisible}
            onClose={() => setLegalVisible(false)}
            initialTab={legalTab}
          />
          </>
        )}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    padding: 16,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountEmail: {
    fontSize: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    padding: 12,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    borderWidth: 1,
  },
  inputSmall: {
    width: 60,
  },
  inputMedium: {
    width: 100,
  },
  inputUnit: {
    fontSize: 16,
  },
  optionList: {
    gap: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  optionRowContent: {
    flex: 1,
  },
  optionRowLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  optionRowDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  saveButton: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '500',
  },
  deleteAccountButton: {
    alignItems: 'center',
    padding: 16,
    marginTop: 8,
  },
  deleteAccountText: {
    fontSize: 14,
  },
  legalSection: {
    marginTop: 16,
    marginBottom: 8,
    gap: 4,
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  legalRowText: {
    flex: 1,
    fontSize: 15,
  },
});
