import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import GlobalUtils from 'src/core/utils/globalUtils';

const settingStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        ...appStyles,
        notificationIcon: {
            color: appColors.main.tokyoRed,
        },
        notificationContainer: {
            borderWidth: 1,
            borderColor: appColors.neutral.n200,
            padding: 8,
            borderRadius: 4,
        },
        dot: {
            backgroundColor: appColors.main.tokyoRed,
            width: 6,
            height: 6,
            borderRadius: 3,
            position: 'absolute',
            right: -2,
            top: -2,
        },
        titleList: {
            color: theme.colors.text_on_surface_text_medium,
            marginBottom: 8,
            marginTop: 14,
        },
        button: {
            padding: 16,
            backgroundColor: theme.colors.surface_surface_high,
        },
        buttonTop: {
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
        },
        buttonBottom: {
            borderBottomLeftRadius: 4,
            borderBottomRightRadius: 4,
        },
        buttonText: {
            color: theme.colors.text_on_surface_text_high,
            marginLeft: 16,
            flex: 1,
        },
        mt8: {
            marginTop: 8,
        },
        iconButtonLeft: {
            color: appColors.neutral.n600,
        },
        separator: {
            height: 0.8,
            backgroundColor: appColors.other.outline_lightest,
        },
        buttonModal_continue: {
            backgroundColor: theme.colors.label_surface_button_primary,
            ...appStyles.mbt15,
        },
        buttonModal_cancel: {
            borderWidth: 1,
            borderColor: theme.colors.text_on_surface_text_brand_2,
        },
        textAlign: {
            textAlign: 'center',
        },
        iconArrow: {
            color: appColors.neutral.n700,
        },
    });
export default settingStyles;
