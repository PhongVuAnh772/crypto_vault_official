import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        actionContainer: {
            flexDirection: 'row',
            backgroundColor: theme.colors.surface_surface_high,
            padding: 12,
            borderRadius: 4,
            shadowColor: appColors.neutral.n400,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 3.84,
            elevation: 100,
            // width: '100%',
            // justifyContent: 'space-between',
            // alignItems: 'center',
        },
        line: {
            width: 1,
            backgroundColor: appColors.neutral.n200,
            height: '100%',
            ...appStyles.mh10,
        },
        colorIcon: {
            color: theme.colors.text_on_surface_text_high,
        },
    });

export default useStyles;
