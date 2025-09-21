import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';

const useStyles =(theme :AppThemeType,insets:EdgeInsets)=> StyleSheet.create({
    ...appStyles,
    content: {
        ...appStyles.flex1,
        ...appStyles.alignItemsCenter,
        marginTop: 70,
    },
    button: {
        backgroundColor: appColors.main.tokyoRed,
        minHeight: 48,
    },
    textButton: {
        textTransform: 'uppercase',
    },
    textAppName: {
        marginTop: 36,
        marginBottom: 12,
    },
    viewButton:{
        backgroundColor:appColors.neutral.white,
        paddingVertical:16,
        paddingBottom:insets?.bottom
    }
});
export default useStyles;
