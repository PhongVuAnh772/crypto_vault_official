import { StyleSheet } from 'react-native';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import GlobalUtils from 'src/core/utils/globalUtils';

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        input: {
            height: 44,
        },
        container: {
            ...appStyles.pH25,
            backgroundColor: GlobalUtils.getEnableRedXNewTheme()
                ? theme.colors.surface_surface_default
                : undefined,
            height: '100%',
        },
    });

export default useStyles;
