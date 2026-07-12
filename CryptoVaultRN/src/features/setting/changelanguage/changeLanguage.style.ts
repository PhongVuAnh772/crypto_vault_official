import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';

const useStyles = (theme: AppThemeType, insets?: EdgeInsets) =>
    StyleSheet.create({
        box_language: {
            backgroundColor: theme.colors.surface_surface_high,
            marginHorizontal: 24,
            borderRadius: 4,
            marginTop: 16,
        },
        separator: {
            height: 0.8,
            backgroundColor: appColors.other.outline_lightest,
        },
        button: {
            ...appStyles.pH25,
            ...appStyles.pT10,
            paddingBottom: insets?.bottom,
            backgroundColor: appColors.neutral.white,
        },
        container: {
            ...appStyles.flex1,
            backgroundColor: theme.colors.surface_surface_default,
        },
    });

export default useStyles;
