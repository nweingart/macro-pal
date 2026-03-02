import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_DURATION = 3000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const animatedValues = useRef<Map<string, Animated.Value>>(new Map());

  const removeToast = useCallback((id: string) => {
    const animValue = animatedValues.current.get(id);
    if (animValue) {
      Animated.timing(animValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        animatedValues.current.delete(id);
      });
    }
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    const animValue = new Animated.Value(0);
    animatedValues.current.set(id, animValue);

    setToasts((prev) => [...prev, { id, message, type }]);

    Animated.timing(animValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    setTimeout(() => removeToast(id), TOAST_DURATION);
  }, [removeToast]);

  const success = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const error = useCallback((message: string) => showToast(message, 'error'), [showToast]);
  const warning = useCallback((message: string) => showToast(message, 'warning'), [showToast]);
  const info = useCallback((message: string) => showToast(message, 'info'), [showToast]);

  const getToastColors = (type: ToastType) => {
    switch (type) {
      case 'success':
        return { bg: colors.successLight, border: colors.success, icon: 'checkmark-circle' as const };
      case 'error':
        return { bg: colors.errorLight, border: colors.error, icon: 'close-circle' as const };
      case 'warning':
        return { bg: colors.warningLight, border: colors.warning, icon: 'warning' as const };
      case 'info':
      default:
        return { bg: colors.infoLight, border: colors.info, icon: 'information-circle' as const };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <View style={[styles.container, { top: insets.top + 10 }]} pointerEvents="box-none">
        {toasts.map((toast) => {
          const animValue = animatedValues.current.get(toast.id);
          const toastColors = getToastColors(toast.type);

          return (
            <Animated.View
              key={toast.id}
              style={[
                styles.toast,
                {
                  backgroundColor: toastColors.bg,
                  borderColor: toastColors.border,
                  opacity: animValue,
                  transform: [
                    {
                      translateY: animValue?.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
                      }) || 0,
                    },
                  ],
                },
              ]}
            >
              <Ionicons name={toastColors.icon} size={20} color={toastColors.border} />
              <Text style={[styles.message, { color: colors.text }]}>{toast.message}</Text>
              <TouchableOpacity onPress={() => removeToast(toast.id)}>
                <Ionicons name="close" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: '100%',
  },
  message: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 14,
    fontWeight: '500',
  },
});
