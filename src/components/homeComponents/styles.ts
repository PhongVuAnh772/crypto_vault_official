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
        backgroundColor: appColors.neutral.n200,
        width: 36,
        height: 36,
        borderRadius: 5,
        marginBottom: 4,
        ...appStyles.center,
    },
});
export default styles;
