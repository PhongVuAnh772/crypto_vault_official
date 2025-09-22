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
const styles = StyleSheet.create({
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
    boxContainer: {
        ...box,
        width: '100%',
    },
    viewBox: {
        ...appStyles.flex1,
        ...appStyles.pH25,
        ...appStyles.pT15,
        ...appStyles.pB8,
        backgroundColor: appColors.neutral.n100,
    },
});

export default styles;
