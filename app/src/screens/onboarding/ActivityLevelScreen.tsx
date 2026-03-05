import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { OnboardingLayout } from '../../components/OnboardingLayout';
import { useFunnelStep } from '@nedweingart/funnel-kit-react-native';

interface Props {
  onContinue: (activityLevel: string) => void;
  onBack: () => void;
  initialValue?: string;
}

const ACTIVITY_LEVELS = [
  {
    id: 'sedentary',
    label: 'Sedentary',
    description: 'Little or no exercise, desk job',
    multiplier: '1.2x',
  },
  {
    id: 'light',
    label: 'Lightly Active',
    description: 'Light exercise 1-3 days/week',
    multiplier: '1.4x',
  },
  {
    id: 'moderate',
    label: 'Moderately Active',
    description: 'Moderate exercise 3-5 days/week',
    multiplier: '1.6x',
  },
  {
    id: 'active',
    label: 'Very Active',
    description: 'Hard exercise 6-7 days/week',
    multiplier: '1.7x',
  },
  {
    id: 'very_active',
    label: 'Extremely Active',
    description: 'Very hard exercise, physical job',
    multiplier: '1.9x',
  },
];

export function ActivityLevelScreen({ onContinue, onBack, initialValue }: Props) {
  useFunnelStep('ActivityLevel');
  const [selected, setSelected] = useState<string | null>(initialValue || null);

  const handleContinue = () => {
    if (selected) {
      onContinue(selected);
    }
  };

  return (
    <OnboardingLayout
      currentStep={12}
      onContinue={handleContinue}
      onBack={onBack}
      continueDisabled={!selected}
    >
      <View style={styles.content}>
        <Text style={styles.label}>ACTIVITY LEVEL</Text>
        <Text style={styles.title}>How active{'\n'}are you?</Text>
        <Text style={styles.subtitle}>
          This helps us estimate your daily calorie burn.
        </Text>

        <View style={styles.options}>
          {ACTIVITY_LEVELS.map((level, index) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.optionCard,
                selected === level.id && styles.optionCardSelected,
              ]}
              onPress={() => setSelected(level.id)}
              accessibilityLabel={`Select ${level.label}`}
              accessibilityRole="radio"
            >
              <View style={styles.optionLeft}>
                <View
                  style={[
                    styles.levelIndicator,
                    { width: 20 + index * 15 },
                    selected === level.id && styles.levelIndicatorSelected,
                  ]}
                />
              </View>
              <View style={styles.optionContent}>
                <Text
                  style={[
                    styles.optionLabel,
                    selected === level.id && styles.optionLabelSelected,
                  ]}
                >
                  {level.label}
                </Text>
                <Text style={styles.optionDescription}>{level.description}</Text>
              </View>
              <View
                style={[
                  styles.radio,
                  selected === level.id && styles.radioSelected,
                ]}
              >
                {selected === level.id && <View style={styles.radioInner} />}
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
    marginBottom: 12,
  },
  options: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  optionLeft: {
    width: 80,
    marginRight: 12,
  },
  levelIndicator: {
    height: 8,
    backgroundColor: '#D1D5DB',
    borderRadius: 4,
  },
  levelIndicatorSelected: {
    backgroundColor: '#3B82F6',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  optionLabelSelected: {
    color: '#1D4ED8',
  },
  optionDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  radioSelected: {
    borderColor: '#3B82F6',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
  },
});
