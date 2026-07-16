import {Animated, StyleProp, View, ViewStyle} from 'react-native';
import React, {useEffect, useRef} from 'react';
import appAnimationSelect from './style';

type AppAnimationSelectType = {
    top: number;
    left?: number;
    height: number;
    isShow: boolean;
    children: React.ReactNode;
    width?: number;
    right?: number;
    containerStyle?: StyleProp<ViewStyle>;
    contentStyle?: StyleProp<ViewStyle>;
};
const AppAnimationSelector = (props: AppAnimationSelectType) => {
    const {
        top,
        left,
        height,
        isShow,
        children,
        right,
        width,
        containerStyle,
        contentStyle,
    } = props;
    const heightAnim = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const styles = appAnimationSelect();

    const opacityInterpolate = opacity.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    useEffect(() => {
        Animated.timing(opacity, {
            toValue: isShow ? 1 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
        Animated.timing(heightAnim, {
            toValue: isShow ? height : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [height, heightAnim, isShow, opacity]);
    return (
        <View
            style={[
                styles.absolute,
                styles.container,
                {
                    left,
                    top,
                    right,
                    width,
                },
                containerStyle,
            ]}>
            <Animated.View
                style={[
                    styles.content,
                    styles.overflowHidden,
                    contentStyle,
                    {
                        height: heightAnim,
                    },
                ]}>
                <Animated.View
                    style={{
                        opacity: opacityInterpolate,
                        ...styles.overflowHidden,
                    }}>
                    {children}
                </Animated.View>
            </Animated.View>
        </View>
    );
};

export default AppAnimationSelector;
