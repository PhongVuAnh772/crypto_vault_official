import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CurvedTabBarBackgroundProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
}

const CurvedTabBarBackground: React.FC<CurvedTabBarBackgroundProps> = ({
  width = SCREEN_WIDTH * 0.92,
  height = 70,
  backgroundColor = '#121212',
}) => {
  const barWidth = width;
  const barHeight = height;
  const center = barWidth / 2;
  const radius = 38; // Increased radius for smoother dip
  const notchWidth = radius * 2.5;
  const hole = notchWidth / 2;
  const cornerRadius = 30;

  // Smoother cubic bezier curves for the notch
  // We want the curve to start slightly before the hole and end slightly after
  const d = `
    M ${cornerRadius} 0
    L ${center - hole} 0
    C ${center - radius} 0, ${center - radius} ${radius}, ${center} ${radius}
    C ${center + radius} ${radius}, ${center + radius} 0, ${center + hole} 0
    L ${barWidth - cornerRadius} 0
    Q ${barWidth} 0, ${barWidth} ${cornerRadius}
    L ${barWidth} ${barHeight - cornerRadius}
    Q ${barWidth} ${barHeight}, ${barWidth - cornerRadius} ${barHeight}
    L ${cornerRadius} ${barHeight}
    Q 0 ${barHeight}, 0 ${barHeight - cornerRadius}
    L 0 ${cornerRadius}
    Q 0 0, ${cornerRadius} 0
    Z
  `;

  return (
    <View style={[styles.container, { width: barWidth, height: barHeight }]}>
      <Svg width={barWidth} height={barHeight + 10} style={{ top: -2 }}>
        <Path 
          d={d} 
          fill={backgroundColor} 
          stroke="rgba(255,255,255,0.08)" 
          strokeWidth={0.5}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    zIndex: -1,
  },
});

export default CurvedTabBarBackground;
