import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';

const useStyle = (theme: AppThemeType) =>
    StyleSheet.create({
        ...appStyles,
        button: {
            padding: 16,
            backgroundColor: theme.colors.surface_surface_high,
            borderRadius: 4,
            shadowColor: appColors.neutral.n700,
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.08,
            shadowRadius: 32,
            elevation: 4,
        },
        buttonText: {
            color: theme.colors.text_on_surface_text_high,
            marginLeft: 16,
            flex: 1,
        },
        animationSelector: {
            position: 'relative',
            marginTop: 2,
        },
        h10: {
            height: 10,
        },
        loading: {
            borderRadius: 4,
            marginVertical: 5,
        },
        iconArrow: {
            color: theme.colors.text_on_surface_text_light,
        },
        container: {
            ...appStyles.flex1,
            backgroundColor: theme.colors.surface_surface_default,
        },
    });
export default useStyle;
