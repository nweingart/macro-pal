import { Session } from '@supabase/supabase-js';
import { useRealAuth } from '../context/AuthContext';
import { useDevMode } from '../dev/DevModeContext';

export function useAuth() {
  const realAuth = useRealAuth();
  const dev = useDevMode();

  if (dev.enabled && dev.authBypassed) {
    const { mockUser } = require('../dev/mockData');
    return {
      user: mockUser,
      session: { access_token: 'dev-token' } as Session,
      loading: false,
      pendingConfirmationEmail: null,
      signUp: async () => ({ error: null }),
      signIn: async () => ({ error: null }),
      signInWithGoogle: async () => ({ error: null }),
      signOut: async () => { dev.setAuthBypassed(false); },
      clearPendingConfirmation: () => {},
    };
  }

  return realAuth;
}
