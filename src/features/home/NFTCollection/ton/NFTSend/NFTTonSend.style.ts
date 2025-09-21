import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import commonUtils from 'src/core/utils/commonUtils';
import GlobalUtils from 'src/core/utils/globalUtils';

const box = {
    borderRadius: 4,
    shadowColor: appColors.neutral.n700,
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 4,
    backgroundColor: appColors.neutral.white,
};
const useStyle = (insets: EdgeInsets, theme: AppThemeType) =>
    StyleSheet.create({
        ...appStyles,
        button: {
            backgroundColor: appColors.main.tokyoRed,
            minHeight: 48,
            marginBottom: GlobalUtils.getEnableRedXNewTheme() ? 0 : 10,
        },
        modalButton: {
            backgroundColor: appColors.main.tokyoRed,
            ...appStyles.mh20,
            minHeight: 48,
        },

        buttonUnderstood: {
            backgroundColor: appColors.main.tokyoRed,
            minHeight: 48,
            marginBottom: 10,
            width: '100%',
        },
        image: {
            width: 100,
            aspectRatio: 1,
        },
        containerBox: {
            height: 124,
            ...appStyles.flexRow,
            ...box,
            ...appStyles.alignItemsCenter,
            padding: 12,
            backgroundColor: appColors.neutral.white,
        },
        imageNetwork: {
            height: 20,
            width: 20,
        },
        nftId: {
            marginTop: 3,
            marginBottom: 8,
        },
        WalletInput: {
            paddingVertical: 8,
            paddingHorizontal: 16,
            backgroundColor: appColors.neutral.white,
            borderRadius: 4,
            borderColor: appColors.neutral.n500,
        },
        labelWalletAddress: {
            color: appColors.neutral.n400,
            marginBottom: 3,
        },
        input: {
            backgroundColor: appColors.neutral.white,
            borderWidth: 0,
        },
        viewScanQRContainer: {
            height: commonUtils.screenHeight,
            width: commonUtils.screenWidth,
            backgroundColor: appColors.neutral.n800,
            position: 'absolute',
        },
        scanQRContainer: {
            height: commonUtils.screenHeight * 0.7,
            width: commonUtils.screenWidth,
        },
        boxFee: {
            ...box,
            marginTop: 20,
            padding: 16,
        },
        backgroundNFTInformationSkeleton: {
            padding: 12,
            ...box,
            backgroundColor: appColors.neutral.white,
        },
        shadowBox: {
            ...box,
        },
        inputQuantity: {
            minHeight: 44,
        },
        containerButton: {
            backgroundColor: GlobalUtils.getEnableRedXNewTheme()
                ? appColors.neutral.white
                : undefined,
            paddingBottom: GlobalUtils.getEnableRedXNewTheme()
                ? insets?.bottom
                : 0,
        },
    });

export default useStyle;
