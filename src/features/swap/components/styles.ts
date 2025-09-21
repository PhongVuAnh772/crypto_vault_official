import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import { customVariants } from 'src/core/constants/FontConfig';
import appStyles from 'src/core/styles';

const box = {
    borderRadius: 4,
    backgroundColor: appColors.neutral.white,
    shadowColor: appColors.neutral.black,
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
};

const styles = StyleSheet.create({
    titleInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    protocolButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderRadius: 16,
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderWidth: 1,
        borderColor: appColors.neutral.n200,
    },
    walletButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderWidth: 1,
        borderColor: appColors.neutral.n200,
    },
    content: {
        backgroundColor: appColors.neutral.white,
        marginTop: 8,
        borderRadius: 4,
        padding: 16,
    },
    gap5: {
        gap: 5,
    },
    balanceText: {
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderWidth: 1,
        borderColor: appColors.neutral.n200,
    },
    inputContainer: {
        paddingHorizontal: 0,
        paddingVertical: 0,
        borderWidth: 0,
        textAlign: 'right',
        marginTop: 0,
        ...customVariants.titleMedium,
    },
    protocolContainer: {
        backgroundColor: appColors.neutral.n100,
    },
    p16: {
        padding: 16,
    },
    shortCurrencyContainer: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: appColors.neutral.n200,
        borderRadius: 4,
        ...appStyles.center,
    },
    gap10: {
        gap: 10,
    },
    inputSearch: {
        minHeight: 44,
    },

    //

    closeButton: {
        backgroundColor: appColors.neutral.n600,
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
        backgroundColor: appColors.neutral.n600,
        ...appStyles.center,
    },
    button: {
        backgroundColor: appColors.main.tokyoRed,
        minHeight: 48,
    },
    containerBox: {
        borderRadius: 4,
        backgroundColor: appColors.neutral.white,
        shadowColor: appColors.neutral.n600,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 4,
        padding: 16,
    },
    titleBox: {
        backgroundColor: appColors.neutral.n200,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 100,
    },
    b4: {
        borderRadius: 4,
    },
    rightItem: { gap: 5 },
    receiveIcon: {
        marginLeft: -5,
    },
    swapIcon: {
        backgroundColor: appColors.other.outline_lightest,
        justifyContent: 'center',
        alignItems: 'center',
        ...appStyles.iconCircleSize13,
        shadowColor: appColors.neutral.n500,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3.84,
        elevation: 5,
        top: 7,
        right: 7,
    },
    statusBox: {
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 8,
    },
});

export default styles;
