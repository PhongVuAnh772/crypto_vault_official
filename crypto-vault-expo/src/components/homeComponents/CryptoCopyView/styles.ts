import appStyles from 'src/core/styles';
import {AppThemeType} from 'src/core/type/ThemeType';
import {StyleSheet} from 'react-native';

const useStyles = (theme: AppThemeType, gap = 8) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.colors.surface_surface_high,
            paddingHorizontal: 12,
            paddingVertical: 18,
            borderRadius: 4,
            // shadowColor: appColors.neutral.n300,
            // shadowOffset: {width: 0, height: 4},
            // shadowOpacity: 1,
            // shadowRadius: 4,
        },
        shortCurrencyContainer: {
            paddingHorizontal: 8,
            backgroundColor: theme.colors.surface_surface__medium,
            borderRadius: 4,
            ...appStyles.center,
        },
        shortCryptoDetailContainer: {
            marginVertical: -(gap / 2),
            paddingLeft: 4,
        },
        titleCryptoDetail: {
            marginVertical: gap / 2,
            color: theme.colors.text_on_surface_text_high,
        },
        titleCryptoDescription: {
            marginVertical: gap / 2,
            color: theme.colors.text_on_surface_text_light,
        },
        headerIconContainer: {
            width: 40,
            height: 40,
            ...appStyles.center,
            borderRadius: 4,
        },
        listContainer: {
            height: '100%',
        },
    });

export default useStyles;
