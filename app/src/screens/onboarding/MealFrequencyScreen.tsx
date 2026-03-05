import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingLayout } from '../../components/OnboardingLayout';
import { useFunnelStep } from '@nedweingart/funnel-kit-react-native';

interface Props {
  onContinue: (frequency: string) => void;
  onBack: () => void;
  initialValue?: string;
}

const FREQUENCIES = [
  {
    id: '2_meals',
    icon: 'restaurant' as const,
    title: '2 meals',
    description: 'I usually skip a meal or combine them',
  },
  {
    id: '3_meals',
    icon: 'fast-food' as const,
    title: '3 meals',
    description: 'Breakfast, lunch, and dinner',
  },
  {
    id: '4_plus',
    icon: 'grid' as const,
    title: '4+ meals',
    description: 'Smaller meals throughout the day',
  },
  {
    id: 'varies',
    icon: 'shuffle' as const,
    title: 'It varies',
    description: 'My schedule changes day to day',
  },
];

export function MealFrequencyScreen({ onContinue, onBack, initialValue }: Props) {
  useFunnelStep('MealFrequency');
  const [selected, setSelected] = useState<string | null>(initialValue || null);

  const handleContinue = () => {
    if (selected) {
      onContinue(selected);
    }
  };

  return (
    <OnboardingLayout
      currentStep={13}
      onContinue={handleContinue}
      onBack={onBack}
      continueDisabled={!selected}
    >
      <View style={styles.content}>
        <Text style={styles.label}>EATING HABITS</Text>
        <Text style={styles.title}>How many meals do{'\n'}you eat per day?</Text>
        <Text style={styles.subtitle}>
          This helps us understand your daily eating pattern.
        </Text>

        <View style={styles.options}>
          {FREQUENCIES.map((frequency) => (
            <TouchableOpacity
              key={frequency.id}
              style={[
                styles.optionCard,
                selected === frequency.id && styles.optionCardSelected,
              ]}
              onPress={() => setSelected(frequency.id)}
              accessibilityLabel={`Select ${frequency.title}`}
              accessibilityRole="radio"
            >
              <Ionicons name={frequency.icon} size={32} color={selected === frequency.id ? '#1D4ED8' : '#6B7280'} style={styles.optionIcon} />
              <View style={styles.optionContent}>
                <Text
                  style={[
                    styles.optionTitle,
                    selected === frequency.id && styles.optionTitleSelected,
                  ]}
                >
                  {frequency.title}
                </Text>
                <Text style={styles.optionDescription}>{frequency.description}</Text>
              </View>
              <View
                style={[
                  styles.radio,
                  selected === frequency.id && styles.radioSelected,
                ]}
              >
                {selected === frequency.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
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
  },
  options: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  optionIcon: {
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  optionTitleSelected: {
    color: '#1D4ED8',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#3B82F6',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
  },
});
