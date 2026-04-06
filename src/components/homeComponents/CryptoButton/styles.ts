import { StyleSheet } from 'react-native';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import GlobalUtils from 'src/core/utils/globalUtils';

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        container: {
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.outline_outine_lightest,
            paddingHorizontal: 16,
            paddingVertical: 14,
            backgroundColor: theme.colors.surface_surface_high,
        },
        shortCurrencyContainer: {
            paddingHorizontal: 8,
            paddingVertical: 4,
            backgroundColor: theme.colors.surface_surface__medium,
            borderRadius: 4,
            ...appStyles.center,
        },
    });

export default useStyles;
