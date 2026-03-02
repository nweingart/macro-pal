import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingLayout } from '../../components/OnboardingLayout';

interface Props {
  onContinue: (goal: string) => void;
  onBack: () => void;
  initialValue?: string;
}

const GOALS = [
  {
    id: 'lose',
    icon: 'trending-down' as const,
    title: 'Lose Weight',
    description: 'Burn fat while maintaining muscle',
  },
  {
    id: 'maintain',
    icon: 'swap-horizontal' as const,
    title: 'Maintain Weight',
    description: 'Stay at your current weight',
  },
  {
    id: 'gain',
    icon: 'trending-up' as const,
    title: 'Gain Weight',
    description: 'Build muscle and add mass',
  },
];

export function GoalScreen({ onContinue, onBack, initialValue }: Props) {
  const [selected, setSelected] = useState<string | null>(initialValue || null);

  const handleContinue = () => {
    if (selected) {
      onContinue(selected);
    }
  };

  return (
    <OnboardingLayout
      currentStep={6}
      onContinue={handleContinue}
      onBack={onBack}
      continueDisabled={!selected}
    >
      <View style={styles.content}>
        <Text style={styles.label}>YOUR GOAL</Text>
        <Text style={styles.title}>What's your{'\n'}primary goal?</Text>
        <Text style={styles.subtitle}>
          This helps us calculate the right calorie target for you.
        </Text>

        <View style={styles.options}>
          {GOALS.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.optionCard,
                selected === goal.id && styles.optionCardSelected,
              ]}
              onPress={() => setSelected(goal.id)}
            >
              <Ionicons name={goal.icon} size={32} color={selected === goal.id ? '#1D4ED8' : '#6B7280'} style={styles.optionIcon} />
              <View style={styles.optionContent}>
                <Text
                  style={[
                    styles.optionTitle,
                    selected === goal.id && styles.optionTitleSelected,
                  ]}
                >
                  {goal.title}
                </Text>
                <Text style={styles.optionDescription}>{goal.description}</Text>
              </View>
              <View
                style={[
                  styles.radio,
                  selected === goal.id && styles.radioSelected,
                ]}
              >
                {selected === goal.id && <View style={styles.radioInner} />}
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
