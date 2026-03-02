import 'expo-crypto';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Log initialization only once (not on every Fast Refresh)
let hasLoggedInit = false;
const logInit = () => {
  if (hasLoggedInit) return;
  hasLoggedInit = true;

  logger.info('Supabase', 'Initializing client', {
    url: supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    anonKeyLength: supabaseAnonKey.length,
  });

  if (!supabaseUrl || !supabaseAnonKey) {
    logger.error('Supabase', 'Missing required environment variables', {
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
    });
  }
};

logInit();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
