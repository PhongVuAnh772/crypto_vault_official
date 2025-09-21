import { StyleSheet } from 'react-native';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        input: {
            height: 44,
        },
        containerItem: {
            width: '100%',
            height: 400,
            marginVertical: 10,
            backgroundColor: theme.colors.surface_surface_high,
        },
        footerItem: {
            ...appStyles.flexRow,
            ...appStyles.justifyContentBetween,
            ...appStyles.mh15,
            ...appStyles.mt12,
            ...appStyles.mbt15,
        },
        container:{
            ...appStyles.flex1,
            ...appStyles.pH25,
            ...appStyles.pT25,
             backgroundColor: theme.colors.surface_surface_default ,
        }
    });

export default useStyles;
