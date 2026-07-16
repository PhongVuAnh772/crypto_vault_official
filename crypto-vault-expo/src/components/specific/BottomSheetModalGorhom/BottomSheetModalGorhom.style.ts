import {StyleSheet} from 'react-native';
import appColors from 'src/core/constants/AppColors';
import {AppThemeType} from 'src/core/type/ThemeType';

const useStyle = (theme: AppThemeType) =>
    StyleSheet.create({
        indicator: {
            width: 48,
            backgroundColor: appColors.neutral.n300,
        },
        backgroundStyle: {
            backgroundColor: theme.colors.surface_surface_high,
        },
    });

export default useStyle;
