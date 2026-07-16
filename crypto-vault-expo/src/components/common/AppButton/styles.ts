import { StyleSheet } from 'react-native';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';

const useAppButtonStyles = (theme?: AppThemeType) =>
    StyleSheet.create({
        container: {
            minHeight: 40,
            paddingHorizontal: 12,
            borderRadius: 4,
            ...appStyles.flexRow,
            ...appStyles.center,
        },
    });

export default useAppButtonStyles;
