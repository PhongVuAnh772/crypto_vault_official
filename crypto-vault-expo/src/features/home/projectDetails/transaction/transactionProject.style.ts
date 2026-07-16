import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';

export const containerStyles = (theme: AppThemeType, insets: EdgeInsets) => {
    return StyleSheet.create({
        imageBanner: {
            ...appStyles.fullWidth,
            borderRadius: 8,
            height: 110,
        },

        footerDetails: {
            paddingTop: 15,
            borderTopWidth: 1,
        },
        claimTokenButton: {
            marginTop: 30,
            backgroundColor: theme.colors.surface_surface_brand,
            width: '100%',
        },
        cartWrapper: { padding: 15, borderWidth: 0.4, marginTop: 15 },
        readLess: { lineHeight: 21 },
        toggleLineText: {
            lineHeight: 21,
            marginTop: 0,
            textAlign: 'center',
            color: appColors.main.tokyoRed,
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
    });
};

export const slideStyles = () => {
    return StyleSheet.create({
        wrapper: {
            paddingTop: 25,
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
        ProtocolNFTView: {
            height: '100%',
            width: 1,
            backgroundColor: 'red',
        },
    });
};

export const transactionStyles = (theme: AppThemeType) => {
    return StyleSheet.create({
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: '10%',
        },
        emptyTitle: {
            paddingTop: 15,
        },
        itemContainer: {
            ...appStyles.fullWidth,
            paddingVertical: 15,
        },
        itemTransactionContainer: {
            width: '100%',
            padding: 15,
            backgroundColor: appColors.neutral.white,
            shadowColor: appColors.neutral.n300,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 4,
            elevation: 4,
        },
        transactionHistoryContainer: {
            padding: 16,
            backgroundColor: '#fff',
            borderRadius: 8,
            marginTop: 10,
        },
        transactionHistoryTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 12,
        },
        transactionHistoryLabel: {
            fontSize: 14,
            fontWeight: '600',
            marginTop: 8,
        },
        transactionHistoryValue: {
            fontSize: 14,
            marginBottom: 8,
        },
        transactionHistoryNftContainer: {
            marginVertical: 4,
            padding: 8,
            borderRadius: 4,
            backgroundColor: theme.colors.surface_surface_brand_light,
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 1,
            },
            shadowOpacity: 0.3,
            shadowRadius: 2,
            elevation: 3,
        },
        transactionHistoryItemContainer: {
            padding: 16,
            backgroundColor: '#fff',
            borderRadius: 8,
            ...appStyles.mbt10,
        },
    });
};
