import React from 'react';
import {
    ActivityIndicator as ActivityIndicatorIos,
    StyleProp,
    ViewStyle,
} from 'react-native';
import { ActivityIndicator as ActivityIndicatorAndroid } from 'react-native-paper';
import appColors from 'src/core/constants/AppColors';
import Utils from 'src/core/utils/commonUtils';

type AppLoadingType = {
    styles?: StyleProp<ViewStyle>;
    size?: number | 'small' | 'large' | undefined;
};

const AppLoading: React.FC<AppLoadingType> = ({ styles, size = 'small' }) => {
    return Utils.isAndroid ? (
        <ActivityIndicatorAndroid
            size={size}
            color={appColors.neutral.black}
            style={styles}
        />
    ) : (
        <ActivityIndicatorIos
            size={size}
            color={appColors.neutral.black}
            style={styles}
        />
    );
};

export default AppLoading;
