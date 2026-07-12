import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';

import { Platform, StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { AppThemeType } from 'src/core/type/ThemeType';
import Utils from 'src/core/utils/commonUtils';
import GlobalUtils from 'src/core/utils/globalUtils';

const useStyles = (theme: AppThemeType, insets: EdgeInsets) =>
    StyleSheet.create({
        modalContainer: {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            flex: 1,
            justifyContent: 'flex-end',
        },

        subModalContainer1: {
            width: '100%',
            height: '30%',
        },
        subModalContainer2: {
            backgroundColor: appColors.neutral.n100,
            width: '100%',
            height: '70%',
            paddingBottom: 30,
            justifyContent: 'space-between',
            borderRadius: 20,
        },
        viewFrom: {
            paddingHorizontal: 20,
            paddingVertical: 10,
            marginHorizontal: 20,
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 4,
            shadowColor: appColors.neutral.n300,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
            borderColor: theme.colors.outline_outine_lightest,
            borderWidth: 1,
            backgroundColor: appColors.neutral.white,
        },
        viewNFTInformation: {
            paddingHorizontal: 20,
            paddingVertical: 10,
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 4,
            shadowColor: appColors.neutral.n300,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
            borderColor: theme.colors.outline_outine_lightest,
            borderWidth: 1,
        },
        viewTo: {
            paddingHorizontal: 20,
            paddingVertical: 10,
            marginHorizontal: 20,
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 4,
            shadowColor: appColors.neutral.n300,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
            borderColor: theme.colors.outline_outine_lightest,
            borderWidth: 1,
            backgroundColor: appColors.neutral.white,
        },
        viewFromAddress: {
            width: '100%',
            paddingVertical: 5,
            alignItems: 'center',
            justifyContent: 'space-between',
            ...appStyles.flexRow,
        },
        viewSeperate: {
            ...appStyles.mbt10,
        },
        fromText: {
            backgroundColor: theme.colors.surface_surface__medium,
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderRadius: 15,
        },
        networkFee: {
            paddingHorizontal: 20,
            paddingTop: 20,
            justifyContent: 'space-between',
            ...appStyles.flexRow,
        },
        button: {
            backgroundColor: appColors.main.tokyoRed,
            minHeight: 48,
        },
        bottomSheet: {
            position: 'absolute',
            width: '100%',
            height: Utils.BOTTOM_SHEET_MAX_HEIGHT,
            bottom:
                Utils.BOTTOM_SHEET_MIN_HEIGHT - Utils.BOTTOM_SHEET_MAX_HEIGHT,
            ...Platform.select({
                android: { elevation: 3 },
                ios: {
                    shadowColor: '#a8bed2',
                    shadowOpacity: 1,
                    shadowRadius: 6,
                    shadowOffset: {
                        width: 2,
                        height: 2,
                    },
                },
            }),
            backgroundColor: appColors.neutral.n100,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            justifyContent: 'space-between',
            paddingBottom: 30,
        },
        draggableArea: {
            width: 132,
            height: 32,
            alignSelf: 'center',
            justifyContent: 'center',
            alignItems: 'center',
        },
        dragHandle: {
            width: 100,
            height: 6,
            backgroundColor: '#d3d3d3',
            borderRadius: 10,
        },
        confirmTitle: {
            paddingLeft: 20,
            paddingBottom: 20,
        },
        mtFee: {
            marginTop: 17,
        },
        buttonConfirm: {
            ...appStyles.pH25,
            ...appStyles.pT10,
            backgroundColor: undefined,
            paddingBottom: 0,
        },
        container: {
            ...appStyles.pT15,
            ...appStyles.flex1,
            backgroundColor: theme.colors.surface_surface_default,
        },
    });

export default useStyles;
