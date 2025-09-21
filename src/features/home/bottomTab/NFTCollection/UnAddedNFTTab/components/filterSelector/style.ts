import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';

const styles = StyleSheet.create({
    typeUnAddedContainer: {
        backgroundColor: appColors.neutral.black,
        ...appStyles.flexRow,
        ...appStyles.center,
        borderRadius: 50,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    iconArrowDown: {
        ...appStyles.center,
        width: 20,
        height: 20,
    },
});
export default styles;
