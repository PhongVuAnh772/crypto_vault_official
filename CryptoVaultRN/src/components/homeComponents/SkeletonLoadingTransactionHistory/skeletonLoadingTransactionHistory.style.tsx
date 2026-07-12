import {AppThemeType} from 'src/core/type/ThemeType';
import {StyleSheet} from 'react-native';

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        loadingItem: {
            padding: 16,
            backgroundColor: theme.colors.text_on_surface_text_brand,
        },
        swap: {position: 'absolute', left: 10},
        dotSwap: {
            position: 'absolute',
            left: 10,
            bottom: -3,
        },
        typeContainer: {
            backgroundColor: theme.colors.label_surface_button_pressed,
            borderRadius: 50,
            height: 28,
            width: 60,
        },
    });

export default useStyles;
