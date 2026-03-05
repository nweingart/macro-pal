import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingLayout } from '../../components/OnboardingLayout';
import { Mascot } from '../../components/Mascot';
import { useFunnelStep } from '@nedweingart/funnel-kit-react-native';

interface Props {
  onContinue: () => void;
  firstFood?: { name: string; calories: number };
}

const STATS = [
  { icon: 'checkmark-circle' as const, label: 'Profile complete', color: '#10B981' },
  { icon: 'flag' as const, label: 'Goals defined', color: '#3B82F6' },
];

export function CongratulationsScreen({ onContinue, firstFood }: Props) {
  useFunnelStep('Congratulations');
  const mascotScale = useSharedValue(0);
  const card1Opacity = useSharedValue(0);
  const card1Scale = useSharedValue(0.8);
  const card2Opacity = useSharedValue(0);
  const card2Scale = useSharedValue(0.8);
  const card3Opacity = useSharedValue(0);
  const card3Scale = useSharedValue(0.8);
  const proofOpacity = useSharedValue(0);

  useEffect(() => {
    mascotScale.value = withSpring(1, { damping: 8, stiffness: 150 });
    card1Opacity.value = withDelay(300, withTiming(1, { duration: 400 }));
    card1Scale.value = withDelay(300, withSpring(1, { damping: 12, stiffness: 200 }));
    card2Opacity.value = withDelay(500, withTiming(1, { duration: 400 }));
    card2Scale.value = withDelay(500, withSpring(1, { damping: 12, stiffness: 200 }));
    card3Opacity.value = withDelay(700, withTiming(1, { duration: 400 }));
    card3Scale.value = withDelay(700, withSpring(1, { damping: 12, stiffness: 200 }));
    proofOpacity.value = withDelay(900, withTiming(1, { duration: 500 }));
  }, []);

  const mascotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mascotScale.value }],
  }));

  const card1Style = useAnimatedStyle(() => ({
    opacity: card1Opacity.value,
    transform: [{ scale: card1Scale.value }],
  }));

  const card2Style = useAnimatedStyle(() => ({
    opacity: card2Opacity.value,
    transform: [{ scale: card2Scale.value }],
  }));

  const card3Style = useAnimatedStyle(() => ({
    opacity: card3Opacity.value,
    transform: [{ scale: card3Scale.value }],
  }));

  const proofStyle = useAnimatedStyle(() => ({
    opacity: proofOpacity.value,
  }));

  const cardStyles = [card1Style, card2Style, card3Style];

  const allStats = [
    ...STATS,
    {
      icon: 'restaurant' as const,
      label: firstFood ? `First food logged: ${firstFood.name}` : 'First food logged',
      color: '#F97316',
    },
  ];

  return (
    <OnboardingLayout
      currentStep={19}
      onContinue={onContinue}
      continueLabel="Keep Going"
      showBack={false}
    >
      <View style={styles.content}>
        <Animated.View style={[styles.mascotContainer, mascotStyle]}>
          <Mascot size={100} mood="celebrating" />
        </Animated.View>

        <Text style={styles.title}>You just took the{'\n'}hardest step</Text>
        <Text style={styles.subtitle}>
          Most people only think about getting healthier. You actually did something about it.
        </Text>

        <View style={styles.stats}>
          {allStats.map((stat, index) => (
            <Animated.View key={index} style={[styles.statCard, cardStyles[index]]}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '15' }]}>
                <Ionicons name={stat.icon} size={20} color={stat.color} />
              </View>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Ionicons name="checkmark" size={20} color="#10B981" />
            </Animated.View>
          ))}
        </View>

        <Animated.View style={proofStyle}>
          <Text style={styles.proofText}>Most people never make it this far.</Text>
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
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  stats: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  proofText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
