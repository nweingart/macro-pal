import React, { useState, useEffect, useRef } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import { FunnelProvider } from '@nedweingart/funnel-kit-react-native';

import { useAuth } from '../hooks/useAuth';
import { LoginScreen } from '../screens/LoginScreen';
import {
  WelcomeScreen,
  ProblemScreen,
  SolutionScreen,
  YouTypeScreen,
  WeCalculateScreen,
  GoalScreen,
  BiggestChallengeScreen,
  TimelineScreen,
  GenderScreen,
  BirthdayScreen,
  BodyStatsScreen,
  ActivityLevelScreen,
  MealFrequencyScreen,
  TypicalMealsScreen,
  TargetsScreen,
  ScienceScreen,
  TryItNowScreen,
  ReadyScreen,
  CongratulationsScreen,
  StreakCommitScreen,
  WhatToExpectScreen,
  CreateAccountScreen,
  PaywallScreen,
} from '../screens/onboarding';
import { api } from '../services/api';
import { analytics } from '../utils/analytics';

const Stack = createNativeStackNavigator();

// Total steps in onboarding flow
const TOTAL_STEPS = 22;

// Screen order for determining which screen to restore
const SCREEN_ORDER = [
  'Welcome',
  'Problem',
  'Solution',
  'YouType',
  'WeCalculate',
  'Goal',
  'BiggestChallenge',
  'Timeline',
  'Gender',
  'Birthday',
  'BodyStats',
  'ActivityLevel',
  'MealFrequency',
  'TypicalMeals',
  'Science',
  'Targets',
  'TryItNow',
  'Ready',
  'Congratulations',
  'StreakCommit',
  'WhatToExpect',
  'CreateAccount',
  'Paywall',
];

interface OnboardingData {
  goal: string;
  biggestChallenge: string;
  timeline: string;
  gender: string;
  birthday: string; // ISO date string YYYY-MM-DD
  heightFeet: number;
  heightInches: number;
  weight: number;
  activityLevel: string;
  mealFrequency: string;
  eatingStyle: string;
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  firstFood?: {
    name: string;
    calories: number;
  };
}

interface SavedProgress {
  currentScreen: string;
  data: Partial<OnboardingData>;
}

// Calculate age from birthday
function calculateAge(birthday: string): number {
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// TDEE calculation (matches backend)
function calculateTDEE(data: {
  gender: string;
  age: number;
  heightInches: number;
  weightLbs: number;
  activityLevel: string;
}): number {
  const weightKg = data.weightLbs * 0.453592;
  const heightCm = data.heightInches * 2.54;

  let bmr: number;
  if (data.gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * data.age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * data.age - 161;
  }

  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  return Math.round(bmr * (multipliers[data.activityLevel] || 1.2));
}

function calculateTargets(
  tdee: number,
  goal: string,
  weightLbs: number
): { calories: number; protein: number; carbs: number; fat: number } {
  let targetCalories: number;
  switch (goal) {
    case 'lose':
      targetCalories = tdee - 500;
      break;
    case 'gain':
      targetCalories = tdee + 300;
      break;
    default:
      targetCalories = tdee;
  }

  const protein = Math.round(weightLbs * 0.9);
  const fatCalories = targetCalories * 0.28;
  const fat = Math.round(fatCalories / 9);
  const proteinCalories = protein * 4;
  const carbCalories = targetCalories - proteinCalories - fatCalories;
  const carbs = Math.round(carbCalories / 4);

  return {
    calories: Math.round(targetCalories),
    protein,
    carbs,
    fat,
  };
}

interface OnboardingNavigatorProps {
  onComplete: () => void;
  onEnter?: () => void;
}

export function OnboardingNavigator({ onComplete, onEnter }: OnboardingNavigatorProps) {
  const { user } = useAuth();
  const userRef = useRef(user);
  userRef.current = user; // Always keep the latest user in the ref
  const [data, setData] = useState<Partial<OnboardingData>>({});
  const [initialScreen, setInitialScreen] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentScreenRef = useRef<string>('Welcome');

  const getStorageKey = () => user ? `onboarding_progress_${user.id}` : 'onboarding_progress_anon';

  // Tell AppNavigator we're in the onboarding flow
  useEffect(() => {
    onEnter?.();
  }, []);

  // Load saved progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      const key = getStorageKey();

      try {
        let saved = await AsyncStorage.getItem(key);

        // If user just authenticated, migrate anonymous progress
        if (!saved && user) {
          const anonSaved = await AsyncStorage.getItem('onboarding_progress_anon');
          if (anonSaved) {
            saved = anonSaved;
            // Migrate to user-specific key and clean up
            await AsyncStorage.setItem(key, anonSaved);
            await AsyncStorage.removeItem('onboarding_progress_anon');
          }
        }

        if (saved) {
          const progress: SavedProgress = JSON.parse(saved);
          // Handle migration from old screen name
          let screen = progress.currentScreen;
          if (screen === 'HowItWorks') {
            screen = 'YouType';
          }
          setData(progress.data);
          setInitialScreen(screen);
          currentScreenRef.current = screen;
        } else {
          setInitialScreen('Welcome');
        }
      } catch (err) {
        console.error('Error loading onboarding progress:', err);
        setInitialScreen('Welcome');
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [user]);

  // Save progress whenever data or screen changes
  const saveProgress = async (screen: string, newData: Partial<OnboardingData>) => {
    const key = getStorageKey();
    if (!key) return;

    try {
      const progress: SavedProgress = {
        currentScreen: screen,
        data: newData,
      };
      await AsyncStorage.setItem(key, JSON.stringify(progress));
    } catch (err) {
      console.error('Error saving onboarding progress:', err);
    }
  };

  const navigateAndSave = (
    navigation: any,
    nextScreen: string,
    dataUpdates?: Partial<OnboardingData>
  ) => {
    const newData = dataUpdates ? { ...data, ...dataUpdates } : data;
    if (dataUpdates) {
      setData(newData);
    }
    currentScreenRef.current = nextScreen;
    saveProgress(nextScreen, newData);
    navigation.navigate(nextScreen);
  };

  const clearProgress = async () => {
    const key = getStorageKey();
    if (key) {
      try {
        await AsyncStorage.removeItem(key);
      } catch (err) {
        console.error('Error clearing onboarding progress:', err);
      }
    }
  };

  const saveProfile = async () => {
    const currentUser = userRef.current;
    if (!currentUser) {
      if (__DEV__) console.warn('saveProfile called without a user — skipping API call');
      return;
    }

    try {
      const heightInches = (data.heightFeet || 0) * 12 + (data.heightInches || 0);

      await api.updateProfile({
        gender: data.gender as 'male' | 'female' | 'other',
        birthday: data.birthday,
        height_inches: heightInches,
        weight_lbs: data.weight,
        activity_level: data.activityLevel as any,
        diet_plan: data.goal as 'maintain' | 'lose' | 'gain',
        calorie_target: data.targets?.calories,
        protein_target_g: data.targets?.protein,
        carbs_target_g: data.targets?.carbs,
        fat_target_g: data.targets?.fat,
      });
    } catch (err) {
      console.error('Error saving profile:', err);
    }

    // Clear progress and mark onboarding complete in AsyncStorage
    // (but do NOT call onComplete — that happens after subscription)
    await clearProgress();
    await AsyncStorage.removeItem('onboarding_progress_anon');
    await AsyncStorage.setItem(`onboarding_complete_${currentUser.id}`, 'true');
    analytics.onboardingComplete();
  };

  if (isLoading || !initialScreen) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <FunnelProvider
      apiKey={process.env.EXPO_PUBLIC_FK_API_KEY || ''}
      funnelId="onboarding"
      stepOrder={SCREEN_ORDER}
      endpoint={process.env.EXPO_PUBLIC_FK_API_URL}
    >
    <Stack.Navigator
      initialRouteName={initialScreen}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Welcome">
        {({ navigation }) => (
          <WelcomeScreen
            onContinue={() => navigateAndSave(navigation, 'Problem')}
            onLogin={() => navigation.navigate('Login')}
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
          headerStyle: { backgroundColor: '#FAF9F6' },
          animation: 'slide_from_right',
        }}
      />

      <Stack.Screen name="Problem">
        {({ navigation }) => (
          <ProblemScreen
            onContinue={() => navigateAndSave(navigation, 'Solution')}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Solution">
        {({ navigation }) => (
          <SolutionScreen
            onContinue={() => navigateAndSave(navigation, 'YouType')}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="YouType">
        {({ navigation }) => (
          <YouTypeScreen
            onContinue={() => navigateAndSave(navigation, 'WeCalculate')}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="WeCalculate">
        {({ navigation }) => (
          <WeCalculateScreen
            onContinue={() => navigateAndSave(navigation, 'Goal')}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Goal">
        {({ navigation }) => (
          <GoalScreen
            initialValue={data.goal}
            onContinue={(goal) => navigateAndSave(navigation, 'BiggestChallenge', { goal })}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="BiggestChallenge">
        {({ navigation }) => (
          <BiggestChallengeScreen
            initialValue={data.biggestChallenge}
            onContinue={(biggestChallenge) => navigateAndSave(navigation, 'Timeline', { biggestChallenge })}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Timeline">
        {({ navigation }) => (
          <TimelineScreen
            initialValue={data.timeline}
            onContinue={(timeline) => navigateAndSave(navigation, 'Gender', { timeline })}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Gender">
        {({ navigation }) => (
          <GenderScreen
            initialValue={data.gender}
            onContinue={(gender) => navigateAndSave(navigation, 'Birthday', { gender })}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Birthday">
        {({ navigation }) => (
          <BirthdayScreen
            initialValue={data.birthday}
            onContinue={(birthday) => navigateAndSave(navigation, 'BodyStats', { birthday })}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="BodyStats">
        {({ navigation }) => (
          <BodyStatsScreen
            initialValues={{
              heightFeet: data.heightFeet?.toString(),
              heightInches: data.heightInches?.toString(),
              weight: data.weight?.toString(),
            }}
            onContinue={(stats) => navigateAndSave(navigation, 'ActivityLevel', stats)}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="ActivityLevel">
        {({ navigation }) => (
          <ActivityLevelScreen
            initialValue={data.activityLevel}
            onContinue={(activityLevel) => {
              const heightInches = (data.heightFeet || 0) * 12 + (data.heightInches || 0);
              const age = data.birthday ? calculateAge(data.birthday) : 30;
              const tdee = calculateTDEE({
                gender: data.gender || 'other',
                age,
                heightInches,
                weightLbs: data.weight || 150,
                activityLevel,
              });
              const targets = calculateTargets(tdee, data.goal || 'maintain', data.weight || 150);

              navigateAndSave(navigation, 'MealFrequency', { activityLevel, targets });
            }}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="MealFrequency">
        {({ navigation }) => (
          <MealFrequencyScreen
            initialValue={data.mealFrequency}
            onContinue={(mealFrequency) => navigateAndSave(navigation, 'TypicalMeals', { mealFrequency })}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="TypicalMeals">
        {({ navigation }) => (
          <TypicalMealsScreen
            initialValue={data.eatingStyle}
            onContinue={(eatingStyle) => navigateAndSave(navigation, 'Science', { eatingStyle })}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Science">
        {({ navigation }) => (
          <ScienceScreen
            onContinue={() => navigateAndSave(navigation, 'Targets')}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Targets">
        {({ navigation }) => (
          <TargetsScreen
            targets={data.targets || { calories: 2000, protein: 150, carbs: 200, fat: 65 }}
            goal={data.goal || 'maintain'}
            onContinue={(customTargets) => {
              if (customTargets) {
                navigateAndSave(navigation, 'TryItNow', { targets: customTargets });
              } else {
                navigateAndSave(navigation, 'TryItNow');
              }
            }}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="TryItNow">
        {({ navigation }) => (
          <TryItNowScreen
            onContinue={async (input) => {
              let firstFood: OnboardingData['firstFood'] | undefined;
              try {
                const now = new Date();
                const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                const entry = await api.createLogEntry(input, localDate);
                if (entry && entry.food) {
                  firstFood = {
                    name: entry.food.name,
                    calories: Math.round(entry.food.calories_per_serving * entry.servings),
                  };
                }
              } catch (err) {
                console.error('Error logging first food:', err);
              }
              navigateAndSave(navigation, 'Ready', firstFood ? { firstFood } : undefined);
            }}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Ready">
        {({ navigation }) => (
          <ReadyScreen
            targets={data.targets || { calories: 2000, protein: 150, carbs: 200, fat: 65 }}
            firstFood={data.firstFood}
            onContinue={() => {
              // Profile is saved later in CreateAccount after authentication
              navigateAndSave(navigation, 'Congratulations');
            }}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Congratulations">
        {({ navigation }) => (
          <CongratulationsScreen
            firstFood={data.firstFood}
            onContinue={() => navigation.navigate('StreakCommit')}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="StreakCommit">
        {({ navigation }) => (
          <StreakCommitScreen
            onContinue={() => navigation.navigate('WhatToExpect')}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="WhatToExpect">
        {({ navigation }) => (
          <WhatToExpectScreen
            onContinue={() => navigateAndSave(navigation, 'CreateAccount')}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="CreateAccount">
        {({ navigation }) => (
          <CreateAccountScreen
            onAccountCreated={async () => {
              // Brief yield so useAuth re-renders with the new user before we call saveProfile
              await new Promise((r) => setTimeout(r, 100));
              await saveProfile();
              navigateAndSave(navigation, 'Paywall');
            }}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Paywall">
        {({ navigation }) => (
          <PaywallScreen
            onSubscribed={onComplete}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
    </FunnelProvider>
  );
}
