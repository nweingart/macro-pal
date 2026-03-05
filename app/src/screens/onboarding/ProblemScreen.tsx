import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingLayout } from '../../components/OnboardingLayout';
import { useFunnelStep } from '@nedweingart/funnel-kit-react-native';

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

export function ProblemScreen({ onContinue, onBack }: Props) {
  useFunnelStep('Problem');
  return (
    <OnboardingLayout
      currentStep={2}
      onContinue={onContinue}
      onBack={onBack}
    >
      <View style={styles.content}>
        <Text style={styles.label}>THE PROBLEM</Text>
        <Text style={styles.title}>We're terrible at{'\n'}estimating calories</Text>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>47%</Text>
          <Text style={styles.statLabel}>Average underestimation of daily calories</Text>
        </View>

        <View style={styles.examplesSection}>
          <Text style={styles.examplesTitle}>Common mistakes</Text>

          <View style={styles.exampleRow}>
            <View style={styles.exampleCard}>
              <Text style={styles.foodEmoji}>🥗</Text>
              <Text style={styles.exampleFood}>Caesar Salad</Text>
              <Text style={styles.guessLabel}>We guess</Text>
              <Text style={styles.guessValue}>350 cal</Text>
              <Text style={styles.actualLabel}>Actually</Text>
              <Text style={styles.actualValue}>650 cal</Text>
            </View>
            <View style={styles.exampleCard}>
              <Text style={styles.foodEmoji}>🧃</Text>
              <Text style={styles.exampleFood}>Smoothie</Text>
              <Text style={styles.guessLabel}>We guess</Text>
              <Text style={styles.guessValue}>200 cal</Text>
              <Text style={styles.actualLabel}>Actually</Text>
              <Text style={styles.actualValue}>450 cal</Text>
            </View>
          </View>
        </View>

        <View style={styles.research}>
          <View style={styles.studyCard}>
            <Ionicons name="school-outline" size={18} color="#6B7280" style={styles.studyIcon} />
            <View style={styles.studyContent}>
              <Text style={styles.studyText}>
                <Text style={styles.bold}>New England Journal of Medicine</Text>
                {'\n'}Lichtman et al., 1992
              </Text>
            </View>
          </View>
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
    color: '#EF4444',
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
  statCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#EF4444',
    lineHeight: 54,
  },
  statLabel: {
    fontSize: 15,
    color: '#991B1B',
    textAlign: 'center',
    marginTop: 8,
  },
  examplesSection: {
    marginBottom: 24,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exampleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  exampleCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  foodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  exampleFood: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  guessLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  guessValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  actualLabel: {
    fontSize: 11,
    color: '#DC2626',
    textTransform: 'uppercase',
  },
  actualValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DC2626',
  },
  research: {
    marginBottom: 12,
  },
  studyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  studyIcon: {},
  studyContent: {
    flex: 1,
  },
  studyText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  bold: {
    fontWeight: '600',
    color: '#374151',
  },
});
