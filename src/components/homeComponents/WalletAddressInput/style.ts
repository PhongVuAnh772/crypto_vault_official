import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import { mPlus1 } from 'src/core/constants/FontFamily';
import appStyles from 'src/core/styles';

const WalletAddressInputStyle = StyleSheet.create({
    ...appStyles,
    scanIcon: {
        height: 28,
        width: 28,
        ...appStyles.center,
        backgroundColor: appColors.main.tokyoRed,
        borderRadius: 4,
    },
    labelName: {
        color: appColors.neutral.n600,
    },
    inputAddressContainer: {
        backgroundColor: appColors.neutral.n100,
        padding: 0,
        height: 40,
        flex: 1,
    },
    inputAddressContent: {
        color: appColors.neutral.black,
        fontFamily: mPlus1.bold,
        fontWeight: '700',
        fontSize: 14,
        paddingHorizontal: 0,
        height: 40,
    },
    to: {
        marginRight: 5,
    },
});

export default WalletAddressInputStyle;
