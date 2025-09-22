import {AppThemeType} from 'src/core/type/ThemeType';
import {StyleSheet} from 'react-native';

const usingStyles = (theme: AppThemeType) => {
    return StyleSheet.create({
        content: {
            paddingVertical: 16,
        },
        other: {
            backgroundColor: theme.mode,
        },
    });
};
export default usingStyles;
