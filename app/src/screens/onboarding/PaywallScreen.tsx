import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Purchases, { PurchasesPackage, PURCHASES_ERROR_CODE } from 'react-native-purchases';
import { OnboardingLayout } from '../../components/OnboardingLayout';

interface Props {
  onSubscribed: () => void;
  onBack?: () => void;
  standalone?: boolean;
}

const FEATURES = [
  { icon: 'sparkles' as const, label: 'AI-powered food parsing' },
  { icon: 'person' as const, label: 'Personalized macro targets' },
  { icon: 'nutrition' as const, label: 'Complete nutrition tracking' },
  { icon: 'trending-up' as const, label: 'Progress insights & trends' },
];

export function PaywallScreen({ onSubscribed, onBack, standalone = false }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'weekly'>('monthly');
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

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
      <Text style={styles.label}>UNLOCK MACRO PAL</Text>
      <Text style={styles.title}>Start your free trial</Text>
      <Text style={styles.subtitle}>
        Get full access to everything Macro Pal has to offer.
      </Text>

      <View style={styles.featureList}>
        {FEATURES.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Ionicons name={feature.icon} size={18} color="#3B82F6" />
            </View>
            <Text style={styles.featureLabel}>{feature.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.plans}>
        <TouchableOpacity
          style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardSelected]}
          onPress={() => setSelectedPlan('monthly')}
        >
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>BEST VALUE</Text>
          </View>
          <View style={styles.planHeader}>
            <View style={[styles.radio, selectedPlan === 'monthly' && styles.radioSelected]}>
              {selectedPlan === 'monthly' && <View style={styles.radioInner} />}
            </View>
            <Text style={[styles.planTitle, selectedPlan === 'monthly' && styles.planTitleSelected]}>Monthly</Text>
          </View>
          <Text style={styles.planPrice}>$7.99/month</Text>
          <Text style={styles.planUnit}>$0.27/day</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.planCard, selectedPlan === 'weekly' && styles.planCardSelected]}
          onPress={() => setSelectedPlan('weekly')}
        >
          <View style={styles.planHeader}>
            <View style={[styles.radio, selectedPlan === 'weekly' && styles.radioSelected]}>
              {selectedPlan === 'weekly' && <View style={styles.radioInner} />}
            </View>
            <Text style={[styles.planTitle, selectedPlan === 'weekly' && styles.planTitleSelected]}>Weekly</Text>
          </View>
          <Text style={styles.planPrice}>$4.99/week</Text>
          <Text style={styles.planUnit}>$0.71/day</Text>
        </TouchableOpacity>
      </View>

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
      >
        {purchasing ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.ctaButtonText}>Start Free Trial</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.restoreButton} onPress={handleRestore} disabled={purchasing}>
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
      continueLabel={purchasing ? 'Processing...' : 'Start Free Trial'}
      continueDisabled={purchasing || loading}
      showProgress={false}
    >
      {content}
      <TouchableOpacity style={styles.restoreButton} onPress={handleRestore} disabled={purchasing}>
        <Text style={styles.restoreButtonText}>Restore Purchases</Text>
      </TouchableOpacity>
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
    color: '#F97316',
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
  },
  featureList: {
    gap: 12,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  plans: {
    gap: 12,
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  planBadge: {
    backgroundColor: '#F97316',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  planTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  planTitleSelected: {
    color: '#1D4ED8',
  },
  planPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 36,
  },
  planUnit: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 36,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
  finePrint: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  ctaButton: {
    backgroundColor: '#F97316',
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
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
  standaloneContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
