import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'colored';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  accentColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
  pressable?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Card({
  children,
  variant = 'default',
  accentColor,
  onPress,
  style,
  pressable = false,
}: CardProps) {
  const { colors, radius, shadows } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (pressable || onPress) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    if (pressable || onPress) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
  };

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'default':
        return {
          backgroundColor: colors.card,
          ...shadows.small,
        };
      case 'elevated':
        return {
          backgroundColor: colors.card,
          ...shadows.medium,
        };
      case 'outlined':
        return {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'colored':
        return {
          backgroundColor: colors.card,
          borderLeftWidth: 4,
          borderLeftColor: accentColor || colors.primary,
          ...shadows.small,
        };
      default:
        return {
          backgroundColor: colors.card,
          ...shadows.small,
        };
    }
  };

  const cardStyle = [
    styles.card,
    { borderRadius: radius.md },
    getVariantStyle(),
    style,
  ];

  if (onPress || pressable) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[cardStyle, animatedStyle]}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardHeader({ children, style }: CardHeaderProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.header, { borderBottomColor: colors.borderLight }, style]}>
      {children}
    </View>
  );
}

interface CardBodyProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardBody({ children, style }: CardBodyProps) {
  return <View style={[styles.body, style]}>{children}</View>;
}

interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardFooter({ children, style }: CardFooterProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.footer, { borderTopColor: colors.borderLight }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  body: {
    padding: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
});
