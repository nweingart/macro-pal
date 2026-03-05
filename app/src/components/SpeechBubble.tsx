import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface SpeechBubbleProps {
  message: string;
  maxWidth?: number;
}

export function SpeechBubble({ message, maxWidth = 220 }: SpeechBubbleProps) {
  const { colors, radius } = useTheme();

  return (
    <View style={[styles.container, { maxWidth }]}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: radius.md,
          },
        ]}
      >
        <Text style={[styles.text, { color: colors.text }]}>{message}</Text>
      </View>
      <View style={styles.triangleWrapper}>
        <View style={[styles.triangleOuter, { borderTopColor: colors.border }]} />
        <View style={[styles.triangleInner, { borderTopColor: colors.card }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  triangleWrapper: {
    alignItems: 'center',
    height: 10,
  },
  triangleOuter: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  triangleInner: {
    position: 'absolute',
    top: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderTopWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
