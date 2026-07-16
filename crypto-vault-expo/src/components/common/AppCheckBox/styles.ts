import appStyles from 'src/core/styles';
import {AppThemeType} from 'src/core/type/ThemeType';
import {StyleSheet} from 'react-native';

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        container: {
            ...appStyles.center,
            borderWidth: 1,
            borderColor: theme.colors.outline_outine,
            width: 20,
            height: 20,
            borderRadius: 4,
        },
    });

export default useStyles;
