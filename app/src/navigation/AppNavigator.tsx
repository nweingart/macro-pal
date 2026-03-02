import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { useTheme } from '../context/ThemeContext';
import { AuthHomeScreen } from '../screens/AuthHomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { EmailConfirmationScreen } from '../screens/EmailConfirmationScreen';
import { TodayScreen } from '../screens/TodayScreen';
import { TrackingScreen } from '../screens/TrackingScreen';
import { MacrosScreen } from '../screens/MacrosScreen';
import { PaywallScreen } from '../screens/onboarding/PaywallScreen';
import { OnboardingNavigator } from './OnboardingNavigator';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Today':
              iconName = focused ? 'today' : 'today-outline';
              break;
            case 'Tracking':
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              break;
            case 'Macros':
              iconName = focused ? 'nutrition' : 'nutrition-outline';
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
        name="Today"
        component={TodayScreen}
        options={{
          title: 'Today',
        }}
      />
      <Tab.Screen
        name="Tracking"
        component={TrackingScreen}
        options={{
          title: 'Tracking',
        }}
      />
      <Tab.Screen
        name="Macros"
        component={MacrosScreen}
        options={{
          title: 'Macros',
          headerShown: false,
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
  const { colors } = useTheme();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user) {
      setOnboardingComplete(null);
      setCheckingOnboarding(false);
      return;
    }

    try {
      // Use user-specific key so each user gets their own onboarding status
      const status = await AsyncStorage.getItem(`onboarding_complete_${user.id}`);
      setOnboardingComplete(status === 'true');
    } catch (err) {
      console.error('Error checking onboarding status:', err);
      setOnboardingComplete(false);
    } finally {
      setCheckingOnboarding(false);
    }
  };

  const handleOnboardingComplete = () => {
    setOnboardingComplete(true);
  };

  if (authLoading || checkingOnboarding || (user && subscriptionLoading)) {
    return <LoadingScreen />;
  }

  // Show email confirmation screen if pending
  if (pendingConfirmationEmail) {
    return (
      <EmailConfirmationScreen
        email={pendingConfirmationEmail}
        onBackToLogin={clearPendingConfirmation}
      />
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="AuthHome">
              {(props) => (
                <AuthHomeScreen
                  onNavigateToEmail={() => props.navigation.navigate('Login')}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                headerShown: true,
                headerTitle: '',
                headerBackTitle: '',
                headerShadowVisible: false,
                headerStyle: { backgroundColor: colors.background },
                headerTintColor: colors.text,
                animation: 'slide_from_right',
              }}
            />
          </>
        ) : !onboardingComplete ? (
          <Stack.Screen name="Onboarding">
            {() => <OnboardingNavigator onComplete={handleOnboardingComplete} />}
          </Stack.Screen>
        ) : !isSubscribed ? (
          <Stack.Screen name="StandalonePaywall">
            {() => <PaywallScreen standalone onSubscribed={handleOnboardingComplete} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
