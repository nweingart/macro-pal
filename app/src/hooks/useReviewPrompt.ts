import { useCallback } from 'react';
import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REVIEW_KEY = 'review_prompt_state';
const FOOD_LOG_THRESHOLD = 15; // Ask after 15 food logs
const MIN_DAYS_BETWEEN = 60; // Don't re-ask within 60 days

interface ReviewState {
  foodLogCount: number;
  lastPromptedAt: string | null;
}

/**
 * Tracks food-log count and prompts for an App Store review
 * once the user has logged enough food (and hasn't been asked recently).
 */
export function useReviewPrompt() {
  const maybeTrigger = useCallback(async () => {
    try {
      const canRequest = await StoreReview.isAvailableAsync();
      if (!canRequest) return;

      const raw = await AsyncStorage.getItem(REVIEW_KEY);
      const state: ReviewState = raw
        ? JSON.parse(raw)
        : { foodLogCount: 0, lastPromptedAt: null };

      state.foodLogCount += 1;

      // Check if we've hit the threshold
      if (state.foodLogCount >= FOOD_LOG_THRESHOLD) {
        // Don't re-ask within the cooldown period
        if (state.lastPromptedAt) {
          const daysSince = (Date.now() - new Date(state.lastPromptedAt).getTime()) / (1000 * 60 * 60 * 24);
          if (daysSince < MIN_DAYS_BETWEEN) {
            await AsyncStorage.setItem(REVIEW_KEY, JSON.stringify(state));
            return;
          }
        }

        await StoreReview.requestReview();
        state.foodLogCount = 0;
        state.lastPromptedAt = new Date().toISOString();
      }

      await AsyncStorage.setItem(REVIEW_KEY, JSON.stringify(state));
    } catch {
      // Non-critical — silently ignore
    }
  }, []);

  return { maybeTrigger };
}
