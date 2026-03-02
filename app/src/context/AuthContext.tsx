import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { setOnUnauthorized } from '../services/api';
import { logger } from '../utils/logger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  pendingConfirmationEmail: string | null;
  signUp: (email: string, password: string) => Promise<{ error: Error | null; needsConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  clearPendingConfirmation: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState<string | null>(null);

  const clearPendingConfirmation = () => {
    setPendingConfirmationEmail(null);
  };

  useEffect(() => {
    logger.info('Auth', 'Checking existing session...');
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        logger.error('Auth', 'Failed to get session', error);
      } else {
        logger.info('Auth', 'Session check complete', {
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email,
        });
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[AuthContext] onAuthStateChange event:', event, 'session:', session?.user?.id || null);
        logger.info('Auth', 'Auth state changed', {
          event,
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email,
        });
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    logger.info('Auth', 'Attempting sign up', { email });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        logger.error('Auth', 'Sign up failed', {
          message: error.message,
          status: error.status,
          name: error.name,
        });
        return { error: error as Error | null, needsConfirmation: false };
      } else {
        logger.info('Auth', 'Sign up response', {
          hasUser: !!data.user,
          hasSession: !!data.session,
          userId: data.user?.id,
          email: data.user?.email,
          emailConfirmedAt: data.user?.email_confirmed_at,
          confirmationSentAt: data.user?.confirmation_sent_at,
        });

        // User created but needs email confirmation
        // TODO: Re-enable for production
        // if (data.user && !data.session) {
        //   logger.info('Auth', 'Email confirmation required');
        //   setPendingConfirmationEmail(email);
        //   return { error: null, needsConfirmation: true };
        // }

        return { error: null, needsConfirmation: false };
      }
    } catch (e) {
      logger.error('Auth', 'Sign up exception', e);
      return { error: e as Error, needsConfirmation: false };
    }
  };

  const signIn = async (email: string, password: string) => {
    logger.info('Auth', 'Attempting sign in', { email });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        logger.error('Auth', 'Sign in failed', {
          message: error.message,
          status: error.status,
          name: error.name,
        });
      } else {
        logger.info('Auth', 'Sign in successful', {
          userId: data.user?.id,
          email: data.user?.email,
          hasSession: !!data.session,
        });
      }
      return { error: error as Error | null };
    } catch (e) {
      logger.error('Auth', 'Sign in exception', e);
      return { error: e as Error };
    }
  };

  const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
    try {
      // Dynamic imports — these native modules aren't available in Expo Go
      const WebBrowser = await import('expo-web-browser');
      const Linking = await import('expo-linking');

      const redirectUrl = Linking.createURL('auth/callback');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error || !data.url) {
        return { error: (error as Error) || new Error('No OAuth URL returned') };
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      if (result.type !== 'success') {
        return { error: null }; // User cancelled — not an error
      }

      // Supabase returns tokens in URL fragment: #access_token=...&refresh_token=...
      const params = new URLSearchParams(result.url.split('#')[1] || '');
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (!accessToken || !refreshToken) {
        return { error: new Error('Authentication failed — missing tokens') };
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      return { error: sessionError ? (sessionError as Error) : null };
    } catch (e) {
      return { error: e as Error };
    }
  };

  const signOut = async () => {
    logger.info('Auth', 'Signing out');

    // Clear local state FIRST to immediately prevent API calls from other components
    setUser(null);
    setSession(null);

    // Then sign out from Supabase (may fail if user already deleted, that's fine)
    try {
      await supabase.auth.signOut();
    } catch (err) {
      // Expected to fail if user was deleted
      logger.error('Auth', 'SignOut error (expected if user deleted)', err);
    }

    logger.info('Auth', 'Signed out successfully');
  };

  // Register signOut as the global 401 callback (uses ref to avoid stale closure)
  const signOutRef = useRef(signOut);
  signOutRef.current = signOut;

  useEffect(() => {
    setOnUnauthorized(() => signOutRef.current());
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        pendingConfirmationEmail,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        clearPendingConfirmation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
