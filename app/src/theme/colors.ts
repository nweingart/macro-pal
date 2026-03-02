export const colors = {
  // Brand - Macro Pal Orange
  primary: '#f97316',
  primaryDark: '#ea580c',
  primaryLight: '#ffedd5',

  // Semantic
  success: '#10b981',
  successLight: '#d1fae5',
  warning: '#fbbf24',
  warningLight: '#fef3c7',
  warningDark: '#92400e',
  error: '#ef4444',
  errorLight: '#fee2e2',
  info: '#3b82f6',
  infoLight: '#dbeafe',

  // Macros (semantic naming)
  protein: '#3b82f6',
  carbs: '#fbbf24',
  fat: '#10b981',

  // Neutrals
  white: '#ffffff',
  background: '#f9fafb',
  card: '#ffffff',
  border: '#e5e7eb',
  borderLight: '#f3f4f6',

  // Text
  text: '#111827',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  textLight: '#d1d5db',

  // Shadows
  shadow: '#000000',

  // Transparent
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

export type ColorKey = keyof typeof colors;
