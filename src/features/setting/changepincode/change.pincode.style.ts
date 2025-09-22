import { StyleSheet } from 'react-native';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        boxPinCode: {
            ...appStyles.pT60,
            ...appStyles.flex1,

            backgroundColor: theme.colors.surface_surface_default,
        },
    });

export default useStyles;
