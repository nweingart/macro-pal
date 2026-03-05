import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface QuantityStepperProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  step?: number;
}

export function QuantityStepper({
  value,
  onIncrement,
  onDecrement,
  min = 0.5,
  step = 0.5,
}: QuantityStepperProps) {
  const { colors, radius, shadows } = useTheme();
  const canDecrement = value > min;

  return (
    <View style={[styles.container, { backgroundColor: colors.borderLight, borderRadius: radius.sm }]}>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: canDecrement ? colors.white : colors.border, borderRadius: 6 },
          canDecrement && shadows.small,
        ]}
        onPress={onDecrement}
        disabled={!canDecrement}
        accessibilityLabel="Decrease servings"
        accessibilityRole="button"
      >
        <Text style={[styles.buttonText, { color: canDecrement ? colors.text : colors.textMuted }]}>
          -
        </Text>
      </TouchableOpacity>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.white, borderRadius: 6 }, shadows.small]}
        onPress={onIncrement}
        accessibilityLabel="Increase servings"
        accessibilityRole="button"
      >
        <Text style={[styles.buttonText, { color: colors.text }]}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  button: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'center',
  },
});
