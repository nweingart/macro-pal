import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OnboardingLayout } from '../../components/OnboardingLayout';
import { Mascot } from '../../components/Mascot';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  onContinue: () => void;
}

export function WelcomeScreen({ onContinue }: Props) {
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
});
