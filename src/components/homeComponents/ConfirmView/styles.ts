import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';

import { Platform, StyleSheet } from 'react-native';
import { AppThemeType } from 'src/core/type/ThemeType';
import Utils from 'src/core/utils/commonUtils';

const useStyles = (theme: AppThemeType) =>
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
            backgroundColor: appColors.neutral.white,
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
        },
        viewTo: {
            backgroundColor: appColors.neutral.white,
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
        },
        viewFromAddress: {
            width: '100%',
            paddingVertical: 5,
            alignItems: 'center',
            justifyContent: 'space-between',
            ...appStyles.flexRow,
        },
        fromText: {
            backgroundColor: appColors.neutral.n200,
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderRadius: 15,
        },
        networkFee: {
            paddingHorizontal: 20,
            paddingTop: 20,
            justifyContent: 'space-between',
            alignItems: 'center',
            ...appStyles.flexRow,
        },
        button: {
            backgroundColor: appColors.main.tokyoRed,
            ...appStyles.mh20,
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
    });

export default useStyles;
