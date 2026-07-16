import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import GlobalUtils from 'src/core/utils/globalUtils';

const box = {
    borderRadius: 4,
    backgroundColor: appColors.neutral.white,
    shadowColor: appColors.neutral.n700,
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 4,
};
const NFTUnAddedDetailStyles = (insets: EdgeInsets, theme: AppThemeType) => {
    return StyleSheet.create({
        ...appStyles,
        description: {
            ...box,
            marginTop: 16,
            padding: 16,
            ...appStyles.mbt20,
        },
        content: {
            ...box,
        },
        nftImage: {
            width: '100%',
            aspectRatio: 1,
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
        },
        p16: {
            padding: 16,
        },
        nameAndId: {
            borderBottomWidth: 0.6,
            paddingBottom: 12,
            borderColor: appColors.neutral.n200,
        },
        information: {
            paddingTop: 16,
            ...appStyles.flexRow,
            ...appStyles.justifyContentBetween,
            ...appStyles.alignItemsCenter,
        },

        tokenStandard: {
            color: appColors.neutral.n500,
        },
        mt8: {
            marginTop: 8,
        },
        image: { width: '100%', aspectRatio: 1 },
        network: {
            top: 12,
            left: 12,
            width: 40,
            height: 40,
        },
        underline: { textDecorationLine: 'underline' },
        menuIcon: {
            color: appColors.neutral.n800,
        },
        removeContainer: {
            ...appStyles.flexRow,
            ...appStyles.alignItemsCenter,
            ...appStyles.pH25,
        },
        trashBinIcon: {
            color: appColors.main.tokyoRed,
            marginRight: 10,
        },
        buttonDelete: {
            flex: 1,
            height: 48,
        },
        cancelButton: {
            borderColor: appColors.main.tokyoRed,
            borderWidth: 1,
            marginRight: 7,
        },
        confirmButton: {
            backgroundColor: appColors.main.tokyoRed,
            marginLeft: 7,
        },
        button: {
            backgroundColor: appColors.main.tokyoRed,
            minHeight: 48,
            marginBottom: 10,
        },
        bottomButton: {
            position: 'absolute',
            bottom: 0,
            width: '100%',
            paddingBottom: insets.bottom - 20,
        },
        paddingInsets: {
            paddingBottom: insets.bottom + 20,
        },
        pV2: {
            paddingVertical: 5,
        },
        pH6: {
            paddingHorizontal: 10,
            borderRadius: 4,
        },
        verifiedContainer: {
            backgroundColor: appColors.light.green,
        },
        spamContainer: {
            backgroundColor: appColors.main.tokyoRed,
            position: 'absolute',
            top: 10,
            right: 10,
        },
        addedContainer: {
            backgroundColor: appColors.main.tokyoRed,
            position: 'absolute',
            top: 12,
            right: 12,
        },
        addedERC1155Container: {
            backgroundColor: appColors.main.tokyoRed,
            position: 'absolute',
            top: 28,
            right: 60,
        },
        logoCollectionTextLabel: {
            fontSize: 15,
            fontWeight: '500',
        },
        widthHalf: { width: '50%' },
        containerBackground: {
            backgroundColor: theme.colors.surface_surface_default,
        },
        boxUnAddedDetail: {
            ...appStyles.pH25,
            ...appStyles.pT15,
            ...appStyles.flex1,
        },
        buttonAddCollection: {
            ...appStyles.pH25,
            ...appStyles.pT10,
            backgroundColor: undefined,
            paddingBottom: insets?.bottom,
        },
        containerUnAddedDetail: {
            ...appStyles.flex1,
            backgroundColor: theme.colors.surface_surface_default,
        },
    });
};

export default NFTUnAddedDetailStyles;
