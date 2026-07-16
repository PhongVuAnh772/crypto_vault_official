import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import {StyleSheet} from 'react-native';

const useStyles = () =>
    StyleSheet.create({
        container: {
            ...appStyles.center,
            borderWidth: 1,
            width: 16,
            height: 16,
            borderRadius: 16,
        },
        active: {
            backgroundColor: appColors.main.tokyoRed,
            width: 8,
            height: 8,
            borderRadius: 8,
        },
    });

export default useStyles;
