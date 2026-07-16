import appColors from 'src/core/constants/AppColors';
import {AppThemeType} from 'src/core/type/ThemeType';
import {StyleSheet} from 'react-native';

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        codeFieldRoot: {
            paddingHorizontal: 20,
            width: '100%',
        },
        cell: {
            width: 44,
            height: 44,
            borderWidth: 1,
            borderRadius: 3,
            backgroundColor: theme.colors.surface_surface_high,
        },
        text: {
            lineHeight: 38,
            fontSize: 24,
            textAlign: 'center',
            color: theme.colors.text_on_surface_text_highest,
        },
        dot: {
            width: 12,
            height: 12,
            borderRadius: 100,
            backgroundColor: theme.colors.text_on_surface_text_highest,
        },
        incorrectText: {
            color: appColors.functional.warning,
        },
    });

export default useStyles;
