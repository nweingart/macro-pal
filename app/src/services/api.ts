import axios, { AxiosInstance } from 'axios';
import { supabase } from './supabase';
import {
  DailyLog,
  Food,
  MealLogEntry,
  UserProfile,
  TrackingSummary,
  MicronutrientAnalysis,
} from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('EXPO_PUBLIC_API_URL environment variable is required');
}

let onUnauthorizedCallback: (() => void) | null = null;

export function setOnUnauthorized(callback: () => void) {
  onUnauthorizedCallback = callback;
}

class ApiClient {
  private client: AxiosInstance;
  private cachedToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 30_000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Keep token cache in sync with auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        this.cachedToken = session.access_token;
        this.tokenExpiresAt = (session.expires_at ?? 0) * 1000;
      } else if (event === 'SIGNED_OUT') {
        this.cachedToken = null;
        this.tokenExpiresAt = 0;
      }
    });

    this.client.interceptors.request.use(async (config) => {
      // Use cached token if still valid (with 30s buffer)
      if (this.cachedToken && Date.now() < this.tokenExpiresAt - 30_000) {
        config.headers.Authorization = `Bearer ${this.cachedToken}`;
        return config;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        this.cachedToken = session.access_token;
        this.tokenExpiresAt = (session.expires_at ?? 0) * 1000;
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
      return config;
    });

    // Retry once on 401 after refreshing the session
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const { data: { session } } = await supabase.auth.refreshSession();
            if (session?.access_token) {
              this.cachedToken = session.access_token;
              this.tokenExpiresAt = (session.expires_at ?? 0) * 1000;
              originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
              return this.client(originalRequest);
            }
          } catch {
            // Refresh failed — fall through to sign-out
          }
          // No valid session after refresh — trigger sign-out
          this.cachedToken = null;
          this.tokenExpiresAt = 0;
          onUnauthorizedCallback?.();
        }
        return Promise.reject(error);
      }
    );
  }

  // Log endpoints
  async createLogEntry(input: string, date?: string): Promise<MealLogEntry> {
    const response = await this.client.post('/api/log', { input, date });
    return response.data;
  }

  async getLogByDate(date: string): Promise<DailyLog> {
    const response = await this.client.get(`/api/log/${date}`);
    return response.data;
  }

  async updateLogEntry(id: string, servings: number): Promise<MealLogEntry> {
    const response = await this.client.patch(`/api/log/${id}`, { servings });
    return response.data;
  }

  async deleteLogEntry(id: string): Promise<void> {
    await this.client.delete(`/api/log/${id}`);
  }

  // Food library endpoints
  async getFoods(): Promise<Food[]> {
    const response = await this.client.get('/api/foods');
    return response.data;
  }

  async updateFood(id: string, updates: Partial<Food>): Promise<Food> {
    const response = await this.client.patch(`/api/foods/${id}`, updates);
    return response.data;
  }

  async deleteFood(id: string): Promise<void> {
    await this.client.delete(`/api/foods/${id}`);
  }

  // Profile endpoints
  async getProfile(): Promise<UserProfile | null> {
    const response = await this.client.get('/api/profile');
    return response.data;
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const response = await this.client.put('/api/profile', updates);
    return response.data;
  }

  // Streak freeze endpoints
  async consumeStreakFreeze(date: string): Promise<UserProfile> {
    return this.updateProfile({
      streak_freeze_available: false,
      streak_freeze_used_on: date,
    });
  }

  async refillStreakFreeze(): Promise<UserProfile> {
    return this.updateProfile({ streak_freeze_available: true });
  }

  // Tracking endpoints
  async getTrackingSummary(startDate: string, endDate: string): Promise<TrackingSummary> {
    const response = await this.client.get('/api/tracking/summary', {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  }

  // Nutrients endpoints
  async getNutrientAnalysis(date: string): Promise<MicronutrientAnalysis> {
    const response = await this.client.get(`/api/nutrients/${date}`);
    return response.data;
  }

  // Account endpoints
  async deleteAccount(): Promise<void> {
    await this.client.delete('/api/profile/account');
  }
}

export const api = new ApiClient();
