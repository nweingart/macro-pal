import React from 'react';
import { View, Image, StyleSheet, ImageSourcePropType } from 'react-native';

export type MascotMood = 'happy' | 'excited' | 'thinking' | 'celebrating' | 'sleepy';

const moodAssets: Record<MascotMood, ImageSourcePropType> = {
  happy: require('../../assets/teddy/happy.png'),
  excited: require('../../assets/teddy/excited.png'),
  thinking: require('../../assets/teddy/thinking.png'),
  celebrating: require('../../assets/teddy/celebrating.png'),
  sleepy: require('../../assets/teddy/sleepy.png'),
};

interface MascotProps {
  size?: number;
  mood?: MascotMood;
}

export function Mascot({ size = 120, mood = 'happy' }: MascotProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={moodAssets[mood]}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
