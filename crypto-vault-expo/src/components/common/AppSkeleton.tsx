import {StyleProp, ViewStyle} from 'react-native';
import {Skeleton} from '@rneui/themed';
import {LinearGradient} from 'expo-linear-gradient';
import appColors from 'src/core/constants/AppColors';
import React from 'react';

type AppSkeletonType = {
    styles?: StyleProp<ViewStyle>;
    animation?: 'wave' | 'none' | 'pulse';
    width?: number;
    height?: number;
};

const AppSkeleton: React.FC<AppSkeletonType> = ({
    styles,
    animation = 'wave',
    width,
    height,
}) => {
    return (
        <Skeleton
            LinearGradientComponent={LinearGradient}
            animation={animation}
            width={width}
            height={height}
            style={[
                styles ?? {
                    backgroundColor: appColors.neutral.n200,
                },
            ]}
        />
    );
};

export default AppSkeleton;
