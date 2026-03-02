import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

interface SkeletonBoxProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonBox({
  width = '100%',
  height = 16,
  borderRadius,
  style,
}: SkeletonBoxProps) {
  const { colors, radius } = useTheme();
  const shimmerProgress = useSharedValue(0);

  useEffect(() => {
    shimmerProgress.value = withRepeat(
      withTiming(1, { duration: 1200 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmerProgress.value, [0, 0.5, 1], [0.4, 0.7, 0.4]),
  }));

  return (
    <Animated.View
      style={[
        styles.box,
        {
          width: width as any,
          height,
          borderRadius: borderRadius ?? radius.sm,
          backgroundColor: colors.border,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

interface SkeletonTextProps {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
}

export function SkeletonText({
  width = '100%',
  height = 14,
  style,
}: SkeletonTextProps) {
  const { radius } = useTheme();
  return <SkeletonBox width={width} height={height} borderRadius={radius.xs} style={style} />;
}

interface SkeletonCardProps {
  height?: number;
  style?: ViewStyle;
}

export function SkeletonCard({ height = 80, style }: SkeletonCardProps) {
  const { colors, radius, shadows } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderRadius: radius.md },
        shadows.small,
        { height },
        style,
      ]}
    >
      <View style={styles.cardContent}>
        <SkeletonText width="60%" height={16} />
        <SkeletonText width="40%" height={12} style={{ marginTop: 8 }} />
        <SkeletonText width="80%" height={12} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

// Specific skeleton for FoodEntryCard
export function FoodEntryCardSkeleton() {
  const { colors, radius, shadows } = useTheme();

  return (
    <View style={[styles.foodCard, { backgroundColor: colors.card, borderRadius: radius.md }, shadows.small]}>
      <View style={styles.foodCardHeader}>
        <SkeletonText width="50%" height={16} />
        <SkeletonText width={60} height={16} />
      </View>
      <View style={styles.foodCardMacros}>
        <SkeletonText width={50} height={12} />
        <SkeletonText width={50} height={12} />
        <SkeletonText width={50} height={12} />
      </View>
      <SkeletonText width="30%" height={12} style={{ marginTop: 8 }} />
    </View>
  );
}

// Specific skeleton for DailyTotals
export function DailyTotalsSkeleton() {
  const { colors, radius, shadows } = useTheme();

  return (
    <View style={[styles.totalsCard, { backgroundColor: colors.card, borderRadius: radius.md }, shadows.small]}>
      <View style={styles.totalsHeader}>
        <SkeletonText width={100} height={32} />
        <SkeletonText width={80} height={16} style={{ marginLeft: 8 }} />
      </View>
      <View style={styles.totalsBar}>
        <View style={styles.totalsBarHeader}>
          <SkeletonText width={50} height={14} />
          <SkeletonText width={60} height={14} />
        </View>
        <SkeletonBox width="100%" height={8} style={{ marginTop: 4 }} />
      </View>
      <View style={styles.totalsBar}>
        <View style={styles.totalsBarHeader}>
          <SkeletonText width={40} height={14} />
          <SkeletonText width={60} height={14} />
        </View>
        <SkeletonBox width="100%" height={8} style={{ marginTop: 4 }} />
      </View>
      <View style={styles.totalsBar}>
        <View style={styles.totalsBarHeader}>
          <SkeletonText width={30} height={14} />
          <SkeletonText width={60} height={14} />
        </View>
        <SkeletonBox width="100%" height={8} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {},
  card: {
    padding: 16,
    marginBottom: 12,
  },
  cardContent: {},
  foodCard: {
    padding: 16,
    marginBottom: 12,
  },
  foodCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodCardMacros: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  totalsCard: {
    padding: 16,
    marginBottom: 16,
  },
  totalsHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  totalsBar: {
    marginBottom: 12,
  },
  totalsBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
