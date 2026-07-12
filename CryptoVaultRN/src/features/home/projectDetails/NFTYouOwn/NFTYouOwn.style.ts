import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import Utils from 'src/core/utils/commonUtils';

export const useStyles = (theme: AppThemeType) => {
    return StyleSheet.create({
        closeButton: {
            width: '100%',
            backgroundColor: appColors.main.tokyoRed,
        },
        project: {
            width: '100%',
            padding: 16,
            backgroundColor: theme.colors.surface_surface_high,
            marginTop: 30,
        },
        details: {
            width: '100%',
            padding: 16,
            backgroundColor: theme.colors.surface_surface_high,
            marginTop: 30,
        },
        projectContainer: {
            width: '100%',
        },
        imageToken: {
            width: 20,
            height: 20,
            borderRadius: 50,
        },
        NFTAddingContainer: {
            width: Utils.screenWidth * 0.8,
        },
        imageTokenNFT: {
            resizeMode: 'stretch',
            width: '100%',
            aspectRatio: 1,
            alignSelf: 'center',
        },
        imageTokenNFTDefault: {
            height: 300,
            ...appStyles.fullWidth,
        },
        buttonModal_continue: {
            ...appStyles.mbt15,
            backgroundColor: theme.colors.surface_surface_brand,
            width: '100%',
            ...appStyles.mt15,
        },
        buttonModal_cancel: {
            borderWidth: 1,
            borderColor: theme.colors.text_on_surface_text_brand_2,
        },
        ProtocolNFTView: {
            height: '100%',
            width: 1,
            backgroundColor: 'red',
        },
        protocolNFTViewContainer: {
            flexShrink: 1,
            width: '65%',
        },
        containerLoading: {
            backgroundColor: appColors.neutral.white,
        },
        logoLoading: {
            borderRadius: 50,
            ...appStyles.ml10,
        },
        containerLoadingListNFTOwnView: {
            ...appStyles.pT30,
            ...appStyles.flex1,
            ...appStyles.alignItemsCenter,
            backgroundColor: theme.colors.surface_surface_default,
        },
        containerLoadingListNFTOwnViewList: {
            ...appStyles.flex1,
            ...appStyles.pH25,
            backgroundColor: theme.colors.surface_surface_default,
        },
        container: {
            ...appStyles.flex1,
            ...appStyles.pH25,
            backgroundColor: theme.colors.surface_surface_default,
        },
        viewContainer: {
            ...appStyles.pT30,
            ...appStyles.alignItemsCenter,
            ...appStyles.pH25,
            ...appStyles.flex1,
            backgroundColor: theme.colors.surface_surface_default,
        },
    });
};
