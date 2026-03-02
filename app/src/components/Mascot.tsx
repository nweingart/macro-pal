import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Ellipse, Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';

type MascotMood = 'happy' | 'excited' | 'thinking' | 'celebrating' | 'sleepy';

interface MascotProps {
  size?: number;
  mood?: MascotMood;
}

export function Mascot({ size = 120, mood = 'happy' }: MascotProps) {
  const scale = size / 200;

  // Mouth paths for different moods
  const getMouthPath = () => {
    switch (mood) {
      case 'excited':
        return 'M60 115 Q100 145 140 115'; // Big smile
      case 'thinking':
        return 'M80 120 Q100 115 120 120'; // Slight concerned
      case 'celebrating':
        return 'M60 110 Q100 155 140 110'; // Huge smile
      case 'sleepy':
        return 'M80 120 L120 120'; // Flat line
      case 'happy':
      default:
        return 'M70 115 Q100 140 130 115'; // Normal smile
    }
  };

  // Eye variations for different moods
  const getEyeStyle = () => {
    switch (mood) {
      case 'excited':
        return { pupilScale: 1.2, eyeY: 85 };
      case 'thinking':
        return { pupilScale: 0.9, eyeY: 80 };
      case 'celebrating':
        return { pupilScale: 1.1, eyeY: 82 };
      case 'sleepy':
        return { pupilScale: 0.7, eyeY: 88 };
      case 'happy':
      default:
        return { pupilScale: 1, eyeY: 85 };
    }
  };

  const eyeStyle = getEyeStyle();

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Defs>
          <LinearGradient id="mascotBodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#fb923c" />
            <Stop offset="100%" stopColor="#f97316" />
          </LinearGradient>
        </Defs>

        {/* Shadow */}
        <Ellipse cx="100" cy="175" rx="55" ry="12" fill="#fdba74" opacity={0.5} />

        {/* Body */}
        <Path
          d="M100 35 C155 35 175 70 175 105 C175 140 155 165 100 165 C45 165 25 140 25 105 C25 70 45 35 100 35"
          fill="url(#mascotBodyGradient)"
        />

        {/* Body highlight */}
        <Ellipse cx="75" cy="75" rx="20" ry="25" fill="#fff" opacity={0.3} />

        {/* Left arm */}
        <Ellipse cx="30" cy="115" rx="12" ry="10" fill="#f97316" />

        {/* Right arm */}
        <G>
          <Ellipse cx="170" cy="110" rx="12" ry="10" fill="#f97316" />
          {mood === 'celebrating' && (
            <Ellipse cx="178" cy="95" rx="5" ry="10" fill="#f97316" />
          )}
        </G>

        {/* Left eye white */}
        <Ellipse cx="75" cy={eyeStyle.eyeY} rx="18" ry="20" fill="#fff" />
        {/* Left eye pupil */}
        <Ellipse
          cx="78"
          cy={eyeStyle.eyeY + 2}
          rx={9 * eyeStyle.pupilScale}
          ry={11 * eyeStyle.pupilScale}
          fill="#1f2937"
        />
        {/* Left eye shine */}
        <Circle cx="82" cy={eyeStyle.eyeY - 3} r="4" fill="#fff" />

        {/* Right eye white */}
        <Ellipse cx="125" cy={eyeStyle.eyeY} rx="18" ry="20" fill="#fff" />
        {/* Right eye pupil */}
        <Ellipse
          cx="128"
          cy={eyeStyle.eyeY + 2}
          rx={9 * eyeStyle.pupilScale}
          ry={11 * eyeStyle.pupilScale}
          fill="#1f2937"
        />
        {/* Right eye shine */}
        <Circle cx="132" cy={eyeStyle.eyeY - 3} r="4" fill="#fff" />

        {/* Sleepy eyes (closed) */}
        {mood === 'sleepy' && (
          <>
            <Path d="M60 85 Q75 95 90 85" stroke="#1f2937" strokeWidth="3" fill="none" />
            <Path d="M110 85 Q125 95 140 85" stroke="#1f2937" strokeWidth="3" fill="none" />
          </>
        )}

        {/* Cheeks */}
        <Ellipse cx="50" cy="105" rx="12" ry="8" fill="#fb923c" opacity={0.6} />
        <Ellipse cx="150" cy="105" rx="12" ry="8" fill="#fb923c" opacity={0.6} />

        {/* Mouth */}
        <Path
          d={getMouthPath()}
          stroke="#1f2937"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Celebration sparkles */}
        {mood === 'celebrating' && (
          <>
            <Path d="M40 40 L45 50 L40 60 L35 50 Z" fill="#fbbf24" />
            <Path d="M160 45 L165 55 L160 65 L155 55 Z" fill="#fbbf24" />
            <Circle cx="55" cy="30" r="4" fill="#fbbf24" />
            <Circle cx="145" cy="35" r="4" fill="#fbbf24" />
          </>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
