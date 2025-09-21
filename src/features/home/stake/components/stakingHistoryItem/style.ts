import {StyleSheet} from 'react-native';
import appColors from 'src/core/constants/AppColors';

const style = StyleSheet.create({
    iconContainer: {
        padding: 4,
        borderRadius: 4,
        backgroundColor: appColors.other.outline_lightest,
    },
    container: {
        backgroundColor: appColors.neutral.white,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    statusContainer: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: appColors.light.green,
    },
});

export default style;
