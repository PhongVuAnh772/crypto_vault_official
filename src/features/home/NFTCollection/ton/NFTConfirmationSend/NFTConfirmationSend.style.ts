import {StyleSheet} from 'react-native';
import appColors from 'src/core/constants/AppColors';

const useStyles = () => {
    return StyleSheet.create({
        button: {
            backgroundColor: appColors.main.tokyoRed,
            minHeight: 48,
            marginBottom: 10,
        },
    });
};

export default useStyles;
