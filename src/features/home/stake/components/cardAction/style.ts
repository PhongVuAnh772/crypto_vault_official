import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import GlobalUtils from 'src/core/utils/globalUtils';

const style = StyleSheet.create({
    container: {
        backgroundColor: appColors.other.outline_lightest,
        padding: 16,
        borderTopRightRadius: GlobalUtils.getEnableRedXNewTheme() ? 4 : 0,
        borderTopLeftRadius: GlobalUtils.getEnableRedXNewTheme() ? 4 : 0,
    },
    button: {
        backgroundColor: appColors.main.tokyoRed,
        minHeight: 30,
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderBottomWidth: 0.6,
        borderBottomColor: appColors.neutral.n200,
    },
});

export default style;
