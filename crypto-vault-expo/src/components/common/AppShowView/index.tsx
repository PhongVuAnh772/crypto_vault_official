import React, {useEffect} from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import appStyles from 'src/core/styles';

export const AppShowView: React.FC<{
    isShow: boolean;
    children: React.ReactNode;
    containerStyle?: StyleProp<ViewStyle>;
}> = ({isShow, children, containerStyle}) => {
    const offset = useSharedValue(0);

    const animatedStyles = useAnimatedStyle(() => ({
        opacity: offset.value,
    }));

    useEffect(() => {
        offset.value = withTiming(isShow ? 1 : 0, {duration: 100});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isShow]);

    return (
        <Animated.View
            style={[animatedStyles, appStyles.flex1, containerStyle]}>
            {children}
        </Animated.View>
    );
};
