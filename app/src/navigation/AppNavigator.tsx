import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';

import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { useDevMode } from '../dev/DevModeContext';
import { useTheme } from '../context/ThemeContext';
import { EmailConfirmationScreen } from '../screens/EmailConfirmationScreen';
import { TodayScreen } from '../screens/TodayScreen';
import { StreakScreen } from '../screens/StreakScreen';
import { TrackingScreen } from '../screens/TrackingScreen';
import { MacrosScreen } from '../screens/MacrosScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { PaywallScreen } from '../screens/onboarding/PaywallScreen';
import { OnboardingNavigator } from './OnboardingNavigator';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();

const linking: LinkingOptions<{}> = {
  prefixes: [Linking.createURL('/'), 'macropal://'],
  config: {
    screens: {
      Main: {
        screens: {
          Log: 'log',
          Streak: 'streak',
          Trends: 'trends',
          Profile: {
            screens: {
              ProfileHome: 'profile',
              MacroTargets: 'profile/targets',
              FoodLibrary: 'profile/library',
            },
          },
        },
      },
    },
  },
};

function ProfileTabNavigator() {
  const { colors } = useTheme();

  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTitleStyle: { fontWeight: '600', color: colors.text },
        headerTintColor: colors.primary,
      }}
    >
      <ProfileStack.Screen
        name="ProfileHome"
        component={ProfileScreen}
        options={{ title: 'Profile', headerShown: false }}
      />
      <ProfileStack.Screen
        name="MacroTargets"
        component={MacrosScreen}
        options={{ title: 'My Targets' }}
      />
      <ProfileStack.Screen
        name="FoodLibrary"
        component={LibraryScreen}
        options={{ title: 'Food Library' }}
      />
    </ProfileStack.Navigator>
  );
}

function MainTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Log':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'Streak':
              iconName = focused ? 'flame' : 'flame-outline';
              break;
            case 'Trends':
              iconName = focused ? 'trending-up' : 'trending-up-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person-circle' : 'person-circle-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return (
            <Ionicons
              name={iconName}
              size={24}
              color={focused ? colors.primary : colors.textMuted}
            />
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        tabBarStyle: {
          height: 80,
          paddingTop: 8,
          paddingBottom: 20,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.card,
        },
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: colors.text,
        },
      })}
    >
      <Tab.Screen
        name="Log"
        component={TodayScreen}
        options={{
          title: 'Log',
          tabBarAccessibilityLabel: 'Log tab',
        }}
      />
      <Tab.Screen
        name="Streak"
        component={StreakScreen}
        options={{
          title: 'Streak',
          tabBarAccessibilityLabel: 'Streak tab',
        }}
      />
      <Tab.Screen
        name="Trends"
        component={TrackingScreen}
        options={{
          title: 'Trends',
          tabBarAccessibilityLabel: 'Trends tab',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileTabNavigator}
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarAccessibilityLabel: 'Profile tab',
        }}
      />
    </Tab.Navigator>
  );
}

function LoadingScreen() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.card }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export function AppNavigator() {
  const { user, loading: authLoading, pendingConfirmationEmail, clearPendingConfirmation } = useAuth();
  const { isSubscribed, isLoading: subscriptionLoading } = useSubscription();
  const dev = useDevMode();
  const { colors } = useTheme();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  // Prevents auth state changes from disrupting the onboarding flow mid-stream
  const inOnboardingRef = useRef(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, [user, dev.enabled, dev.onboardingComplete]);

  const checkOnboardingStatus = async () => {
    // If we're mid-onboarding (user just authenticated), don't re-evaluate
    if (inOnboardingRef.current) {
      setCheckingOnboarding(false);
      return;
    }

    if (dev.enabled) {
      setOnboardingComplete(dev.onboardingComplete);
      setCheckingOnboarding(false);
      return;
    }

    if (user) {
      try {
        const status = await AsyncStorage.getItem(`onboarding_complete_${user.id}`);
        setOnboardingComplete(status === 'true');
      } catch (err) {
        console.error('Error checking onboarding status:', err);
        setOnboardingComplete(false);
      }
    } else {
      // No user — check if there's anonymous onboarding progress (mid-flow)
      // or if this is a truly fresh start
      setOnboardingComplete(false);
    }

    setCheckingOnboarding(false);
  };

  const handleOnboardingComplete = () => {
    inOnboardingRef.current = false;
    setOnboardingComplete(true);
  };

  const handleEnterOnboarding = () => {
    inOnboardingRef.current = true;
  };

  if (authLoading || checkingOnboarding || (user && subscriptionLoading)) {
    return <LoadingScreen />;
  }

  // Show email confirmation screen if pending (user signing up mid-onboarding)
  if (pendingConfirmationEmail) {
    return (
      <EmailConfirmationScreen
        email={pendingConfirmationEmail}
        onBackToLogin={clearPendingConfirmation}
      />
    );
  }

  // Determine which flow to show
  const shouldShowOnboarding = inOnboardingRef.current || !onboardingComplete;
  const shouldShowPaywall = user && onboardingComplete && !isSubscribed;
  const shouldShowMain = user && onboardingComplete && isSubscribed;

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {shouldShowOnboarding ? (
          <Stack.Screen name="Onboarding">
            {() => (
              <OnboardingNavigator
                onComplete={handleOnboardingComplete}
                onEnter={handleEnterOnboarding}
              />
            )}
          </Stack.Screen>
        ) : shouldShowPaywall ? (
          <Stack.Screen name="StandalonePaywall">
            {() => <PaywallScreen standalone onSubscribed={handleOnboardingComplete} />}
          </Stack.Screen>
        ) : shouldShowMain ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          // Edge case: no user, onboarding marked complete (e.g., reinstall)
          // Show onboarding which has "Already have an account?" on Welcome
          <Stack.Screen name="Onboarding">
            {() => (
              <OnboardingNavigator
                onComplete={handleOnboardingComplete}
                onEnter={handleEnterOnboarding}
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
