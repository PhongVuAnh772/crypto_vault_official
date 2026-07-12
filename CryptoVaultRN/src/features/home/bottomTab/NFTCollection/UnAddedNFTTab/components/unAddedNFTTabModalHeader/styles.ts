import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';

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
    icon_color: {
        color: appColors.neutral.n500,
    },
});
export default styles;
