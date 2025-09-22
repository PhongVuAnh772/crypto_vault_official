import { StyleSheet } from 'react-native';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        container: {
            ...appStyles.flex1,
            ...appStyles.alignItemsCenter,
            ...appStyles.justifyContentBetween,
            ...appStyles.mh15,
        },
        newContainer: {
            ...appStyles.flex1,
            ...appStyles.alignItemsCenter,
            ...appStyles.justifyContentBetween,
            ...appStyles.pH15,
            backgroundColor: theme.colors.surface_surface_default,
        },
    });
export default useStyles;
