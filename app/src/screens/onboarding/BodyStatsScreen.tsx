import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingLayout } from '../../components/OnboardingLayout';
import { useFunnelStep } from '@nedweingart/funnel-kit-react-native';

interface Props {
  onContinue: (stats: { heightFeet: number; heightInches: number; weight: number }) => void;
  onBack: () => void;
  initialValues?: {
    heightFeet?: string;
    heightInches?: string;
    weight?: string;
  };
}

export function BodyStatsScreen({ onContinue, onBack, initialValues }: Props) {
  useFunnelStep('BodyStats');
  const [heightFeet, setHeightFeet] = useState(initialValues?.heightFeet || '');
  const [heightInches, setHeightInches] = useState(initialValues?.heightInches || '');
  const [weight, setWeight] = useState(initialValues?.weight || '');

  const isValid =
    heightFeet && parseInt(heightFeet) >= 0 &&
    heightInches !== '' && parseInt(heightInches) >= 0 &&
    weight && parseFloat(weight) > 0;

  const handleContinue = () => {
    if (isValid) {
      onContinue({
        heightFeet: parseInt(heightFeet),
        heightInches: parseInt(heightInches) || 0,
        weight: parseFloat(weight),
      });
    }
  };

  return (
    <OnboardingLayout
      currentStep={11}
      onContinue={handleContinue}
      onBack={onBack}
      continueDisabled={!isValid}
    >
      <View style={styles.content}>
        <Text style={styles.label}>BODY STATS</Text>
        <Text style={styles.title}>Tell us about{'\n'}your body</Text>
        <Text style={styles.subtitle}>
          We use this to calculate your daily calorie needs.
        </Text>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Height</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputSmall]}
                value={heightFeet}
                onChangeText={setHeightFeet}
                keyboardType="number-pad"
                placeholder="5"
                placeholderTextColor="#9CA3AF"
                maxLength={1}
                accessibilityLabel="Height in feet"
              />
              <Text style={styles.unit}>ft</Text>
              <TextInput
                style={[styles.input, styles.inputSmall]}
                value={heightInches}
                onChangeText={setHeightInches}
                keyboardType="number-pad"
                placeholder="10"
                placeholderTextColor="#9CA3AF"
                maxLength={2}
                accessibilityLabel="Height in inches"
              />
              <Text style={styles.unit}>in</Text>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Weight</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputMedium]}
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                placeholder="170"
                placeholderTextColor="#9CA3AF"
                maxLength={5}
                accessibilityLabel="Weight in pounds"
              />
              <Text style={styles.unit}>lbs</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={18} color="#6B7280" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            You can always update these in your profile later.
          </Text>
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
  form: {
    gap: 24,
    marginBottom: 32,
  },
  field: {},
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputSmall: {
    width: 72,
  },
  inputMedium: {
    width: 120,
  },
  unit: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 8,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
  },
});
