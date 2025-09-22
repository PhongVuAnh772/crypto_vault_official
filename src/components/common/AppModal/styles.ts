import { StyleSheet } from 'react-native';
import { AppThemeType } from 'src/core/type/ThemeType';

const useStyles = (theme?: AppThemeType) =>
    StyleSheet.create({
        modalContainer: {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            flex: 1,
        },
        modalView: {
            backgroundColor: theme?.colors.surface_surface_high,
            padding: 24,
            marginHorizontal: 15,
            alignItems: 'center',
            borderRadius: 4,
        },
        button: {
            backgroundColor: theme?.colors.label_surface_button_primary,
            width: '100%',
            minHeight: 48,
        },
        button2: {
            backgroundColor: theme?.colors.label_surface_button_primary,
            flex: 1,
            minHeight: 48,
            // width: '40%',
        },
        exitIcon: {
            position: 'absolute',
            top: 10,
            right: 10,
            width: 30,
            height: 30,
            justifyContent: 'center',
            alignItems: 'center',
        },
    });

export default useStyles;
