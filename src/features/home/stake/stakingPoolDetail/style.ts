import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';

const style = StyleSheet.create({
    cardContainer: {
        padding: 0,
        backgroundColor: 'transparent',
        marginTop: 16,
    },
    button: {
        minHeight: 48,
        paddingHorizontal: 26,
        backgroundColor: appColors.main.tokyoRed,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: appColors.neutral.n100,
    },
    cardTransferContainer: {
        borderBottomWidth: 1,
        borderBottomColor: appColors.other.outline_lightest,
    },
    container: {
        ...appStyles.flex1,
        ...appStyles.pH25,
        ...appStyles.pT15,
        ...appStyles.pB15,
        backgroundColor: appColors.neutral.n100,
    },
    buttonStaking: {
        backgroundColor: appColors.neutral.white,
        ...appStyles.pH25,
        ...appStyles.pT30,
    },
});

export default style;
