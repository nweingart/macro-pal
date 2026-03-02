import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { MicronutrientAnalysis, NutrientValue } from '../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  date: string;
}

// Per-date cache to avoid refetching on re-open (5 minute TTL)
const nutrientCache = new Map<string, { data: MicronutrientAnalysis; fetchedAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

const VITAMIN_LABELS: Record<string, string> = {
  a: 'Vitamin A',
  b1: 'Vitamin B1 (Thiamin)',
  b2: 'Vitamin B2 (Riboflavin)',
  b3: 'Vitamin B3 (Niacin)',
  b5: 'Vitamin B5 (Pantothenic)',
  b6: 'Vitamin B6',
  b7: 'Vitamin B7 (Biotin)',
  b9: 'Vitamin B9 (Folate)',
  b12: 'Vitamin B12',
  c: 'Vitamin C',
  d: 'Vitamin D',
  e: 'Vitamin E',
  k: 'Vitamin K',
};

const MINERAL_LABELS: Record<string, string> = {
  calcium: 'Calcium',
  iron: 'Iron',
  magnesium: 'Magnesium',
  phosphorus: 'Phosphorus',
  potassium: 'Potassium',
  sodium: 'Sodium',
  zinc: 'Zinc',
  copper: 'Copper',
  manganese: 'Manganese',
  selenium: 'Selenium',
};

function NutrientRow({ label, nutrient, color }: { label: string; nutrient: NutrientValue; color: string }) {
  const { colors, radius } = useTheme();
  const percentage = Math.min(nutrient.percentDV, 100);

  return (
    <View style={styles.nutrientRow}>
      <View style={styles.nutrientInfo}>
        <Text style={[styles.nutrientLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.nutrientAmount, { color: colors.textSecondary }]}>
          {nutrient.amount.toFixed(1)} {nutrient.unit}
        </Text>
      </View>
      <View style={styles.nutrientBarContainer}>
        <View style={[styles.nutrientBarBg, { backgroundColor: colors.border, borderRadius: radius.sm }]}>
          <View
            style={[
              styles.nutrientBar,
              {
                backgroundColor: color,
                width: `${percentage}%`,
                borderRadius: radius.sm,
              },
            ]}
          />
        </View>
        <Text style={[styles.nutrientPercent, { color: colors.textSecondary }]}>
          {Math.round(nutrient.percentDV)}%
        </Text>
      </View>
    </View>
  );
}

export function MicronutrientsModal({ visible, onClose, date }: Props) {
  const { colors, radius } = useTheme();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<MicronutrientAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadAnalysis();
    }
  }, [visible, date]);

  const loadAnalysis = async () => {
    try {
      setError(null);

      // Check cache first
      const cached = nutrientCache.get(date);
      if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
        setAnalysis(cached.data);
        setLoading(false);
        return;
      }

      setLoading(true);
      const data = await api.getNutrientAnalysis(date);
      nutrientCache.set(date, { data, fetchedAt: Date.now() });
      setAnalysis(data);
    } catch (err) {
      console.error('Failed to load nutrient analysis:', err);
      setError('Failed to analyze nutrients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getBarColor = (percentDV: number): string => {
    if (percentDV >= 80) return colors.success;
    if (percentDV >= 40) return colors.warning;
    return colors.error;
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Micronutrients</Text>
          <View style={styles.closeButton} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading nutrients...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary, borderRadius: radius.md }]}
              onPress={loadAnalysis}
            >
              <Text style={[styles.retryButtonText, { color: colors.white }]}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : analysis ? (
          <ScrollView contentContainerStyle={styles.content}>
            {/* Disclaimer Banner */}
            <View style={[styles.disclaimerBanner, { backgroundColor: colors.warningLight, borderRadius: radius.md }]}>
              <Ionicons name="information-circle-outline" size={18} color={colors.warning} />
              <Text style={[styles.disclaimerBannerText, { color: colors.warningDark }]}>
                These are AI-estimated values and may not be 100% accurate
              </Text>
            </View>

            {/* Summary */}
            <View style={[styles.summaryCard, { backgroundColor: colors.primaryLight, borderRadius: radius.md }]}>
              <Ionicons name="bulb-outline" size={20} color={colors.primary} />
              <Text style={[styles.summaryText, { color: colors.primary }]}>
                {analysis.summary}
              </Text>
            </View>

            {/* Legend */}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>Good (80%+)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>Moderate (40-80%)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>Low (&lt;40%)</Text>
              </View>
            </View>

            {/* Vitamins */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Vitamins</Text>
            <View style={[styles.section, { backgroundColor: colors.card, borderRadius: radius.md }]}>
              {Object.entries(analysis.vitamins).map(([key, value]) => (
                <NutrientRow
                  key={key}
                  label={VITAMIN_LABELS[key] || key}
                  nutrient={value}
                  color={getBarColor(value.percentDV)}
                />
              ))}
            </View>

            {/* Minerals */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Minerals</Text>
            <View style={[styles.section, { backgroundColor: colors.card, borderRadius: radius.md }]}>
              {Object.entries(analysis.minerals).map(([key, value]) => (
                <NutrientRow
                  key={key}
                  label={MINERAL_LABELS[key] || key}
                  nutrient={value}
                  color={getBarColor(value.percentDV)}
                />
              ))}
            </View>

            {/* Disclaimer */}
            <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
              These values are AI-estimated based on your logged foods and may not be 100% accurate.
              For precise nutritional information, consult a registered dietitian.
            </Text>
          </ScrollView>
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  disclaimerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
    marginBottom: 12,
  },
  disclaimerBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    gap: 10,
    marginBottom: 16,
  },
  summaryText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  section: {
    padding: 12,
    marginBottom: 20,
  },
  nutrientRow: {
    paddingVertical: 10,
  },
  nutrientInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  nutrientLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  nutrientAmount: {
    fontSize: 13,
  },
  nutrientBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nutrientBarBg: {
    flex: 1,
    height: 8,
    overflow: 'hidden',
  },
  nutrientBar: {
    height: '100%',
  },
  nutrientPercent: {
    width: 40,
    fontSize: 13,
    textAlign: 'right',
    fontWeight: '500',
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
  },
});
