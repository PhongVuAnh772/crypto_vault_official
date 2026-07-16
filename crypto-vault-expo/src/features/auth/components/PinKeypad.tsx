import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PinKeypadProps {
  onPressNumber: (num: string) => void;
  onPressDelete: () => void;
}

const PinKeypad: React.FC<PinKeypadProps> = ({ onPressNumber, onPressDelete }) => {
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'];

  const renderButton = (item: string, index: number) => {
    if (item === '') return <View key={index} style={styles.buttonEmpty} />;
    
    if (item === 'delete') {
      return (
        <TouchableOpacity
          key={index}
          onPress={onPressDelete}
          style={styles.buttonAction}
        >
          <View style={styles.deleteIconWrapper}>
            <Feather name="x" size={18} color="white" />
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={index}
        onPress={() => onPressNumber(item)}
        style={styles.button}
      >
        <Text style={styles.buttonText}>{item}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {numbers.map((item, index) => renderButton(item, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 40,
  },
  button: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 12,
  },
  buttonEmpty: {
    width: 75,
    height: 75,
    margin: 12,
  },
  buttonAction: {
    width: 75,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 12,
  },
  buttonText: {
    fontSize: 24,
    color: '#000',
    fontWeight: '500',
  },
  deleteIconWrapper: {
    width: 50,
    height: 35,
    borderRadius: 12,
    backgroundColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
    // Backspace-like shape can be approximated with a cloud/bubble icon or custom SVG
  },
});

export default PinKeypad;
