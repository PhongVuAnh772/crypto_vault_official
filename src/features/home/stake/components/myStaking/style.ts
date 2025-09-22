import {StyleSheet} from 'react-native';
import appColors from 'src/core/constants/AppColors';

const style = StyleSheet.create({
    containerMyStaking: {
        backgroundColor: appColors.other.outline_lightest,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: appColors.neutral.n200,
    },
    button: {
        backgroundColor: appColors.main.tokyoRed,
        minHeight: 30,
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderBottomWidth: 0.6,
        borderBottomColor: appColors.neutral.n200,
    },
    container: {
        shadowColor: appColors.neutral.n300,
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.6,
        shadowRadius: 4,
        elevation: 28,
        borderRadius: 4,
        // backgroundColor: appColors.neutral.white,
    },
    stakingItem: {
        borderRadius: 4,
    },
});

export default style;
