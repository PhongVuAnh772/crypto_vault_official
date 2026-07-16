import {StyleSheet} from 'react-native';
import {AppThemeType} from 'src/core/type/ThemeType';

const useAppSeparatorStyle = (theme: AppThemeType) =>
    StyleSheet.create({
        separator: {
            height: 0.8,
            backgroundColor: theme.colors.outline_outine_lightest,
        },
    });
export default useAppSeparatorStyle;
