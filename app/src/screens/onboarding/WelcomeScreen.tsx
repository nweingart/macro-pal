import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { OnboardingLayout } from '../../components/OnboardingLayout';
import { Mascot } from '../../components/Mascot';
import { useTheme } from '../../context/ThemeContext';
import { useFunnelStep } from '@nedweingart/funnel-kit-react-native';

interface Props {
  onContinue: () => void;
  onLogin?: () => void;
}

export function WelcomeScreen({ onContinue, onLogin }: Props) {
  useFunnelStep('Welcome');
  const { colors } = useTheme();

  return (
    <OnboardingLayout
      currentStep={1}
      onContinue={onContinue}
      continueLabel="Get Started"
      showBack={false}
    >
      <View style={styles.content}>
        <View style={styles.mascotContainer}>
          <Mascot size={140} mood="excited" />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Welcome to{'\n'}Macro Pal</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Track your nutrition effortlessly with AI-powered food logging
        </Text>
        <View style={[styles.features, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.feature, { color: colors.text }]}>✓ Just describe what you ate</Text>
          <Text style={[styles.feature, { color: colors.text }]}>✓ Get accurate macro tracking</Text>
          <Text style={[styles.feature, { color: colors.text }]}>✓ Build better eating habits</Text>
        </View>
        <Text style={[styles.cta, { color: colors.primary }]}>
          Let's personalize your experience
        </Text>
        {onLogin && (
          <TouchableOpacity style={styles.loginLink} onPress={onLogin} accessibilityLabel="Already have an account? Log in" accessibilityRole="button">
            <Text style={[styles.loginText, { color: colors.textMuted }]}>
              Already have an account? <Text style={{ color: colors.primary }}>Log in</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascotContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  features: {
    alignSelf: 'stretch',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  feature: {
    fontSize: 16,
    marginBottom: 12,
  },
  cta: {
    fontSize: 15,
    fontWeight: '500',
  },
  loginLink: {
    marginTop: 20,
    paddingVertical: 8,
  },
  loginText: {
    fontSize: 14,
  },
});
