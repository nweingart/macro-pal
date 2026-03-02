import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OnboardingLayout } from '../../components/OnboardingLayout';

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

export function SolutionScreen({ onContinue, onBack }: Props) {
  return (
    <OnboardingLayout
      currentStep={3}
      onContinue={onContinue}
      onBack={onBack}
    >
      <View style={styles.content}>
        <Text style={styles.label}>THE SOLUTION</Text>
        <Text style={styles.title}>Tracking changes{'\n'}everything</Text>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>2x</Text>
          <Text style={styles.statLabel}>Weight loss for people who track daily</Text>
        </View>

        <View style={styles.research}>
          <View style={styles.studyCard}>
            <View style={styles.institutionBadge}>
              <Text style={styles.institutionText}>AMERICAN JOURNAL OF PREVENTIVE MEDICINE</Text>
            </View>
            <Text style={styles.studyText}>
              Study of <Text style={styles.bold}>1,700 participants</Text> found that those who
              kept daily food records lost <Text style={styles.bold}>twice as much weight</Text>.
            </Text>
            <Text style={styles.citation}>Hollis et al., 2008</Text>
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
    color: '#10B981',
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
    backgroundColor: '#ECFDF5',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#10B981',
    lineHeight: 54,
  },
  statLabel: {
    fontSize: 15,
    color: '#065F46',
    textAlign: 'center',
    marginTop: 8,
  },
  research: {},
  studyCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 18,
  },
  institutionBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  institutionText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1D4ED8',
    letterSpacing: 0.5,
  },
  studyText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  bold: {
    fontWeight: '600',
    color: '#111827',
  },
  citation: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 10,
    fontStyle: 'italic',
  },
});
