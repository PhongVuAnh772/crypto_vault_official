import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';

const styles = StyleSheet.create({
    button: {
        borderWidth: 1,
        borderColor: appColors.main.tokyoRed,
        backgroundColor: appColors.neutral.white,
        height: 48,
    },
    containerSelector: {
        backgroundColor: appColors.neutral.white,
        shadowColor: appColors.neutral.n400,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 3.84,
        elevation: 5,
        marginHorizontal: 20,
        borderRadius: 4,
    },
});
export default styles;
