import { StyleSheet } from 'react-native';
import { AppThemeType } from 'src/core/type/ThemeType';

const useAppButtonStyles = (theme?: AppThemeType) =>
    StyleSheet.create({
        content: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
        },
    });

export default useAppButtonStyles;
