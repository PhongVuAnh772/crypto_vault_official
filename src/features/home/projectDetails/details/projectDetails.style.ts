import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import appColors from 'src/core/constants/AppColors';
import { mPlus1 } from 'src/core/constants/FontFamily';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import Utils from 'src/core/utils/commonUtils';

export const containerStyles = (theme: AppThemeType, insets: EdgeInsets) => {
    return StyleSheet.create({
        seeMoreNewUI: {
            marginRight: 21.5,
        },
        imageBanner: {
            ...appStyles.fullWidth,
            borderRadius: 8,
            height: 200,
        },
        projectDescriptionContainer: { flexShrink: 1 },
        imageDetailBanner: {
            ...appStyles.fullWidth,
            aspectRatio: 16 / 9,
        },
        modalLinkingContainer: {
            position: 'absolute',
            top: 0,
            left: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            width: Utils.screenWidth,
            height: Utils.screenHeight,
            paddingTop: insets.top,
            zIndex: 10,
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: '25%',
            paddingHorizontal: 25,
        },

        footerDetails: {
            paddingTop: 15,
            borderTopWidth: 1,
        },
        claimTokenButton: {
            backgroundColor: theme.colors.surface_surface_brand,
            width: '88%',
            marginBottom: insets.bottom,
            zIndex: 10,
            marginTop: 10,
            height: 48,
        },
        claimTokenButtonContainer: {
            backgroundColor: appColors.neutral.white,
            width: '100%',
            position: 'absolute',
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
        },
        linkingTonAddressButton: {
            backgroundColor: theme.colors.surface_surface_brand,
            width: '100%',
            zIndex: 10,
            ...appStyles.mt10,
        },
        cartWrapper: {
            padding: 15,
            marginTop: 5,
            backgroundColor: appColors.neutral.white,
            borderRadius: 6,
            shadowColor: appColors.neutral.n800,
            shadowOffset: {
                width: 0,
                height: 1,
            },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        cartPriceFeedWrapper: {
            paddingHorizontal: 15,
            marginTop: 5,
            backgroundColor: appColors.neutral.white,
            borderRadius: 6,
            paddingVertical: 10,
            shadowColor: appColors.neutral.n800,
            shadowOffset: {
                width: 0,
                height: 1,
            },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        readLess: { lineHeight: 21 },
        toggleLineText: {
            marginBottom: 0,
            color: appColors.main.tokyoRed,
        },
        linkedWrapper: {
            padding: 15,
            marginTop: 5,
            backgroundColor: appColors.neutral.white,
            borderRadius: 6,
        },
        imageInsideModal: {
            borderRadius: 8,
            width: 300,
            height: 300,
        },
        modalCollectionContainer: {
            height: 350,
        },
        buttonSheet: {
            backgroundColor: theme.colors.surface_surface_brand,
            marginBottom: insets.bottom,
            marginTop: 35,
            height: 48,
        },
        closeButton: {
            width: 24,
            height: 24,
            ...appStyles.center,
        },
        emptyClaimDetails: {
            paddingVertical: 50,
            ...appStyles.alignItemsCenter,
            ...appStyles.justifyContentCenter,
        },
        decoration: {
            textDecorationLine: 'underline',
            textDecorationColor: appColors.main.tokyoRed,
        },
        webviewContainer: {
            height: '100%',
            width: Utils.screenWidth,
            bottom: 0,
        },
        pagination: {
            width: 8,
            height: 8,
            borderRadius: 5,
            marginTop: 16,
        },
        itemClaimDetails: {
            width: '25.333333%',
        },
        buttonAddingNFT: {
            paddingVertical: 6,
            paddingHorizontal: 12,
            backgroundColor: theme.colors.surface_surface_button_container,
        },
        transform: { textTransform: 'uppercase' },
        ProtocolNFTView: {
            height: '100%',
            width: 1,
            backgroundColor: 'red',
        },
        closeContainer: {
            position: 'absolute',
            alignItems: 'flex-end',
            width: '100%',
            justifyContent: 'center',
        },
        indexButton: {
            zIndex: 9,
        },
        cancelActionSwitching: {
            backgroundColor: appColors.neutral.white,
            borderColor: appColors.main.tokyoRed,
            borderWidth: 0.6,
        },
        protocolNFTViewContainer: {
            flexShrink: 1,
            width: '65%',
        },
        headerChart: {
            width: '100%',
            height: 50,
            backgroundColor: appColors.neutral.white,
            ...appStyles.pV10,
            ...appStyles.pH10,
            ...appStyles.flexRow,
            ...appStyles.justifyContentBetween,
        },
        inputAddressContainer: {
            backgroundColor: appColors.neutral.n100,
            padding: 0,
            height: 40,
            ...appStyles.pL10,
        },
        inputAddressContent: {
            color: appColors.neutral.black,
            textAlign: 'auto',
            fontFamily: mPlus1.bold,
            fontWeight: '700',
            fontSize: 14,
            paddingHorizontal: 0,
            height: 40,
        },
        scanIcon: {
            height: 28,
            width: 28,
            ...appStyles.center,
            backgroundColor: appColors.main.tokyoRed,
            borderRadius: 4,
            marginRight: 5,
        },
        modalContainer: {
            ...appStyles.center,
            borderRadius: 4,
            backgroundColor: theme.colors.surface_surface_high,
            ...appStyles.pV15,
            zIndex: 10,
            paddingHorizontal: 25,
            paddingVertical: 35,
        },
        view_inputAddress: {
            ...appStyles.flexRow,
            ...appStyles.alignItemsCenter,
            ...appStyles.justifyContentBetween,
            backgroundColor: theme.colors.surface_surface_high,
            shadowColor: appColors.neutral.n900,
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.1,
            elevation: 4,
            borderRadius: 4,
            marginTop: 12,
        },
        errorText: {
            marginTop: 12,
        },
        walletError: {
            borderColor: appColors.main.tokyoRed,
            borderWidth: 1,
        },
        cancelButton: {
            backgroundColor: theme.colors.surface_surface_high,
            borderColor: theme.colors.text_on_surface_text_brand_2,
            borderWidth: 0.5,
        },
        editInputStyle: {
            backgroundColor: theme.colors.surface_surface_high,
            minHeight: 40,
            maxHeight: 40,
        },
        editInputStyle2: {
            maxHeight: 40,
        },
        button: {
            backgroundColor: appColors.neutral.white,
            flex: 1,
            borderColor: appColors.main.tokyoRed,
            borderWidth: 1,
        },
        buttonModalNewUI: {
            flex: 1,
        },
        button2: {
            backgroundColor: theme?.colors.label_surface_button_primary,
            flex: 1,
            minHeight: 48,
            // width: '40%',
        },
    });
};

export const slideStyles = () => {
    return StyleSheet.create({
        wrapper: {
            height: 200,
        },

        imageBanner: {
            ...appStyles.fullWidth,
            height: 300,
            borderRadius: 5,
        },
        pagination: {
            position: 'absolute',
            bottom: 10,
        },
        closeContainer: {
            position: 'absolute',
            alignItems: 'flex-end',
            width: '100%',
            justifyContent: 'center',
        },
        closeButton: {
            width: 24,
            height: 24,
            ...appStyles.center,
        },
        indexButton: {
            zIndex: 9,
        },
    });
};
