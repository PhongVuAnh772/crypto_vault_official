import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import {AppThemeType} from 'src/core/type/ThemeType';
import {StyleSheet} from 'react-native';

const box = {
    borderRadius: 4,
    backgroundColor: appColors.neutral.white,
    shadowColor: appColors.neutral.n700,
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 4,
};
const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        ...appStyles,
        closeButton: {
            backgroundColor: theme.colors.surface_surface_brand,
            width: '40%',
            ...appStyles.mt25,
        },
        WalletInput: {
            paddingVertical: 8,
            borderRadius: 4,
            borderColor: appColors.neutral.n500,
        },
        labelWalletAddress: {
            color: appColors.neutral.n400,
            marginBottom: 3,
        },
        input: {
            borderWidth: 0,
        },
        inputAmountOutline: {
            borderRadius: 0,
        },
        inputAmountContainer: {
            backgroundColor: appColors.neutral.white,
            flex: 1,
        },
        currencyText: {
            backgroundColor: theme.colors.surface_surface_high,
            ...appStyles.center,
        },
        button: {
            backgroundColor: appColors.main.tokyoRed,
            minHeight: 48,
            marginBottom: 10,
        },
        containerBox: {
            borderRadius: 4,
            backgroundColor: theme.colors.surface_surface_high,
            shadowColor: theme.colors.text_on_surface_text_medium_high,
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.08,
            shadowRadius: 32,
            elevation: 4,
            padding: 16,
        },
        titleBox: {
            backgroundColor: theme.colors.label_surface_button_light,
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderRadius: 100,
        },
        boxFee: {
            ...box,
            marginTop: 20,
            padding: 16,
        },
        totalAmount: {
            borderTopColor: theme.colors.outline_outine_lightest,
            borderTopWidth: 1,
            paddingTop: 16,
        },
        totalGrantAmount: {
            borderBottomColor: theme.colors.outline_outine_lightest,
            borderBottomWidth: 1,
            paddingBottom: 16,
        },
        closeButtonBottomSheet: {position: 'absolute', right: 20},
        closeButtonBottomSheetConfirm: {position: 'absolute', right: 0},
        contentStyleInput: {
            textAlign: 'auto',
            lineHeight: undefined,
        },
        pH14: {
            paddingHorizontal: 14,
        },
    });
export default useStyles;
