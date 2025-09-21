import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import GlobalUtils from 'src/core/utils/globalUtils';

const useStyle = (theme: AppThemeType) =>
    StyleSheet.create({
        ...appStyles,
        container: {
            marginHorizontal: GlobalUtils.getEnableRedXNewTheme() ? 0 : 24,
            marginTop: GlobalUtils.getEnableRedXNewTheme() ? 0 : 25,
            paddingTop: GlobalUtils.getEnableRedXNewTheme() ? 25 : 0,
            padding: 24,
            ...appStyles.alignItemsCenter,
            paddingBottom: 40,
        },
        terms: {
            borderBottomWidth: 1,
            borderColor: appColors.main.tokyoRed,
        },
        logo: {
            width: 40,
            height: 40,
            backgroundColor: appColors.neutral.black,
            borderRadius: 100,
        },
        aboutContainer: {
            width: '100%',
            alignItems: 'center',
            backgroundColor: appColors.neutral.white,
            padding: 24,
        },
    });
export default useStyle;
