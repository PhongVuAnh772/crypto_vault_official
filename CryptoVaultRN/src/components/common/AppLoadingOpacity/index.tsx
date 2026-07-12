import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import appStyles from 'src/core/styles';

export const AppLoadingOpacity: React.FC<{
    isLoading: boolean;
    children: React.ReactNode;
    secondView: React.ReactNode;
}> = ({ isLoading, children, secondView }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const childrenOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(opacity, {
            toValue: isLoading ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading]);

    useEffect(() => {
        Animated.timing(childrenOpacity, {
            toValue: isLoading ? 0 : 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading]);

    if (!isLoading) {
        return (
            <Animated.View
                style={[{ opacity: childrenOpacity }, [appStyles.flex1]]}>
                {children}
            </Animated.View>
        );
    }
    return (
        <Animated.View style={[{ opacity }, appStyles.flex1]}>
            {secondView}
        </Animated.View>
    );
};
