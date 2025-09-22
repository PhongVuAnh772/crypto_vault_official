import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';

const useStyles = (theme: AppThemeType,insets:EdgeInsets) =>
    StyleSheet.create({
        close: {
            position: 'absolute',
            left: 15,
        },

        header: {
            textAlign: 'center',
            marginBottom: 10,
        },
        image_40: {
            width: 60,
            height: 60,
            marginBottom: 10,
            borderRadius: 60,
            borderWidth: 0.6,
            borderColor: theme.colors.onBackground,
        },
        titleWithValueContainer: {
            ...appStyles.flexRow,
            ...appStyles.justifyContentBetween,
            ...appStyles.alignItemsCenter,
        },
        borderBottom:{
            borderBottomColor:theme.colors.outline_outine_lightest,
            borderBottomWidth:1
        },
        buttonApprove: {
            marginTop: 16,
            backgroundColor: theme.colors.label_surface_button_primary,
            paddingVertical: 10,
            borderRadius: 10,
        },
        view_connect: {
            backgroundColor:theme.colors.surface_surface_high,
            paddingHorizontal:24,
            paddingBottom:insets?.bottom,
            ...appStyles.flex1,
        },
        buttonModal_continue: {
            backgroundColor: theme.colors.label_surface_button_primary,
            ...appStyles.mbt15,
        },
        buttonModal_cancel: {
            borderWidth: 1,
            borderColor: theme.colors.text_on_surface_text_brand_2,
        },
        infoWallet: {
             backgroundColor: theme.colors.surface_surface_high,
             paddingHorizontal:16,
             paddingVertical:24,
             shadowColor: appColors.neutral.n400,
             borderWidth: 1,
             borderColor: theme.colors.outline_outine_lightest,
             shadowOffset: {
                 width: 0,
                 height: 4,
             },
             shadowOpacity: 0.3,
             shadowRadius: 40,
             elevation: 10,
         },
         headerTitle:{
            width: '100%', alignItems: 'center',marginBottom:8
         },
         view_switch_address: {
            ...appStyles.flexRow,
            ...appStyles.pd16,
            backgroundColor: theme.colors.surface_surface_high,
            shadowColor: appColors.neutral.n600,
            borderWidth: 0.6,
            borderColor: theme.colors.outline_outine_lightest,
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 10,
            borderRadius: 6,
            width: '100%',
            ...appStyles.center
        },
    });
export default useStyles;
