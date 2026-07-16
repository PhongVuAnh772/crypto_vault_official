import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';

const styles = StyleSheet.create({
    typeButtonContainer: {
        ...appStyles.flexRow,
        ...appStyles.alignItemsCenter,
        backgroundColor: appColors.neutral.white,
        minHeight: 56,
        borderColor: appColors.neutral.n100,
        borderWidth: 0.6,
    },
    checkIcon: {
        ...appStyles.center,
        ...appStyles.mh15,
        width: 24,
        height: 24,
    },
});
export default styles;
