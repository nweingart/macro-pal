import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingLayout } from '../../components/OnboardingLayout';
import { useFunnelStep } from '@nedweingart/funnel-kit-react-native';

interface Props {
  onContinue: (gender: string) => void;
  onBack: () => void;
  initialValue?: string;
}

const GENDERS = [
  { id: 'male', icon: 'male' as const, label: 'Male' },
  { id: 'female', icon: 'female' as const, label: 'Female' },
  { id: 'other', icon: 'person' as const, label: 'Other' },
];

export function GenderScreen({ onContinue, onBack, initialValue }: Props) {
  useFunnelStep('Gender');
  const [selected, setSelected] = useState<string | null>(initialValue || null);

  const handleContinue = () => {
    if (selected) {
      onContinue(selected);
    }
  };

  return (
    <OnboardingLayout
      currentStep={9}
      onContinue={handleContinue}
      onBack={onBack}
      continueDisabled={!selected}
    >
      <View style={styles.content}>
        <Text style={styles.label}>ABOUT YOU</Text>
        <Text style={styles.title}>What's your{'\n'}biological sex?</Text>
        <Text style={styles.subtitle}>
          This affects how we calculate your metabolism and nutritional needs.
        </Text>

        <View style={styles.options}>
          {GENDERS.map((gender) => (
            <TouchableOpacity
              key={gender.id}
              style={[
                styles.optionCard,
                selected === gender.id && styles.optionCardSelected,
              ]}
              onPress={() => setSelected(gender.id)}
              accessibilityLabel={`Select ${gender.label}`}
              accessibilityRole="radio"
            >
              <Ionicons name={gender.icon} size={40} color={selected === gender.id ? '#1D4ED8' : '#6B7280'} style={styles.optionIcon} />
              <Text
                style={[
                  styles.optionLabel,
                  selected === gender.id && styles.optionLabelSelected,
                ]}
              >
                {gender.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.privacyNote}>
          <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
          <Text style={styles.privacyNoteText}>Your data is private and never shared</Text>
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
  options: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  optionCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingVertical: 24,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  optionIcon: {
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  optionLabelSelected: {
    color: '#1D4ED8',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  privacyNoteText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
