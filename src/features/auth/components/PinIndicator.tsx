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
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 12,
  },
  dotFilled: {
    backgroundColor: '#3B82F6', // Vibrant blue as seen in the image
  },
  dotEmpty: {
    backgroundColor: '#D1D5DB', // Light grey for empty state
  },
});

export default PinIndicator;
