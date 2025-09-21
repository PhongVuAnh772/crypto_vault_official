import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import commonUtils from 'src/core/utils/commonUtils';

const appQRCodeStyle = StyleSheet.create({
    ...appStyles,
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
    button: {
        width: 32,
    },
});
export default appQRCodeStyle;
