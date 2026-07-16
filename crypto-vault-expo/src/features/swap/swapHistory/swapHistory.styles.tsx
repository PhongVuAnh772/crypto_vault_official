import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';

const styles = StyleSheet.create({
    loadingItem: {
        padding: 16,
        backgroundColor: appColors.neutral.white,
    },
    swap: { position: 'absolute', left: 10 },
    dotSwap: {
        position: 'absolute',
        left: 10,
        bottom: -3,
    },
    typeContainer: {
        backgroundColor: appColors.other.outline_lightest,
        borderRadius: 50,
        height: 28,
        width: 60,
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
});

export default styles;
