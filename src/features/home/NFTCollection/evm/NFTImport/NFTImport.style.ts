import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import appColors from 'src/core/constants/AppColors';
import { mPlus1 } from 'src/core/constants/FontFamily';
import appStyles from 'src/core/styles';
import commonUtils from 'src/core/utils/commonUtils';
import GlobalUtils from 'src/core/utils/globalUtils';

// const shadow = {
//     shadowColor: appColors.neutral.n500,
//     shadowOffset: {
//         width: 0,
//         height: 4,
//     },
//     shadowOpacity: 0.08,
//     shadowRadius: 4,
//     elevation: 2,
// };

const useNFTImportStyles = (insets: EdgeInsets) =>
    StyleSheet.create({
        ...appStyles,
        container: {
            paddingVertical: 12,
            flex: 1,
            backgroundColor: appColors.neutral.n100,
        },
        labelName: {
            color: appColors.neutral.n600,
        },
        selectProtocol: {
            backgroundColor: appColors.neutral.white,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: appColors.neutral.n200,
            marginTop: 4,
            ...appStyles.flexRow,
            ...appStyles.justifyContentBetween,
            ...appStyles.alignItemsCenter,
        },
        arrow: {
            transform: [
                {
                    rotate: '90deg',
                },
            ],
            color: appColors.neutral.n500,
        },
        inputAddressContainer: {
            backgroundColor: appColors.neutral.n100,
            padding: 0,
            height: 40,
        },
        inputAddressContent: {
            color: appColors.neutral.black,
            textAlign: 'auto',
            fontFamily: mPlus1.bold,
            fontWeight: '700',
            fontSize: 14,
            paddingHorizontal: 0,
            height: 40,
        },
        inputAmountContainer: {
            backgroundColor: appColors.neutral.white,
            flex: 1,
        },
        inputAmountOutline: {
            borderRadius: 0,
        },
        scanIcon: {
            height: 28,
            width: 28,
            ...appStyles.center,
            backgroundColor: appColors.main.tokyoRed,
            borderRadius: 4,
        },
        button: {
            backgroundColor: appColors.main.tokyoRed,
            minHeight: 48,
            marginBottom: 10,
        },
        importNFTbutton: {
            backgroundColor: appColors.main.tokyoRed,
            minHeight: 48,
            marginBottom: 10,
            width: '100%',
        },
        enterId: {
            fontFamily: mPlus1.bold,
        },
        titleProtocol: {
            textAlign: 'center',
        },
        closeIconStyle: { position: 'absolute', right: 25, top: -5 },
        pt12: {
            paddingTop: 12,
        },
        inputProtocol: {
            flex: 1,
            ...appStyles.flexRow,
            borderWidth: 1,
            borderRadius: 4,
            height: 44,
            borderColor: appColors.neutral.n200,
            backgroundColor: 'transparent',
            alignItems: 'center',
        },
        searchIcon: {
            color: appColors.neutral.n500,
            marginLeft: 16,
            marginRight: 8,
        },
        listProtocolItem: {
            padding: 16,
        },
        nameProtocol: {
            marginHorizontal: 16,
        },
        markIconProtocol: {
            color: appColors.main.tokyoRed,
        },
        separator: {
            height: 0.8,
            backgroundColor: appColors.other.outline_lightest,
        },
        notFoundContainer: {
            ...appStyles.flex1,
            ...appStyles.center,
            marginTop: 50,
        },
        noAssetFoundIcon: {
            color: appColors.neutral.n600,
        },
        titleNoAssetFound: {
            color: appColors.neutral.n600,
        },
        listProtocol: {
            ...appStyles.mt15,
            backgroundColor: appColors.neutral.white,
            borderRadius: 4,
            flex: 1,
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
        hideCanvas: {
            opacity: 0,
            width: 0,
            height: 0,
        },
        size28: {
            width: 28,
            height: 28,
        },
        containerButton: {
            paddingTop: 20,
            paddingHorizontal: 25,
            paddingBottom: GlobalUtils.getEnableRedXNewTheme()
                ? insets.bottom
                : 0,
            backgroundColor: GlobalUtils.getEnableRedXNewTheme()
                ? appColors.neutral.white
                : undefined,
        },
    });

export default useNFTImportStyles;
