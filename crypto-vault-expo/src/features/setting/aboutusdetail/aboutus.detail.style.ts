import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
const shadow = {
    shadowColor: appColors.neutral.n700,
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 4,
};
const aboutusDetailStyles = StyleSheet.create({
    ...appStyles,
    container: {
        backgroundColor: appColors.neutral.white,
        marginHorizontal: 24,
        marginTop: 25,
        paddingHorizontal: 16,
        paddingVertical: 24,
        flex: 1,
        ...shadow,
    },
    containerPolicy: {
        backgroundColor: appColors.neutral.white,
        marginHorizontal: 24,
        marginTop: 25,
        paddingHorizontal: 16,
        paddingVertical: 10,
        height: '100%',
        ...shadow,
    },
    h100: { height: '100%' },
    lastUpdate: {
        color: appColors.neutral.n600,
    },
    mt16: {
        marginTop: 16,
    },
    mt8: {
        marginTop: 8,
    },
    h5: {
        height: 5,
    },
    boxContainer: {
        ...appStyles.flex1,
        backgroundColor: appColors.neutral.n100,
    },
});
export default aboutusDetailStyles;
