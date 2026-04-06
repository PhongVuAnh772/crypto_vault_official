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
        content: {
            alignItems: 'center',
            marginTop: 40,
        },
        title: {
            marginBottom: 20,
            fontWeight: '400',
        },
        errorText: {
            marginTop: 10,
        },
        keypadWrapper: {
            flex: 1,
            justifyContent: 'flex-end',
            paddingBottom: 20,
        },
    });

export default useStyles;
