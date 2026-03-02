import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingLayout } from '../../components/OnboardingLayout';

interface Props {
  onContinue: (style: string) => void;
  onBack: () => void;
  initialValue?: string;
}

const EATING_STYLES = [
  {
    id: 'home_cooked',
    icon: 'home' as const,
    title: 'Mostly home-cooked',
    description: 'I prepare most of my meals at home',
  },
  {
    id: 'mix',
    icon: 'swap-horizontal' as const,
    title: 'Mix of both',
    description: 'Some home cooking, some eating out',
  },
  {
    id: 'eating_out',
    icon: 'storefront' as const,
    title: 'Mostly eating out',
    description: 'Restaurants, takeout, and delivery',
  },
  {
    id: 'meal_prep',
    icon: 'layers' as const,
    title: 'Meal prep',
    description: 'I batch cook and plan ahead',
  },
];

export function TypicalMealsScreen({ onContinue, onBack, initialValue }: Props) {
  const [selected, setSelected] = useState<string | null>(initialValue || null);

  const handleContinue = () => {
    if (selected) {
      onContinue(selected);
    }
  };

  return (
    <OnboardingLayout
      currentStep={14}
      onContinue={handleContinue}
      onBack={onBack}
      continueDisabled={!selected}
    >
      <View style={styles.content}>
        <Text style={styles.label}>EATING HABITS</Text>
        <Text style={styles.title}>How do you{'\n'}usually eat?</Text>
        <Text style={styles.subtitle}>
          This helps us give you more relevant food suggestions.
        </Text>

        <View style={styles.options}>
          {EATING_STYLES.map((style) => (
            <TouchableOpacity
              key={style.id}
              style={[
                styles.optionCard,
                selected === style.id && styles.optionCardSelected,
              ]}
              onPress={() => setSelected(style.id)}
            >
              <Ionicons name={style.icon} size={32} color={selected === style.id ? '#1D4ED8' : '#6B7280'} style={styles.optionIcon} />
              <View style={styles.optionContent}>
                <Text
                  style={[
                    styles.optionTitle,
                    selected === style.id && styles.optionTitleSelected,
                  ]}
                >
                  {style.title}
                </Text>
                <Text style={styles.optionDescription}>{style.description}</Text>
              </View>
              <View
                style={[
                  styles.radio,
                  selected === style.id && styles.radioSelected,
                ]}
              >
                {selected === style.id && <View style={styles.radioInner} />}
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
