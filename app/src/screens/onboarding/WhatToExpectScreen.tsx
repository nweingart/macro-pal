import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { OnboardingLayout } from '../../components/OnboardingLayout';

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

const MILESTONES = [
  {
    day: 'Day 1',
    title: 'Log your meals',
    description: 'Just track what you eat. No pressure, no perfection.',
  },
  {
    day: 'Day 3',
    title: 'Notice patterns',
    description: 'You\'ll start seeing where your calories really go.',
  },
  {
    day: 'Day 5',
    title: 'Habits forming',
    description: 'Logging feels natural. You\'re building real momentum.',
  },
];

export function WhatToExpectScreen({ onContinue, onBack }: Props) {
  const milestoneOpacities = MILESTONES.map(() => useSharedValue(0));
  const milestoneTranslates = MILESTONES.map(() => useSharedValue(20));

  useEffect(() => {
    milestoneOpacities.forEach((opacity, index) => {
      opacity.value = withDelay(300 + index * 300, withTiming(1, { duration: 500 }));
    });
    milestoneTranslates.forEach((translate, index) => {
      translate.value = withDelay(300 + index * 300, withTiming(0, { duration: 500 }));
    });
  }, []);

  const milestoneStyles = milestoneOpacities.map((opacity, index) =>
    useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ translateY: milestoneTranslates[index].value }],
    }))
  );

  return (
    <OnboardingLayout
      currentStep={21}
      onContinue={onContinue}
      onBack={onBack}
      continueLabel="Let's Go"
      showBack={true}
    >
      <View style={styles.content}>
        <Text style={styles.label}>YOUR FIRST WEEK</Text>
        <Text style={styles.title}>What to expect</Text>
        <Text style={styles.subtitle}>
          Here's how your first 5 days will play out.
        </Text>

        <View style={styles.timeline}>
          {MILESTONES.map((milestone, index) => (
            <Animated.View key={index} style={milestoneStyles[index]}>
              <View style={styles.milestoneRow}>
                <View style={styles.timelineLeft}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  {index < MILESTONES.length - 1 && <View style={styles.stepConnector} />}
                </View>
                <View style={styles.milestoneContent}>
                  <Text style={styles.milestoneDay}>{milestone.day}</Text>
                  <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                  <Text style={styles.milestoneDescription}>{milestone.description}</Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    lineHeight: 24,
  },
  timeline: {
    gap: 0,
  },
  milestoneRow: {
    flexDirection: 'row',
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepConnector: {
    width: 2,
    flex: 1,
    minHeight: 24,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  milestoneContent: {
    flex: 1,
    paddingBottom: 24,
  },
  milestoneDay: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  milestoneTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  milestoneDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
