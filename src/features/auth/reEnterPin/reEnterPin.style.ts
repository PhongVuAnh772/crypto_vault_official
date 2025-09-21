import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';

const useStyles = (theme: AppThemeType, insets: EdgeInsets) =>
    StyleSheet.create({
        container: {
            ...appStyles.flex1,
            ...appStyles.mh25,
        },
        newContainer: {
            ...appStyles.flex1,
            backgroundColor: theme.colors.surface_surface_default,
        },
        createAccount: {
            paddingBottom: insets.bottom,
        },
    });
export default useStyles;
