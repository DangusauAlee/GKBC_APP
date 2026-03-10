import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, LinearGradient, Defs, Stop } from 'react-native-svg';

interface VerifiedBadgeProps {
  size?: number;
}

const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ size = 16 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Defs>
          <LinearGradient id="green-gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#10B981" />
            <Stop offset="1" stopColor="#059669" />
          </LinearGradient>
        </Defs>
        <Circle cx="12" cy="12" r="12" fill="url(#green-gradient)" />
        <Path
          d="M7 12L10 15L17 9"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VerifiedBadge;
