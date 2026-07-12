import { StyleSheet } from 'react-native';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        ...appStyles,
        container: {
            ...appStyles.pH25,
            ...appStyles.mt15,
            ...appStyles.flex1,
            backgroundColor: theme.colors.surface_surface_default,
        },
    });
export default useStyles;
