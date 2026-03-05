/**
 * Safe wrapper around expo-speech-recognition.
 * Falls back to no-ops when the native module is unavailable (e.g. Expo Go).
 */
import { useRef } from 'react';

let realModule: any = null;

try {
  realModule = require('expo-speech-recognition');
} catch {
  console.warn('[SpeechRecognition] Native module not available — speech features disabled');
}

// ── ExpoSpeechRecognitionModule (safe proxy) ───────────────────────

const noopPermission = { status: 'undetermined' as const, granted: false, canAskAgain: true, expires: 'never' as const };

export const ExpoSpeechRecognitionModule = realModule
  ? realModule.ExpoSpeechRecognitionModule
  : {
      getPermissionsAsync: async () => noopPermission,
      requestPermissionsAsync: async () => noopPermission,
      start: async (_options: any) => {},
      stop: async () => {},
    };

// ── useSpeechRecognitionEvent (safe hook) ──────────────────────────

/**
 * If the native module loaded, delegates to the real hook.
 * Otherwise, a no-op hook that does nothing.
 */
export const useSpeechRecognitionEvent: typeof import('expo-speech-recognition').useSpeechRecognitionEvent =
  realModule
    ? realModule.useSpeechRecognitionEvent
    : (_event: any, _callback: any) => {
        // no-op — satisfy rules of hooks by being a stable function reference
      };
