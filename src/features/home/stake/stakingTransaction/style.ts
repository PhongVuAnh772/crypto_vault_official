import {StyleSheet} from 'react-native';
import appColors from 'src/core/constants/AppColors';

const box = {
    borderRadius: 4,
    backgroundColor: appColors.neutral.white,
    shadowColor: appColors.neutral.n700,
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 4,
};
const useStyle = () =>
    StyleSheet.create({
        boxContainer: {
            ...box,
            width: '100%',
        },
    });

export default useStyle;
