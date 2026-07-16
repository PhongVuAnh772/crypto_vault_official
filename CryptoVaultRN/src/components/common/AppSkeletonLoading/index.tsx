import { MotiSkeletonProps } from 'moti/build/skeleton/types';
import { Skeleton } from 'moti/skeleton';
import React from 'react';
import appColors from 'src/core/constants/AppColors';
import ThemeKey from 'src/core/enum/ThemeKey';
import useAppTheme from 'src/core/hooks/useAppTheme';

const AppSkeletonLoading = (prop: Omit<MotiSkeletonProps, 'Gradient'>) => {
    const { colorSchemeMode } = useAppTheme();
    const isDark = colorSchemeMode === ThemeKey.dark;
    const colorMode = isDark ? 'dark' : 'light';
    const defaultColors = isDark
        ? ['#181A45', '#242766', '#181A45']
        : [
            appColors.neutral.n300,
            appColors.other.outline_lightest,
            appColors.other.outline_lightest,
            appColors.other.outline_lightest,
            appColors.neutral.n300,
            appColors.other.outline_lightest,
            appColors.neutral.n300,
        ];

    return (
        <Skeleton
            colorMode={colorMode}
            width={'100%'}
            height={20}
            radius={4}
            colors={prop.colors || defaultColors}
            {...prop}
        />
    );
};

export default AppSkeletonLoading;
