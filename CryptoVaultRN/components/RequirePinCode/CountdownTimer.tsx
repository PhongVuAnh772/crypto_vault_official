import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type CountdownTimerType = {
    remainingTime: number;
};

const CountdownTimer: React.FC<CountdownTimerType> = ({ remainingTime }) => {
    const minutes = Math.floor(remainingTime / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

    return (
        <View style={styles.container}>
            <Text style={styles.timerText}>
                {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timerText: {
        fontSize: 48,
        fontWeight: 'bold',
    },
});

export default CountdownTimer;
