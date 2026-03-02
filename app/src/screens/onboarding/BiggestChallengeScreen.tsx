import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingLayout } from '../../components/OnboardingLayout';

interface Props {
  onContinue: (challenge: string) => void;
  onBack: () => void;
  initialValue?: string;
}

const CHALLENGES = [
  {
    id: 'consistency',
    icon: 'repeat' as const,
    title: 'Staying consistent',
    description: "I start strong but fall off after a few weeks",
  },
  {
    id: 'knowledge',
    icon: 'help-circle' as const,
    title: 'Knowing what to eat',
    description: "I'm unsure which foods fit my goals",
  },
  {
    id: 'portions',
    icon: 'resize' as const,
    title: 'Portion sizes',
    description: 'I eat the right foods but too much or too little',
  },
  {
    id: 'schedule',
    icon: 'time' as const,
    title: 'Busy schedule',
    description: "I don't have time to plan and track meals",
  },
  {
    id: 'emotional',
    icon: 'heart' as const,
    title: 'Emotional eating',
    description: 'I eat based on how I feel, not what I need',
  },
];

export function BiggestChallengeScreen({ onContinue, onBack, initialValue }: Props) {
  const [selected, setSelected] = useState<string | null>(initialValue || null);

  const handleContinue = () => {
    if (selected) {
      onContinue(selected);
    }
  };

  return (
    <OnboardingLayout
      currentStep={7}
      onContinue={handleContinue}
      onBack={onBack}
      continueDisabled={!selected}
    >
      <View style={styles.content}>
        <Text style={styles.label}>YOUR JOURNEY</Text>
        <Text style={styles.title}>What's been your{'\n'}biggest challenge?</Text>
        <Text style={styles.subtitle}>
          Understanding what's held you back helps us support you better.
        </Text>

        <View style={styles.options}>
          {CHALLENGES.map((challenge) => (
            <TouchableOpacity
              key={challenge.id}
              style={[
                styles.optionCard,
                selected === challenge.id && styles.optionCardSelected,
              ]}
              onPress={() => setSelected(challenge.id)}
            >
              <Ionicons name={challenge.icon} size={32} color={selected === challenge.id ? '#1D4ED8' : '#6B7280'} style={styles.optionIcon} />
              <View style={styles.optionContent}>
                <Text
                  style={[
                    styles.optionTitle,
                    selected === challenge.id && styles.optionTitleSelected,
                  ]}
                >
                  {challenge.title}
                </Text>
                <Text style={styles.optionDescription}>{challenge.description}</Text>
              </View>
              <View
                style={[
                  styles.radio,
                  selected === challenge.id && styles.radioSelected,
                ]}
              >
                {selected === challenge.id && <View style={styles.radioInner} />}
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
    marginBottom: 16,
  },
  options: {
    gap: 8,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
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
