import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PinKeypadProps {
  onPressNumber: (num: string) => void;
  onPressDelete: () => void;
}

interface KeypadKey {
  num: string;
  sub: string;
}

const PinKeypad: React.FC<PinKeypadProps> = ({ onPressNumber, onPressDelete }) => {
  const keypadKeys: KeypadKey[] = [
    { num: '1', sub: '' },
    { num: '2', sub: 'ABC' },
    { num: '3', sub: 'DEF' },
    { num: '4', sub: 'GHI' },
    { num: '5', sub: 'JKL' },
    { num: '6', sub: 'MNO' },
    { num: '7', sub: 'PQRS' },
    { num: '8', sub: 'TUV' },
    { num: '9', sub: 'WXYZ' },
    { num: '', sub: '' },
    { num: '0', sub: '+' },
    { num: 'delete', sub: '' },
  ];

  const renderButton = (item: KeypadKey, index: number) => {
    if (item.num === '') return <View key={index} style={styles.buttonEmpty} />;
    
    if (item.num === 'delete') {
      return (
        <TouchableOpacity
          key={index}
          onPress={onPressDelete}
          style={styles.buttonAction}
          activeOpacity={0.7}
        >
          <View style={styles.deleteIconWrapper}>
            <Ionicons name="backspace-outline" size={24} color="#5B63E4" />
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={index}
        onPress={() => onPressNumber(item.num)}
        style={styles.button}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>{item.num}</Text>
        {item.sub ? <Text style={styles.buttonSubText}>{item.sub}</Text> : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {keypadKeys.map((item, index) => renderButton(item, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginTop: 20,
  },
  button: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2, // Android shadow
  },
  buttonEmpty: {
    width: 78,
    height: 78,
    marginHorizontal: 12,
    marginVertical: 10,
  },
  buttonAction: {
    width: 78,
    height: 78,
    borderRadius: 24, // Squircle shape
    backgroundColor: '#EAEAFF', // Light purple/blue background
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 28,
    color: '#0A0E1A',
    fontWeight: '500',
  },
  buttonSubText: {
    fontSize: 9,
    color: '#7C8099',
    fontWeight: '600',
    marginTop: 1,
    letterSpacing: 1,
  },
  deleteIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PinKeypad;
