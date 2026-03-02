import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingLayout } from '../../components/OnboardingLayout';

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

export function YouTypeScreen({ onContinue, onBack }: Props) {
  return (
    <OnboardingLayout
      currentStep={4}
      onContinue={onContinue}
      onBack={onBack}
    >
      <View style={styles.content}>
        <Text style={styles.label}>HOW IT WORKS</Text>
        <Text style={styles.title}>Type or speak{'\n'}naturally</Text>
        <Text style={styles.subtitle}>
          No searching databases. No scanning barcodes.{'\n'}Just describe what you ate.
        </Text>

        <View style={styles.inputSection}>
          <View style={styles.inputMethodRow}>
            <View style={styles.inputMethod}>
              <View style={[styles.inputMethodIcon, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="text-outline" size={24} color="#2563EB" />
              </View>
              <Text style={styles.inputMethodLabel}>Type</Text>
            </View>
            <Text style={styles.orText}>or</Text>
            <View style={styles.inputMethod}>
              <View style={[styles.inputMethodIcon, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="mic-outline" size={24} color="#DC2626" />
              </View>
              <Text style={styles.inputMethodLabel}>Speak</Text>
            </View>
          </View>

          <View style={styles.inputBubble}>
            <Text style={styles.inputText}>
              "2 eggs, toast with butter, and a coffee with oat milk"
            </Text>
          </View>
        </View>

        <View style={styles.examplesSection}>
          <Text style={styles.examplesTitle}>More examples</Text>
          <View style={styles.exampleBubble}>
            <Text style={styles.exampleText}>"Had a chicken salad for lunch"</Text>
          </View>
          <View style={styles.exampleBubble}>
            <Text style={styles.exampleText}>"Starbucks grande latte and a croissant"</Text>
          </View>
        </View>

        <View style={styles.benefitBox}>
          <Ionicons name="flash" size={20} color="#3B82F6" />
          <Text style={styles.benefitText}>Log meals in seconds, not minutes</Text>
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
    lineHeight: 24,
  },
  inputSection: {
    marginBottom: 16,
  },
  inputMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  inputMethod: {
    alignItems: 'center',
    gap: 8,
  },
  inputMethodIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputMethodLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  orText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  inputBubble: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    borderBottomRightRadius: 6,
    padding: 14,
  },
  inputText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  examplesSection: {
    marginBottom: 12,
  },
  examplesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exampleBubble: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 10,
    marginBottom: 6,
  },
  exampleText: {
    fontSize: 15,
    color: '#374151',
    fontStyle: 'italic',
  },
  benefitBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  benefitText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1D4ED8',
  },
});
