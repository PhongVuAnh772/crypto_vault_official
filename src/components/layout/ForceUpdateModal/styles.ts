import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
    container: {
        ...appStyles.flex1,
        ...appStyles.center,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    subContainer: {
        ...appStyles.pd25,
        ...appStyles.mh25,
        ...appStyles.center,
        borderRadius: 4,
        backgroundColor: appColors.neutral.white,
    },
    buttonUpdate: {
        backgroundColor: appColors.main.tokyoRed,
        height: 40,
        flex: 1,
        ...appStyles.center,
        borderRadius: 4,
    },
});

export default styles;
