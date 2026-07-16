import {StyleProp, ViewStyle} from 'react-native';
import {Skeleton} from '@rneui/themed';
import {LinearGradient} from 'expo-linear-gradient';
import appColors from 'src/core/constants/AppColors';
import React from 'react';

import { useAppTheme } from 'src/core/hooks/useAppTheme';
import ThemeKey from 'src/core/enum/ThemeKey';

type AppSkeletonType = {
    styles?: StyleProp<ViewStyle>;
    animation?: 'wave' | 'none' | 'pulse';
    width?: number | string;
    height?: number | string;
};

const AppSkeleton: React.FC<AppSkeletonType> = ({
    styles,
    animation = 'wave',
    width,
    height,
}) => {
    const { colorSchemeMode } = useAppTheme();
    const isDark = colorSchemeMode === ThemeKey.dark;

    return (
        <Skeleton
            LinearGradientComponent={LinearGradient}
            animation={animation}
            width={width}
            height={height}
            style={[
                styles ?? {
                    backgroundColor: isDark ? '#181A45' : appColors.neutral.n200,
                },
            ]}
        />
    );
};

export default AppSkeleton;
