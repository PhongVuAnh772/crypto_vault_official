import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import appColors from 'src/core/constants/AppColors';
import { mPlus1 } from 'src/core/constants/FontFamily';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import Utils from 'src/core/utils/commonUtils';
import GlobalUtils from 'src/core/utils/globalUtils';
const useStyles = (theme: AppThemeType, insets?: EdgeInsets) =>
    StyleSheet.create({
        ...appStyles,
        inputAddressContainer: {
            borderColor: '#23253b',
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
        },
        inputAmountOutline: {
            borderRadius: 0,
        },
        textTo: {
            height: 20,
            justifyContent: 'flex-end',
        },
        button: {
            backgroundColor: '#4C4FFC',
            ...appStyles.mh20,
            borderRadius: 12,
            minHeight: 54,
            justifyContent: 'center',
            alignItems: 'center',
        },
        currencyText: {
            backgroundColor: theme.colors.surface_surface_high,
            ...appStyles.center,
        },
        loading: {
            marginHorizontal: 10,
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
        amountInputWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#161729',
            borderColor: '#23253b',
            borderWidth: 1,
            borderRadius: 12,
            paddingHorizontal: 16,
            height: 56,
            marginHorizontal: 20,
        },
        amountInput: {
            flex: 1,
            color: '#FFFFFF',
            fontSize: 22,
            fontWeight: '700',
            padding: 0,
        },
        tokenSelectorBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#1D1F3B',
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderWidth: 1,
            borderColor: '#2D3056',
        },
        tokenBadgeText: {
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: '700',
            marginHorizontal: 6,
        },
        feeCard: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#111222',
            borderColor: '#1B1C30',
            borderWidth: 1,
            borderRadius: 12,
            padding: 16,
            marginTop: 20,
            marginHorizontal: 20,
        },
        feeIconWrapper: {
            backgroundColor: '#1D1F3B',
            padding: 10,
            borderRadius: 10,
            marginRight: 12,
        },
        warningBanner: {
            flexDirection: 'row',
            backgroundColor: 'rgba(225, 37, 27, 0.08)',
            borderColor: 'rgba(225, 37, 27, 0.3)',
            borderWidth: 1,
            borderRadius: 12,
            padding: 16,
            marginTop: 15,
            marginHorizontal: 20,
        },
        warningTextContainer: {
            flex: 1,
            marginLeft: 12,
        },
        newButton: {
            paddingBottom: insets ? Math.max(insets.bottom, 15) : 15,
            paddingTop: 0,
            paddingHorizontal: 20,
            backgroundColor: 'transparent',
        },
        container: {
            ...appStyles.flex1,
            backgroundColor: '#08090C',
        },
    });
export default useStyles;
