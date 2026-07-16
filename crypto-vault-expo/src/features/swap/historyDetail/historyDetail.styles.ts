import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';

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
        statusView: {
            ...appStyles.mt15,
            paddingLeft: 8,
            paddingRight: 6,
            paddingVertical: 4,
            borderRadius: 4,
        },
        container: {
            ...appStyles.flex1,
            ...appStyles.alignItemsCenter,
            ...appStyles.pH25,
            ...appStyles.pT30,
            ...appStyles.pB8,
            backgroundColor: appColors.neutral.n100,
        },
        iconSwap: {
            transform: [{ rotate: '90deg' }],
            paddingHorizontal: 5,
        },
    });

export default useStyle;
