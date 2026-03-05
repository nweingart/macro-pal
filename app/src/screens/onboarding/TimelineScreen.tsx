import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingLayout } from '../../components/OnboardingLayout';
import { useFunnelStep } from '@nedweingart/funnel-kit-react-native';

interface Props {
  onContinue: (timeline: string) => void;
  onBack: () => void;
  initialValue?: string;
}

const TIMELINES = [
  {
    id: '1_month',
    icon: 'flash' as const,
    title: '1 month',
    description: 'I want results fast',
  },
  {
    id: '3_months',
    icon: 'timer' as const,
    title: '3 months',
    description: 'Steady, sustainable progress',
  },
  {
    id: '6_months',
    icon: 'calendar' as const,
    title: '6 months',
    description: "I'm in it for the long haul",
  },
  {
    id: 'no_rush',
    icon: 'infinite' as const,
    title: 'No rush',
    description: 'Just building better habits',
  },
];

export function TimelineScreen({ onContinue, onBack, initialValue }: Props) {
  useFunnelStep('Timeline');
  const [selected, setSelected] = useState<string | null>(initialValue || null);

  const handleContinue = () => {
    if (selected) {
      onContinue(selected);
    }
  };

  return (
    <OnboardingLayout
      currentStep={8}
      onContinue={handleContinue}
      onBack={onBack}
      continueDisabled={!selected}
    >
      <View style={styles.content}>
        <Text style={styles.label}>YOUR TIMELINE</Text>
        <Text style={styles.title}>When do you want{'\n'}to reach your goal?</Text>
        <Text style={styles.subtitle}>
          This helps us set realistic expectations for your journey.
        </Text>

        <View style={styles.options}>
          {TIMELINES.map((timeline) => (
            <TouchableOpacity
              key={timeline.id}
              style={[
                styles.optionCard,
                selected === timeline.id && styles.optionCardSelected,
              ]}
              onPress={() => setSelected(timeline.id)}
              accessibilityLabel={`Select ${timeline.title}`}
              accessibilityRole="radio"
            >
              <Ionicons name={timeline.icon} size={32} color={selected === timeline.id ? '#1D4ED8' : '#6B7280'} style={styles.optionIcon} />
              <View style={styles.optionContent}>
                <Text
                  style={[
                    styles.optionTitle,
                    selected === timeline.id && styles.optionTitleSelected,
                  ]}
                >
                  {timeline.title}
                </Text>
                <Text style={styles.optionDescription}>{timeline.description}</Text>
              </View>
              <View
                style={[
                  styles.radio,
                  selected === timeline.id && styles.radioSelected,
                ]}
              >
                {selected === timeline.id && <View style={styles.radioInner} />}
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
