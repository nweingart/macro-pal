import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OnboardingLayout } from '../../components/OnboardingLayout';

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

export function ScienceScreen({ onContinue, onBack }: Props) {
  return (
    <OnboardingLayout
      currentStep={15}
      onContinue={onContinue}
      onBack={onBack}
    >
      <View style={styles.content}>
        <Text style={styles.label}>THE SCIENCE</Text>
        <Text style={styles.title}>How we calculated{'\n'}your targets</Text>

        <View style={styles.methodCard}>
          <View style={styles.methodHeader}>
            <View style={styles.methodBadge}>
              <Text style={styles.methodBadgeText}>GOLD STANDARD</Text>
            </View>
          </View>
          <Text style={styles.methodName}>Mifflin-St Jeor Equation</Text>
          <Text style={styles.methodDescription}>
            The most accurate formula for estimating resting metabolic rate.
          </Text>
        </View>

        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>Your calculation:</Text>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Base Metabolic Rate (BMR)</Text>
              <Text style={styles.stepDescription}>
                Calories burned at rest based on age, height, weight, and sex
              </Text>
            </View>
          </View>

          <View style={styles.stepConnector} />

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Activity Multiplier</Text>
              <Text style={styles.stepDescription}>
                Multiplied by your activity level for total daily burn
              </Text>
            </View>
          </View>

          <View style={styles.stepConnector} />

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Goal Adjustment</Text>
              <Text style={styles.stepDescription}>
                Adjusted for your goal: deficit, surplus, or maintenance
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>
            These are estimates only. We are not healthcare providers. Consult a professional before making significant diet changes.
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
    color: '#8B5CF6',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
    lineHeight: 36,
  },
  methodCard: {
    backgroundColor: '#F5F3FF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  methodHeader: {
    marginBottom: 8,
  },
  methodBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  methodBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  methodName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5B21B6',
    marginBottom: 8,
  },
  methodDescription: {
    fontSize: 15,
    color: '#6D28D9',
    lineHeight: 22,
  },
  stepsContainer: {
    marginBottom: 12,
  },
  stepsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  stepConnector: {
    width: 2,
    height: 8,
    backgroundColor: '#E5E7EB',
    marginLeft: 13,
    marginVertical: 2,
  },
  disclaimerBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#991B1B',
    lineHeight: 20,
    textAlign: 'center',
  },
});
