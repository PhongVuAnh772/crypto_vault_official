import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';

const useStyles = (theme: AppThemeType, insets: EdgeInsets) =>
    StyleSheet.create({
        button: {
            backgroundColor: theme.colors.surface_surface_brand,
            marginBottom: insets.bottom,
            width: '100%',
            ...appStyles.mt15,
        },
        buttonNewTheme: {
            marginBottom: insets.bottom,
        },
    });
export default useStyles;
