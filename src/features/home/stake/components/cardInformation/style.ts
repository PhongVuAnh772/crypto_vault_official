import {StyleSheet} from 'react-native';
import appColors from 'src/core/constants/AppColors';

const style = StyleSheet.create({
    container: {
        backgroundColor: appColors.neutral.white,
        padding: 16,
    },
    button: {
        backgroundColor: appColors.main.tokyoRed,
        minHeight: 30,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    totalAmountContainer: {
        backgroundColor: appColors.neutral.n200,
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 4,
    },
});

export default style;
