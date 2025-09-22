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
const NFTInformationStyle = StyleSheet.create({
    image: {
        width: 100,
        aspectRatio: 1,
    },
    containerBox: {
        minHeight: 124,
        ...appStyles.flexRow,
        ...box,
        ...appStyles.alignItemsCenter,
        padding: 12,
    },
    imageNetwork: {
        height: 20,
        width: 20,
    },
    line: {
        width: 1,
        height: 10,
        backgroundColor: appColors.neutral.n400,
    },
});

export default NFTInformationStyle;
