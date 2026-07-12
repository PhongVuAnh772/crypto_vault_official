import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
    closeContainer: {
        position: 'absolute',
        alignItems: 'flex-end',
        width: '100%',
        justifyContent: 'center',
    },
    closeButton: {
        width: 24,
        height: 24,
        ...appStyles.center,
    },
    typeButtonContainer: {
        ...appStyles.flexRow,
        ...appStyles.alignItemsCenter,
        backgroundColor: appColors.neutral.white,
        height: 56,
        borderColor: appColors.neutral.n100,
        borderWidth: 0.6,
        borderRadius: 4,
    },
    checkIcon: {
        ...appStyles.center,
        ...appStyles.mh15,
        width: 24,
        height: 24,
    },
});

export default styles;
