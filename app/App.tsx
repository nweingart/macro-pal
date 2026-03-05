import React from 'react';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Silence all console output in production builds
if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  LogBox.ignoreAllLogs();
}
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { SubscriptionProvider } from './src/context/SubscriptionContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { ToastProvider } from './src/context/ToastContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { DevModeProvider } from './src/dev/DevModeContext';
import { DevPanel } from './src/dev/DevPanel';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { OfflineBanner } from './src/components/OfflineBanner';

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <ToastProvider>
              <DevModeProvider>
                <AuthProvider>
                  <SubscriptionProvider>
                    <AppNavigator />
                    <OfflineBanner />
                  </SubscriptionProvider>
                </AuthProvider>
                {__DEV__ && <DevPanel />}
              </DevModeProvider>
            </ToastProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
