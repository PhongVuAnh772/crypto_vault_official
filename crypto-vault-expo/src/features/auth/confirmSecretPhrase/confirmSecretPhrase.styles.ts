import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';

const useStyles = (theme: AppThemeType, insets: EdgeInsets) =>
    StyleSheet.create({
        button: {
            backgroundColor: theme.colors.surface_surface_brand,
            width: '100%',
        },
        optionItem: {
            ...appStyles.center,
            flex: 1,
            height: 40,
            borderRadius: 4,
        },
        questionContainer: {
            width: '100%',
            backgroundColor: theme.colors.surface_surface_default,
            borderWidth: 1,
            borderColor: theme.colors.outline_outine,
            borderRadius: 2,
            marginTop: 12,
            paddingHorizontal: 15,
            paddingVertical: 15,
        },
        questionContainer2: {
            ...appStyles.alignItemsCenter,
            width: '100%',
            position: 'absolute',
        },
        option: {
            flexDirection: 'row',
            marginTop: 8,
        },
        questionTitle: {
            width: 80,
            height: 24,
            ...appStyles.center,
            backgroundColor: theme.colors.surface_surface_high,
            borderWidth: 1,
            borderColor: theme.colors.outline_outine,
        },
        bdr0: {
            borderRadius: 0,
        },
        bdr100: {
            borderRadius: 100,
        },
        container: {
            ...appStyles.flex1,
            ...appStyles.alignItemsCenter,
            ...appStyles.justifyContentEvenly,
            ...appStyles.pH25,
            backgroundColor: theme.colors.surface_surface_high,
            paddingBottom: insets.bottom,
        },
    });
export default useStyles;
