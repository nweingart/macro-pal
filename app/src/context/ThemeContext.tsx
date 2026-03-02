import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, Theme } from '../theme';

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  forcedTheme?: 'light' | 'dark';
}

export function ThemeProvider({ children, forcedTheme }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();

  const value = useMemo(() => {
    const isDark = forcedTheme
      ? forcedTheme === 'dark'
      : systemColorScheme === 'dark';

    // For now, always use light theme (dark mode is future-ready)
    const theme = lightTheme;

    return { theme, isDark: false };
  }, [forcedTheme, systemColorScheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context.theme;
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}
