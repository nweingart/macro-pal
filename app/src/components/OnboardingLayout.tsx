import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingProgress } from './OnboardingProgress';
import { useTheme } from '../context/ThemeContext';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps?: number;
  onContinue: () => void;
  onBack?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  showProgress?: boolean;
  showBack?: boolean;
}

export function OnboardingLayout({
  children,
  currentStep,
  totalSteps = 22,
  onContinue,
  onBack,
  continueLabel = 'Continue',
  continueDisabled = false,
  showProgress = true,
  showBack = true,
}: OnboardingLayoutProps) {
  const { colors, radius } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.white }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {showBack && currentStep > 1 && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={28} color={colors.textSecondary} />
          </TouchableOpacity>
        )}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>

        <View style={styles.footer}>
          {showProgress && (
            <OnboardingProgress totalSteps={totalSteps} currentStep={currentStep} />
          )}

          <TouchableOpacity
            style={[
              styles.continueButton,
              {
                backgroundColor: continueDisabled ? colors.textMuted : colors.primary,
                borderRadius: radius.md,
              },
            ]}
            onPress={onContinue}
            disabled={continueDisabled}
          >
            <Text style={[styles.continueButtonText, { color: colors.white }]}>{continueLabel}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 8,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  continueButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});
