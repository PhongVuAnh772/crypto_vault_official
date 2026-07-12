import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
    actionContainer: {
        backgroundColor: appColors.neutral.white,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    buttonAction: {
        backgroundColor: appColors.neutral.white,
        width: 60,
        height: 60,
        borderRadius: 100,
        marginBottom: 4,
        ...appStyles.center,
    },
});
export default styles;
