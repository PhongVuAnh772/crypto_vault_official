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
            color: '#8F9BB3',
            marginBottom: 8,
            marginTop: 14,
        },
        button: {
            padding: 16,
            backgroundColor: '#131435', // Premium dark violet/blue card background
        },
        buttonTop: {
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
        },
        buttonBottom: {
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
        },
        buttonText: {
            color: '#FFFFFF',
            marginLeft: 16,
            flex: 1,
        },
        mt8: {
            marginTop: 8,
        },
        iconButtonLeft: {
            color: '#8F9BB3',
        },
        separator: {
            height: 0.8,
            backgroundColor: '#1D1E4E', // Premium dark separator
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
