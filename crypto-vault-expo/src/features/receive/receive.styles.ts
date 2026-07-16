import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import { mPlus1 } from 'src/core/constants/FontFamily';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        button: {
            backgroundColor: theme.colors.label_surface_button_primary,
            ...appStyles.mh25,
            height: 48,
        },
        qrContainer: {
            backgroundColor: appColors.main.tokyoRed,
            padding: 5,
            borderRadius: 4,
        },
        qrContainer2: {
            backgroundColor: appColors.neutral.white,
            padding: 15,
            borderRadius: 4,
        },
        yourAddressContainer: {
            ...appStyles.pd15,
            ...appStyles.mh25,
            ...appStyles.mv15,
            borderWidth: 0.5,
            borderRadius: 4,
            borderColor: theme.colors.outline_outine_lightest,
        },
        inputAddressContent: {
            color: theme.colors.text_on_surface_text_lightest,
            textAlign: 'auto',
            fontFamily: mPlus1.bold,
            fontWeight: '400',
            fontSize: 14,
            paddingLeft: 10,
        },
        addressContainer: {
            backgroundColor: theme.colors.surface_surface_high,
            ...appStyles.mt10,
        },
        newThemeOpacity: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: appColors.neutral.white,
            opacity: 0.3,
            borderRadius: 4,
        },
    });

export default useStyles;
