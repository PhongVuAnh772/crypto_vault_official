import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';

const NFTListStyle = StyleSheet.create({
    ...appStyles,
    container: {
        ...appStyles.pH25,
        ...appStyles.pT15,
        ...appStyles.flex1,
        backgroundColor: appColors.neutral.n100,
    },
});

export default NFTListStyle;
