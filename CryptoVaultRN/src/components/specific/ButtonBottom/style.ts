import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import GlobalUtils from 'src/core/utils/globalUtils';

const style = StyleSheet.create({
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
        backgroundColor: GlobalUtils.getEnableledgerifyNewTheme()
            ? appColors.neutral.white
            : appColors.neutral.n100,
        paddingTop: GlobalUtils.getEnableledgerifyNewTheme() ? 15 : 0,
    },
});

export default style;
