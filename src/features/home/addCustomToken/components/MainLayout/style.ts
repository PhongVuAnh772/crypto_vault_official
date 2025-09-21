import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import appColors from 'src/core/constants/AppColors';
import { mPlus1 } from 'src/core/constants/FontFamily';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import commonUtils from 'src/core/utils/commonUtils';
import GlobalUtils from 'src/core/utils/globalUtils';

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
const useStyle = (insets: EdgeInsets, theme: AppThemeType) =>
    StyleSheet.create({
        ...appStyles,
        button: {
            backgroundColor: appColors.main.tokyoRed,
            minHeight: 48,
            marginBottom: 10,
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
            color: appColors.neutral.n600,
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
        disable: {
            color: appColors.neutral.n500,
        },
        inputAddress: {
            fontFamily: mPlus1.regular,
            fontWeight: '400',
        },
        container: {
            backgroundColor: theme.colors.surface_surface_default,
            paddingBottom: GlobalUtils.getEnableRedXNewTheme()
                ? insets?.bottom
                : 0,
        },
    });

export default useStyle;
