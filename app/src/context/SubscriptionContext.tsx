import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo, LOG_LEVEL } from 'react-native-purchases';
import { useAuth } from './AuthContext';

// RevenueCat public API keys (safe for client-side)
const REVENUECAT_IOS_KEY = 'YOUR_REVENUECAT_IOS_KEY';
const REVENUECAT_ANDROID_KEY = 'YOUR_REVENUECAT_ANDROID_KEY';

interface SubscriptionContextType {
  isSubscribed: boolean;
  isLoading: boolean;
  checkSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [configured, setConfigured] = useState(false);

  // Initialize RevenueCat once
  useEffect(() => {
    const configure = async () => {
      try {
        if (__DEV__) {
          Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        }
        const apiKey = Platform.OS === 'ios' ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;
        await Purchases.configure({ apiKey });
        setConfigured(true);
      } catch (err) {
        console.error('RevenueCat configure error:', err);
        setIsLoading(false);
      }
    };
    configure();
  }, []);

  // Log in user and check subscription when auth user or RC config changes
  useEffect(() => {
    if (!configured) return;

    const identify = async () => {
      setIsLoading(true);
      try {
        if (user) {
          const { customerInfo } = await Purchases.logIn(user.id);
          updateSubscriptionStatus(customerInfo);
        } else {
          setIsSubscribed(false);
        }
      } catch (err) {
        console.error('RevenueCat logIn error:', err);
        setIsSubscribed(false);
      } finally {
        setIsLoading(false);
      }
    };
    identify();
  }, [user, configured]);

  // Listen for real-time subscription status changes
  useEffect(() => {
    if (!configured) return;

    const listener = (customerInfo: CustomerInfo) => {
      updateSubscriptionStatus(customerInfo);
    };
    Purchases.addCustomerInfoUpdateListener(listener);

    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [configured]);

  const updateSubscriptionStatus = (customerInfo: CustomerInfo) => {
    const hasProEntitlement = !!customerInfo.entitlements.active['pro'];
    setIsSubscribed(hasProEntitlement);
  };

  const checkSubscription = async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      updateSubscriptionStatus(customerInfo);
    } catch (err) {
      console.error('RevenueCat getCustomerInfo error:', err);
    }
  };

  return (
    <SubscriptionContext.Provider value={{ isSubscribed, isLoading, checkSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
