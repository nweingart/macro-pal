import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { OnboardingLayout } from '../../components/OnboardingLayout';
import { Mascot } from '../../components/Mascot';
import { useFunnelStep } from '@nedweingart/funnel-kit-react-native';

interface Props {
  onContinue: () => void;
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  firstFood?: {
    name: string;
    calories: number;
  };
}

export function ReadyScreen({ onContinue, targets, firstFood }: Props) {
  useFunnelStep('Ready');
  const checkScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    checkScale.value = withSequence(
      withSpring(1.2, { damping: 8, stiffness: 150 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
    contentOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
  }, []);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  return (
    <OnboardingLayout
      currentStep={18}
      onContinue={onContinue}
      continueLabel="Start Tracking"
      showBack={false}
    >
      <View style={styles.content}>
        <Animated.View style={[styles.mascotContainer, checkStyle]}>
          <Mascot size={100} mood="celebrating" />
        </Animated.View>

        <Text style={styles.title}>You're all set!</Text>
        <Text style={styles.subtitle}>
          Your Macro Pal is ready to help you hit your goals!
        </Text>

        <Animated.View style={[styles.summaryContainer, contentStyle]}>
          {firstFood && (
            <View style={styles.firstFoodCard}>
              <Text style={styles.firstFoodLabel}>First food logged</Text>
              <Text style={styles.firstFoodName}>{firstFood.name}</Text>
              <Text style={styles.firstFoodCalories}>{firstFood.calories} kcal</Text>
            </View>
          )}

          <View style={styles.targetsCard}>
            <Text style={styles.targetsTitle}>Your Daily Targets</Text>
            <View style={styles.targetRow}>
              <View style={styles.targetItem}>
                <Text style={styles.targetValue}>{targets.calories}</Text>
                <Text style={styles.targetLabel}>Calories</Text>
              </View>
              <View style={styles.targetDivider} />
              <View style={styles.targetItem}>
                <Text style={styles.targetValue}>{targets.protein}g</Text>
                <Text style={styles.targetLabel}>Protein</Text>
              </View>
              <View style={styles.targetDivider} />
              <View style={styles.targetItem}>
                <Text style={styles.targetValue}>{targets.carbs}g</Text>
                <Text style={styles.targetLabel}>Carbs</Text>
              </View>
              <View style={styles.targetDivider} />
              <View style={styles.targetItem}>
                <Text style={styles.targetValue}>{targets.fat}g</Text>
                <Text style={styles.targetLabel}>Fat</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
  },
  mascotContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryContainer: {
    width: '100%',
    gap: 16,
  },
  firstFoodCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  firstFoodLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  firstFoodName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 2,
  },
  firstFoodCalories: {
    fontSize: 14,
    color: '#10B981',
  },
  targetsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 14,
  },
  targetsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetItem: {
    flex: 1,
    alignItems: 'center',
  },
  targetValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  targetLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  targetDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5E7EB',
  },
});
