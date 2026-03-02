import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingLayout } from '../../components/OnboardingLayout';

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

export function WeCalculateScreen({ onContinue, onBack }: Props) {
  return (
    <OnboardingLayout
      currentStep={5}
      onContinue={onContinue}
      onBack={onBack}
    >
      <View style={styles.content}>
        <Text style={styles.label}>HOW IT WORKS</Text>
        <Text style={styles.title}>We calculate{'\n'}the rest</Text>
        <Text style={styles.subtitle}>
          AI understands portions, cooking methods, and ingredients automatically.
        </Text>

        <View style={styles.demoSection}>
          <View style={styles.inputPreview}>
            <Ionicons name="chatbubble" size={16} color="#3B82F6" />
            <Text style={styles.inputPreviewText}>
              "2 eggs, toast with butter, and coffee with oat milk"
            </Text>
          </View>

          <View style={styles.arrowContainer}>
            <View style={styles.arrowLine} />
            <View style={styles.arrowIcon}>
              <Ionicons name="arrow-down" size={20} color="#9CA3AF" />
            </View>
            <View style={styles.arrowLine} />
          </View>

          <View style={styles.outputCard}>
            <View style={styles.foodItem}>
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>Eggs (2 large)</Text>
              </View>
              <Text style={styles.foodCals}>156 cal</Text>
            </View>
            <View style={styles.foodItem}>
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>Toast with butter</Text>
              </View>
              <Text style={styles.foodCals}>180 cal</Text>
            </View>
            <View style={styles.foodItem}>
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>Coffee with oat milk</Text>
              </View>
              <Text style={styles.foodCals}>45 cal</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>381 cal</Text>
            </View>
          </View>
        </View>

        <View style={styles.featuresSection}>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.featureText}>Understands portions naturally</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.featureText}>Knows restaurant menu items</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.featureText}>Learns your favorite foods</Text>
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
    marginBottom: 20,
    lineHeight: 24,
  },
  demoSection: {
    marginBottom: 20,
  },
  inputPreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  inputPreviewText: {
    flex: 1,
    fontSize: 14,
    color: '#1D4ED8',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  arrowContainer: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  arrowLine: {
    width: 2,
    height: 8,
    backgroundColor: '#E5E7EB',
  },
  arrowIcon: {
    padding: 4,
  },
  outputCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  foodDetail: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  foodCals: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3B82F6',
  },
  featuresSection: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#374151',
  },
});
