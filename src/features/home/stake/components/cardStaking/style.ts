import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';

const style = StyleSheet.create({
    container: {
        borderRadius: 4,
        shadowColor: appColors.neutral.n500,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        backgroundColor: appColors.neutral.white,
    },
});

export default style;
