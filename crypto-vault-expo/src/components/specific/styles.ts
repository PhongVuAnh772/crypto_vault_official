import {StyleSheet} from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';

const styles = StyleSheet.create({
    container: {
        paddingVertical: 12,
        borderRadius: 4,
        ...appStyles.alignItemsCenter,
        borderWidth: 0.5,
    },
    success: {
        backgroundColor: appColors.light.green,
        borderColor: appColors.border.green,
    },
    error: {
        backgroundColor: appColors.light.red,
        borderColor: appColors.border.red,
    },
    warning: {
        backgroundColor: appColors.light.yellow,
        borderColor: appColors.border.yellow,
    },
    protocolImage: {
        height: 32,
        width: 32,
        borderRadius: 100,
        marginRight: 10,
    },
});

export default styles;
