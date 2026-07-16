import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';

const protocolItemStyle = StyleSheet.create({
    listProtocolItem: {
        padding: 16,
    },
    nameProtocol: {
        marginHorizontal: 16,
    },
    markIconProtocol: {
        color: appColors.main.tokyoRed,
    },
    imageToken: {
        width: 28,
        height: 28,
        borderRadius: 28,
    },
    size24: {
        width: 24,
        height: 24,
        borderRadius: 100,
    },
    size28: {
        width: 28,
        height: 28,
        borderRadius: 100,
    },
    size16: {
        width: 16,
        height: 16,
        borderRadius: 100,
    },
    shortCurrencyContainer: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: appColors.neutral.n200,
        borderRadius: 4,
        ...appStyles.center,
    },
});

export default protocolItemStyle;
