import { StyleSheet } from 'react-native';
import { AppThemeType } from 'src/core/type/ThemeType';

type CreateStylesType = {
    theme: AppThemeType;
};

const createStyles = ({ theme }: CreateStylesType) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.surface_surface_high,
        },
        button: {
            width: 32,
        },
        headerCamera: {
            position: 'absolute',
            left: 0,
            right: 0,
        },
        mlMinus20: { marginLeft: -20 },
    });
export default createStyles;
