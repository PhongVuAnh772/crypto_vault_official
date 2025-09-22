import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import GlobalUtils from 'src/core/utils/globalUtils';

const useStyles = (theme: AppThemeType, insets: EdgeInsets) =>
    StyleSheet.create({
        ...appStyles,
        container: {
            paddingVertical: 12,
            flex: 1,
            backgroundColor: theme.colors.surface_surface_default,
        },

        button: {
            backgroundColor: appColors.main.tokyoRed,
            minHeight: 48,
            marginBottom: GlobalUtils.getEnableRedXNewTheme() ? 0 : 10,
        },

        hideCanvas: {
            opacity: 0,
            width: 0,
            height: 0,
        },
        viewButton: {
            ...appStyles.pH25,
            ...appStyles.pT15,
            paddingBottom: GlobalUtils.getEnableRedXNewTheme()
                ? insets.bottom
                : 30,
            backgroundColor: GlobalUtils.getEnableRedXNewTheme()
                ? appColors.neutral.white
                : undefined,
        },
    });

export default useStyles;
