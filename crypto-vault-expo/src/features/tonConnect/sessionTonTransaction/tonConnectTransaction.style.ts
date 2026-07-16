import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';

const useStyles = (theme: AppThemeType, insets: EdgeInsets) =>
    StyleSheet.create({
        box: {
            ...appStyles.flex1,
        },
        view_switch_address: {
            ...appStyles.flexRow,
            ...appStyles.pd16,
            backgroundColor: theme.colors.surface_surface_high,
            shadowColor: appColors.neutral.n600,
            borderWidth: 0.6,
            borderColor: theme.colors.outline_outine_lightest,
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 10,
            borderRadius: 6,
            width: '100%',
            ...appStyles.center
        },
        opacityView: {
            opacity: 0,
        },
    });
export default useStyles;
