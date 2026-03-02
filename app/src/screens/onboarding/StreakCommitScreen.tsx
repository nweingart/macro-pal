import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingLayout } from '../../components/OnboardingLayout';

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

const DAYS = [1, 2, 3, 4, 5];

export function StreakCommitScreen({ onContinue, onBack }: Props) {
  const circleScales = DAYS.map(() => useSharedValue(0));

  useEffect(() => {
    circleScales.forEach((scale, index) => {
      scale.value = withDelay(200 + index * 150, withSpring(1, { damping: 10, stiffness: 180 }));
    });
  }, []);

  const circleStyles = circleScales.map((scale) =>
    useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }))
  );

  return (
    <OnboardingLayout
      currentStep={20}
      onContinue={onContinue}
      onBack={onBack}
      continueLabel="I'm In"
      showBack={true}
    >
      <View style={styles.content}>
        <Text style={styles.label}>YOUR COMMITMENT</Text>
        <Text style={styles.title}>Commit to 5 days</Text>
        <Text style={styles.subtitle}>
          That's all it takes to build a real habit. Just 5 days of tracking your meals.
        </Text>

        <View style={styles.circlesRow}>
          {DAYS.map((day, index) => (
            <Animated.View key={day} style={[styles.circleWrapper, circleStyles[index]]}>
              <View style={[styles.circle, index === 0 && styles.circleCompleted]}>
                {index === 0 ? (
                  <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                ) : (
                  <Text style={styles.circleDay}>{day}</Text>
                )}
              </View>
              <Text style={[styles.dayLabel, index === 0 && styles.dayLabelCompleted]}>
                Day {day}
              </Text>
            </Animated.View>
          ))}
        </View>

        <View style={styles.callout}>
          <Ionicons name="sparkles" size={20} color="#F97316" />
          <Text style={styles.calloutText}>Day 1 is already done!</Text>
        </View>
      </View>
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
    color: '#F97316',
    letterSpacing: 1,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    alignSelf: 'flex-start',
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 40,
    alignSelf: 'flex-start',
    lineHeight: 24,
  },
  circlesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  circleWrapper: {
    alignItems: 'center',
  },
  circle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
  },
  circleCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  circleDay: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  dayLabelCompleted: {
    color: '#10B981',
    fontWeight: '600',
  },
  callout: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  calloutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F97316',
  },
});
