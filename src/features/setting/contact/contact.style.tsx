import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import GlobalUtils from 'src/core/utils/globalUtils';

const useStyle = (theme: AppThemeType) =>
    StyleSheet.create({
        ...appStyles,
        container: {
            paddingHorizontal: GlobalUtils.getEnableRedXNewTheme() ? 24 : 0,
            marginHorizontal: GlobalUtils.getEnableRedXNewTheme() ? 0 : 24,
            marginTop: GlobalUtils.getEnableRedXNewTheme() ? 0 : 16,
            paddingTop: GlobalUtils.getEnableRedXNewTheme() ? 20 : 0,
            justifyContent: 'space-between',
            flex: 1,
            marginBottom: GlobalUtils.getEnableRedXNewTheme() ? 0 : 26,
            backgroundColor: appColors.neutral.white,
        },
        lastUpdate: {
            color: appColors.neutral.n600,
        },
        mt16: {
            marginTop: 16,
        },
        mt8: {
            marginTop: 8,
        },
        inputText: {
            backgroundColor: appColors.neutral.white,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: appColors.neutral.n200,
            marginTop: 4,
        },
        button: {
            backgroundColor: appColors.main.tokyoRed,
            marginBottom: GlobalUtils.getEnableRedXNewTheme() ? 40 : 10,
            minHeight: 48,
        },
        inquiry: {
            minHeight: 100,
            textAlignVertical: 'top',
        },
        inputStyle: {
            backgroundColor: theme.colors.surface_surface_high,
            color: theme.colors.text_on_surface_text_high,
        },
    });
export default useStyle;
