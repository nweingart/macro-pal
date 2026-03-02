import { colors } from './colors';
import { spacing, radius, hitSlop } from './spacing';
import { typography } from './typography';

export { colors } from './colors';
export { spacing, radius, hitSlop } from './spacing';
export { typography } from './typography';

export type { ColorKey } from './colors';
export type { SpacingKey, RadiusKey } from './spacing';
export type { TypographyKey } from './typography';

// Shadow presets
export const shadows = {
  small: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

// Light theme (default)
export const lightTheme = {
  colors,
  spacing,
  radius,
  typography,
  shadows,
  hitSlop,
} as const;

// Dark theme (future-ready)
export const darkTheme = {
  colors: {
    ...colors,
    // Override colors for dark mode
    background: '#111827',
    card: '#1f2937',
    border: '#374151',
    borderLight: '#4b5563',
    text: '#f9fafb',
    textSecondary: '#d1d5db',
    textMuted: '#9ca3af',
    textLight: '#6b7280',
    white: '#1f2937', // Used for card backgrounds in dark mode
  },
  spacing,
  radius,
  typography,
  shadows: {
    small: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 8,
    },
  },
  hitSlop,
} as const;

export type Theme = typeof lightTheme;
