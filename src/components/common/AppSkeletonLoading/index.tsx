import { MotiSkeletonProps } from 'moti/build/skeleton/types';
import { Skeleton } from 'moti/skeleton';
import React from 'react';
import appColors from 'src/core/constants/AppColors';
import ThemeKey from 'src/core/enum/ThemeKey';
import useAppTheme from 'src/core/hooks/useAppTheme';

const AppSkeletonLoading = (prop: Omit<MotiSkeletonProps, 'Gradient'>) => {
    const { colorSchemeMode } = useAppTheme();
    const colorMode = colorSchemeMode === ThemeKey.dark ? 'dark' : 'light';
    return (
        <Skeleton
            colorMode={colorMode}
            width={'100%'}
            height={20}
            radius={4}
            colors={[
                appColors.neutral.n300,
                appColors.other.outline_lightest,
                appColors.other.outline_lightest,
                appColors.other.outline_lightest,
                appColors.neutral.n300,
                appColors.other.outline_lightest,
                appColors.neutral.n300,
            ]}
            {...prop}
        />
    );
};

export default AppSkeletonLoading;
