import React from 'react';
import { StyleSheet, View } from 'react-native';

interface PinIndicatorProps {
  length: number;
  value: string;
}

const PinIndicator: React.FC<PinIndicatorProps> = ({ length = 4, value = "" }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index < value.length ? styles.dotFilled : styles.dotEmpty,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginHorizontal: 10,
    borderWidth: 1.5,
  },
  dotFilled: {
    backgroundColor: '#5B63E4', // Vibrant blue/purple matching the shield
    borderColor: '#5B63E4',
  },
  dotEmpty: {
    backgroundColor: 'transparent',
    borderColor: '#C7D2FE', // Light indigo/purple outline matching image
  },
});

export default PinIndicator;
