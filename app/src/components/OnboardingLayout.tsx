import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, Pattern, Circle, Rect } from 'react-native-svg';
import { OnboardingProgress } from './OnboardingProgress';
import { useTheme } from '../context/ThemeContext';

const EGGSHELL = '#FAF9F6';
const DOT_COLOR = '#d4d0c8';
const DOT_SPACING = 24;
const DOT_RADIUS = 1;

function DotTexture() {
  const { width, height } = Dimensions.get('window');
  return (
    <View style={styles.textureOverlay} pointerEvents="none">
      <Svg width={width} height={height}>
        <Defs>
          <Pattern id="dots" x="0" y="0" width={DOT_SPACING} height={DOT_SPACING} patternUnits="userSpaceOnUse">
            <Circle cx={DOT_SPACING / 2} cy={DOT_SPACING / 2} r={DOT_RADIUS} fill={DOT_COLOR} />
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill="url(#dots)" />
      </Svg>
    </View>
  );
}

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
    <SafeAreaView style={[styles.container, { backgroundColor: EGGSHELL }]}>
      <DotTexture />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {showBack && currentStep > 1 && (
          <TouchableOpacity style={styles.backButton} onPress={onBack} accessibilityLabel="Go back" accessibilityRole="button">
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

        <View style={[styles.footer, { backgroundColor: EGGSHELL }]}>
          {showProgress && (
            <OnboardingProgress totalSteps={totalSteps} currentStep={currentStep} />
          )}

          {continueLabel !== '' && (
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
              accessibilityLabel={continueLabel || 'Continue'}
              accessibilityRole="button"
            >
              <Text style={[styles.continueButtonText, { color: colors.white }]}>{continueLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textureOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    opacity: 0.5,
  },
  keyboardView: {
    flex: 1,
    zIndex: 1,
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
