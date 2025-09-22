import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity } from 'react-native';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import appStyles from 'src/core/styles';
import style from './style';

interface DaysItemProps {
    days: string;
    onPress: () => void;
    isSelected: boolean;
    index: number;
    disable?: boolean;
}

const DaysItem: React.FC<DaysItemProps> = ({
    days,
    onPress,
    isSelected,
    index,
    disable,
}) => {
    const backgroundColor = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(backgroundColor, {
            toValue: isSelected ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSelected]);

    const backgroundColorInterpolation = backgroundColor.interpolate({
        inputRange: [0, 1],
        outputRange: [appColors.neutral.white, appColors.main.tokyoRed],
    });
    const columns = 3;
    const isMarginApplied = (index + 1) % columns !== 0;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disable}
            style={[style.itemButton, {marginRight: isMarginApplied ? 10 : 0}]}>
            <Animated.View
                style={[
                    appStyles.flexRow,
                    appStyles.alignItemsCenter,
                    appStyles.justifyContentCenter,
                    appStyles.pV10,
                    {
                        backgroundColor: backgroundColorInterpolation,
                    },
                    style.itemContainer,
                ]}>
                <AppText
                    title={days}
                    variant={TextVariantKeys.bodyMMedium}
                    textColor={
                        isSelected
                            ? appColors.neutral.white
                            : appColors.neutral.n800
                    }
                    styles={appStyles.textAlignCenter}
                />
            </Animated.View>
        </TouchableOpacity>
    );
};

export default DaysItem;
