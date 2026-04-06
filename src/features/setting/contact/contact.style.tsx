import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';

const useStyle = (theme: AppThemeType) =>
    StyleSheet.create({
        ...appStyles,
        container: {
            paddingHorizontal:  0,
            marginHorizontal:  24,
            marginTop:  16,
            paddingTop:  0,
            justifyContent: 'space-between',
            flex: 1,
            marginBottom:  26,
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
            marginBottom:  10,
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
