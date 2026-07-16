import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        button: {
            backgroundColor: theme.colors.label_surface_button_primary,
            width: '100%',
        },
        inputContainer: {
            height: 40,
            flex: 1,
            marginVertical: 4,
        },
        input: {
            height: 40,
            backgroundColor: theme.colors.surface_surface_high,
            flex: 1,
            ...appStyles.center,
            textAlignVertical: 'center',
            paddingVertical: 12,
            paddingHorizontal: 8,
            color: theme.colors.text_on_surface_text_high,
        },
        newInput: {
            height: 40,
            flex: 1,
            ...appStyles.center,
            textAlignVertical: 'center',
            paddingVertical: 12,
            color: theme.colors.text_on_surface_text_high,
        },
        pasteButton: {
            position: 'absolute',
            width: 70,
        },
        suggestionBar: {
            ...appStyles.flexRow,
            backgroundColor: 'rgba(51, 52, 52, 0.6)',
        },
        suggestionItem: {
            padding: 10,
            marginRight: 10,
            backgroundColor: '#fff',
            borderRadius: 5,
        },
        grid: {
            flexGrow: 1,
        },
        indexView: {
            ...appStyles.center,
            ...appStyles.pd10,
            backgroundColor: theme.colors.surface_surface_high,
            marginRight: 2,
            borderTopLeftRadius: 4,
            borderBottomLeftRadius: 4,
            minWidth: 35,
        },
        newIndexView: {
            ...appStyles.center,
            ...appStyles.pd10,
            borderTopLeftRadius: 4,
            borderBottomLeftRadius: 4,
            minWidth: 35,
        },
        itemContent: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
        },
        newThemeOpacity: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: appColors.neutral.white,
            opacity: 0.7,
        },
        itemContainer: {
            ...appStyles.flexRow,
            position: 'absolute',
            zIndex: 2,
        },
        buttonContainer: {
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '100%',
        },
        header: {
            backgroundColor: appColors.main.tokyoRed,
            marginHorizontal: 0,
            paddingHorizontal: 25,
        },
    });

export default useStyles;
