import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';

const spacingStatus = {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: appColors.neutral.n200,
    },
    pointHistoryItem: {
        shadowColor: appColors.neutral.n400,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    successBox: {
        backgroundColor: appColors.light.green,
        ...spacingStatus,
    },
    failBox: {
        backgroundColor: appColors.other.outline_lightest,
        ...spacingStatus,
    },
    cancelledBox: {
        backgroundColor: appColors.light.yellow,
        ...spacingStatus,
    },
    revokedBox: {
        backgroundColor: appColors.other.label,
        ...spacingStatus,
    },
});
export default styles;
