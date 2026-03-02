import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingLayout } from '../../components/OnboardingLayout';

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

export function HowItWorksScreen({ onContinue, onBack }: Props) {
  return (
    <OnboardingLayout
      currentStep={4}
      onContinue={onContinue}
      onBack={onBack}
    >
      <View style={styles.content}>
        <Text style={styles.label}>HOW IT WORKS</Text>
        <Text style={styles.title}>Just tell us{'\n'}what you ate</Text>
        <Text style={styles.subtitle}>
          No searching databases. No scanning barcodes.{'\n'}Just speak naturally.
        </Text>

        <View style={styles.demoContainer}>
          <View style={styles.inputDemo}>
            <Text style={styles.inputLabel}>You type:</Text>
            <View style={styles.inputBubble}>
              <Text style={styles.inputText}>
                "2 eggs, toast with butter, and a coffee with oat milk"
              </Text>
            </View>
          </View>

          <View style={styles.arrow}>
            <Ionicons name="arrow-down" size={24} color="#9CA3AF" />
          </View>

          <View style={styles.outputDemo}>
            <Text style={styles.outputLabel}>We calculate:</Text>
            <View style={styles.outputCard}>
              <View style={styles.foodItem}>
                <Text style={styles.foodName}>Eggs (2 large)</Text>
                <Text style={styles.foodCals}>156 kcal</Text>
              </View>
              <View style={styles.foodItem}>
                <Text style={styles.foodName}>Toast with butter</Text>
                <Text style={styles.foodCals}>180 kcal</Text>
              </View>
              <View style={styles.foodItem}>
                <Text style={styles.foodName}>Coffee with oat milk</Text>
                <Text style={styles.foodCals}>45 kcal</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>381 kcal</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <Ionicons name="flash" size={20} color="#3B82F6" style={styles.benefitIcon} />
            <Text style={styles.benefitText}>Log meals in seconds</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="bulb" size={20} color="#3B82F6" style={styles.benefitIcon} />
            <Text style={styles.benefitText}>AI understands portions naturally</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="bookmark" size={20} color="#3B82F6" style={styles.benefitIcon} />
            <Text style={styles.benefitText}>Learns your favorite foods</Text>
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
    marginBottom: 24,
    lineHeight: 24,
  },
  demoContainer: {
    marginBottom: 24,
  },
  inputDemo: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputBubble: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 16,
  },
  inputText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  arrow: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  arrowText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  outputDemo: {},
  outputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  outputCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  foodName: {
    fontSize: 15,
    color: '#374151',
  },
  foodCals: {
    fontSize: 15,
    color: '#6B7280',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B82F6',
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitIcon: {
    marginRight: 12,
  },
  benefitText: {
    fontSize: 15,
    color: '#374151',
  },
});
