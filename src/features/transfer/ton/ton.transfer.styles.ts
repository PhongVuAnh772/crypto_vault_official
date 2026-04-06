import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import appColors from 'src/core/constants/AppColors';
import { mPlus1 } from 'src/core/constants/FontFamily';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import Utils from 'src/core/utils/commonUtils';
import GlobalUtils from 'src/core/utils/globalUtils';
const useStyles = (theme: AppThemeType, insets: EdgeInsets) =>
    StyleSheet.create({
        inputAddressContainer: {
            backgroundColor: theme.colors.surface_surface_default,
        },
        inputAddressContent: {
            color: theme.colors.text_on_surface_text_high,
            textAlign: 'auto',
            fontFamily: mPlus1.medium,
            fontWeight: '500',
            fontSize: 14,
            paddingLeft: 10,
        },
        inputAmountContainer: {
            backgroundColor: theme.colors.surface_surface_high,
            flex: 1,
            height: 48,
        },
        inputAmountContent: {
            textAlign: 'auto',
            flex: 1,
        },
        inputAmountOutline: {
            borderRadius: 0,
        },
        textTo: {
            height: 20,
            justifyContent: 'flex-end',
        },
        button: {
            backgroundColor: appColors.main.tokyoRed,
            ...appStyles.mh20,
            minHeight: 50,
        },
        textUnderline: {
            textDecorationLine: 'underline',
        },
        currencyText: {
            backgroundColor: theme.colors.surface_surface_high,
            ...appStyles.center,
        },
        loading: {
            marginHorizontal: 10,
        },
        buttonCancel: {
            borderWidth: 1,
            borderColor: theme.colors.text_on_surface_text_brand_2,
            backgroundColor: appColors.neutral.white,
        },
        confirmTitle: {
            paddingLeft: 20,
            paddingBottom: 20,
        },
        viewFrom: {
            backgroundColor: appColors.neutral.white,
            paddingHorizontal: 20,
            paddingVertical: 10,
            marginHorizontal: 20,
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        viewTo: {
            marginTop: 20,
            backgroundColor: appColors.neutral.white,
            paddingHorizontal: 20,
            paddingVertical: 10,
            marginHorizontal: 20,
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        scanIcon: {
            height: 28,
            width: 28,
            ...appStyles.center,
            backgroundColor: appColors.main.tokyoRed,
            borderRadius: 4,
        },
        viewScanQRContainer: {
            height: Utils.screenHeight,
            width: Utils.screenWidth,
            backgroundColor: appColors.neutral.n800,
            position: 'absolute',
        },
        scanQRContainer: {
            width: Utils.screenWidth,
            height: Utils.screenHeight * 0.7,
        },
        hashLink: {
            textDecorationLine: 'underline',
        },
        closeButton: {
            backgroundColor: theme.colors.surface_surface_brand,
            width: '40%',
            ...appStyles.mt25,
        },

        newButton: {
            marginTop: 15,
            paddingBottom:0,
            paddingTop: 0,
            paddingHorizontal: 0,
            backgroundColor: undefined,
        },
        container: {
            ...appStyles.flex1,
            backgroundColor: theme.colors.surface_surface_default,
        },
    });
export default useStyles;
