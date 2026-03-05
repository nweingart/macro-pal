import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MascotMood } from '../components/Mascot';
import { DataPreset } from './mockData';

// ── State ──────────────────────────────────────────────────────────

export interface DevModeState {
  enabled: boolean;
  authBypassed: boolean;
  subscriptionOverride: boolean;
  onboardingComplete: boolean;
  dataPreset: DataPreset;
  moodOverride: MascotMood | null;
}

interface DevModeContextType extends DevModeState {
  setEnabled: (v: boolean) => void;
  setAuthBypassed: (v: boolean) => void;
  setSubscriptionOverride: (v: boolean) => void;
  setOnboardingComplete: (v: boolean) => void;
  setDataPreset: (v: DataPreset) => void;
  setMoodOverride: (v: MascotMood | null) => void;
  resetAll: () => void;
}

const STORAGE_KEY = 'dev_mode_state';

const DEFAULTS: DevModeState = {
  enabled: false,
  authBypassed: true,
  subscriptionOverride: true,
  onboardingComplete: true,
  dataPreset: 'full',
  moodOverride: null,
};

// ── Production no-op ───────────────────────────────────────────────

const NOOP_CONTEXT: DevModeContextType = {
  ...DEFAULTS,
  enabled: false,
  setEnabled: () => {},
  setAuthBypassed: () => {},
  setSubscriptionOverride: () => {},
  setOnboardingComplete: () => {},
  setDataPreset: () => {},
  setMoodOverride: () => {},
  resetAll: () => {},
};

// ── Context ────────────────────────────────────────────────────────

const DevModeContext = createContext<DevModeContextType>(NOOP_CONTEXT);

// ── Provider ───────────────────────────────────────────────────────

export function DevModeProvider({ children }: { children: React.ReactNode }) {
  // In production builds, always return no-op context to prevent
  // dev overrides from ever leaking (e.g. via stale AsyncStorage).
  if (!__DEV__) {
    return (
      <DevModeContext.Provider value={NOOP_CONTEXT}>
        {children}
      </DevModeContext.Provider>
    );
  }

  const [state, setState] = useState<DevModeState>(DEFAULTS);
  const loaded = useRef(false);

  // Load persisted state on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const saved = JSON.parse(raw) as Partial<DevModeState>;
          setState((prev) => ({ ...prev, ...saved }));
        } catch {}
      }
      loaded.current = true;
    });
  }, []);

  // Persist on every change (after initial load)
  useEffect(() => {
    if (loaded.current) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const update = useCallback(<K extends keyof DevModeState>(key: K, value: DevModeState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const ctx: DevModeContextType = {
    ...state,
    setEnabled:              (v) => update('enabled', v),
    setAuthBypassed:         (v) => update('authBypassed', v),
    setSubscriptionOverride: (v) => update('subscriptionOverride', v),
    setOnboardingComplete:   (v) => update('onboardingComplete', v),
    setDataPreset:           (v) => update('dataPreset', v),
    setMoodOverride:         (v) => update('moodOverride', v),
    resetAll:                ()  => setState(DEFAULTS),
  };

  return (
    <DevModeContext.Provider value={ctx}>
      {children}
    </DevModeContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────

/**
 * Safe to call unconditionally in any component.
 * In production builds, returns `{ enabled: false }` with no-op setters.
 */
export function useDevMode(): DevModeContextType {
  return useContext(DevModeContext);
}
