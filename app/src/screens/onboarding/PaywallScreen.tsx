import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Purchases, { PurchasesPackage, PURCHASES_ERROR_CODE } from 'react-native-purchases';
import { OnboardingLayout } from '../../components/OnboardingLayout';
import { Mascot } from '../../components/Mascot';
import { colors } from '../../theme/colors';
import { useDevMode } from '../../dev/DevModeContext';
import { useFunnelStep } from '@nedweingart/funnel-kit-react-native';

interface Props {
  onSubscribed: () => void;
  onBack?: () => void;
  standalone?: boolean;
}

const TIMELINE_STEPS = [
  {
    day: 'Today',
    icon: 'checkmark' as const,
    circleColor: colors.success,
    circleFilled: true,
    title: 'Start your free trial',
    description: 'Full access to all features',
  },
  {
    day: 'Day 4',
    icon: 'notifications-outline' as const,
    circleColor: colors.warning,
    circleFilled: false,
    title: "We'll remind you",
    description: 'Get a notification before your trial ends',
  },
  {
    day: 'Day 5',
    icon: 'card-outline' as const,
    circleColor: colors.textMuted,
    circleFilled: false,
    title: 'Trial ends',
    description: 'Choose a plan or cancel — no surprise charges',
  },
];

export function PaywallScreen({ onSubscribed, onBack, standalone = false }: Props) {
  useFunnelStep('Paywall');
  const dev = useDevMode();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'weekly'>('monthly');
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  // In dev mode with subscription override, skip the paywall entirely
  useEffect(() => {
    if (dev.enabled && dev.subscriptionOverride) {
      onSubscribed();
    }
  }, [dev.enabled, dev.subscriptionOverride]);

  useEffect(() => {
    fetchOfferings();
  }, []);

  const fetchOfferings = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current?.availablePackages) {
        setPackages(offerings.current.availablePackages);
      }
    } catch (err) {
      console.error('Error fetching offerings:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPackageForPlan = (plan: 'weekly' | 'monthly'): PurchasesPackage | undefined => {
    return packages.find((pkg) =>
      plan === 'weekly'
        ? pkg.identifier === '$rc_weekly' || pkg.product.identifier === 'macro_pal_weekly'
        : pkg.identifier === '$rc_monthly' || pkg.product.identifier === 'macro_pal_monthly'
    );
  };

  const handlePurchase = async () => {
    const pkg = getPackageForPlan(selectedPlan);
    if (!pkg) {
      Alert.alert('Error', 'Unable to load pricing. Please try again.');
      return;
    }

    setPurchasing(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      if (customerInfo.entitlements.active['pro']) {
        onSubscribed();
      }
    } catch (err: any) {
      if (err.code !== PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        Alert.alert('Purchase Failed', 'Something went wrong. Please try again.');
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
      if (customerInfo.entitlements.active['pro']) {
        onSubscribed();
      } else {
        Alert.alert('No Subscription Found', 'We couldn\'t find an active subscription for your account.');
      }
    } catch (err) {
      Alert.alert('Restore Failed', 'Something went wrong. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const content = (
    <View style={styles.content}>
      {/* Header — Teddy mascot + friendly copy */}
      <View style={styles.header}>
        <Mascot size={80} mood="excited" />
        <Text style={styles.title}>Try Macro Pal Free</Text>
        <Text style={styles.subtitle}>No payment today. Cancel anytime.</Text>
      </View>

      {/* Timeline — the centerpiece */}
      <View style={styles.timeline}>
        {/* Vertical connector line */}
        <View style={styles.timelineLine} />

        {TIMELINE_STEPS.map((step, index) => (
          <View key={step.day} style={[styles.timelineStep, index > 0 && { marginTop: 20 }]}>
            {/* Circle with icon */}
            <View
              style={[
                styles.timelineCircle,
                step.circleFilled
                  ? { backgroundColor: step.circleColor }
                  : { borderWidth: 2, borderColor: step.circleColor, backgroundColor: colors.white },
              ]}
            >
              <Ionicons
                name={step.icon}
                size={16}
                color={step.circleFilled ? colors.white : step.circleColor}
              />
            </View>

            {/* Text */}
            <View style={styles.timelineText}>
              <Text style={styles.timelineDay}>{step.day}</Text>
              <Text style={styles.timelineTitle}>{step.title}</Text>
              <Text style={styles.timelineDescription}>{step.description}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Plan selection — compact horizontal chips */}
      <View style={styles.planChips}>
        <TouchableOpacity
          style={[styles.chip, selectedPlan === 'monthly' && styles.chipSelected]}
          onPress={() => setSelectedPlan('monthly')}
          accessibilityLabel="Select monthly plan"
          accessibilityRole="radio"
        >
          <Text style={styles.chipBadge}>Best value</Text>
          <Text style={[styles.chipLabel, selectedPlan === 'monthly' && styles.chipLabelSelected]}>Monthly</Text>
          <Text style={[styles.chipPrice, selectedPlan === 'monthly' && styles.chipPriceSelected]}>$7.99/mo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, selectedPlan === 'weekly' && styles.chipSelected]}
          onPress={() => setSelectedPlan('weekly')}
          accessibilityLabel="Select weekly plan"
          accessibilityRole="radio"
        >
          <Text style={[styles.chipLabel, selectedPlan === 'weekly' && styles.chipLabelSelected]}>Weekly</Text>
          <Text style={[styles.chipPrice, selectedPlan === 'weekly' && styles.chipPriceSelected]}>$3.99/wk</Text>
        </TouchableOpacity>
      </View>

      {/* Fine print */}
      <Text style={styles.finePrint}>
        5-day free trial, then auto-renews. Cancel anytime.
      </Text>
    </View>
  );

  const footer = (
    <View style={styles.footer}>
      <TouchableOpacity
        style={[styles.ctaButton, purchasing && styles.ctaButtonDisabled]}
        onPress={handlePurchase}
        disabled={purchasing || loading}
        accessibilityLabel="Subscribe"
        accessibilityRole="button"
      >
        {purchasing ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.ctaButtonText}>Start Free Trial — $0 today</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.restoreButton} onPress={handleRestore} disabled={purchasing} accessibilityLabel="Restore purchases" accessibilityRole="button">
        <Text style={styles.restoreButtonText}>Restore Purchases</Text>
      </TouchableOpacity>
    </View>
  );

  if (standalone) {
    return (
      <SafeAreaView style={styles.standaloneContainer}>
        <ScrollView
          style={styles.standaloneScroll}
          contentContainerStyle={styles.standaloneScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
        {footer}
      </SafeAreaView>
    );
  }

  return (
    <OnboardingLayout
      currentStep={22}
      onContinue={handlePurchase}
      onBack={onBack}
      continueLabel={purchasing ? 'Processing...' : 'Start Free Trial — $0 today'}
      continueDisabled={purchasing || loading}
      showProgress={false}
    >
      {content}
      <TouchableOpacity style={styles.restoreButton} onPress={handleRestore} disabled={purchasing} accessibilityLabel="Restore purchases" accessibilityRole="button">
        <Text style={styles.restoreButtonText}>Restore Purchases</Text>
      </TouchableOpacity>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },

  // Timeline
  timeline: {
    position: 'relative',
    marginBottom: 28,
    paddingLeft: 4,
  },
  timelineLine: {
    position: 'absolute',
    left: 19, // center of the 32px circle (4px paddingLeft + 15px)
    top: 16,
    bottom: 16,
    width: 2,
    backgroundColor: colors.border,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timelineText: {
    marginLeft: 14,
    flex: 1,
    paddingTop: 2,
  },
  timelineDay: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 1,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 20,
  },
  timelineDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 19,
  },

  // Plan chips
  planChips: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  chip: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  chipSelected: {
    borderColor: colors.info,
    backgroundColor: '#EFF6FF',
  },
  chipBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.info,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  chipLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  chipLabelSelected: {
    color: colors.info,
  },
  chipPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 1,
  },
  chipPriceSelected: {
    color: colors.info,
  },

  // Fine print
  finePrint: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 8,
  },

  // Footer / CTA
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  restoreButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },

  // Standalone layout
  standaloneContainer: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  standaloneScroll: {
    flex: 1,
  },
  standaloneScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
});
