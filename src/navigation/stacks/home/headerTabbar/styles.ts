import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import Utils from 'src/core/utils/commonUtils';
import GlobalUtils from 'src/core/utils/globalUtils';

const useStyles = (theme: AppThemeType, insets: EdgeInsets) =>
    StyleSheet.create({
        headerIconContainer: {
            width: 32,
            height: 32,
            ...appStyles.center,
        },
        iconContainer: {
            gap: 4,
            ...appStyles.alignItemsCenter,
            ...appStyles.justifyContentEnd,
            minWidth: 88,
        },
        input: {
            height: 44,
        },
        iconArrowDown: {
            color: appColors.neutral.n700,
        },
        protocolBox: {
            borderRadius: 100,
            borderWidth: 1,
            borderColor: appColors.neutral.n200,
            paddingVertical: 2,
            paddingHorizontal: 4,
        },
        addAccountButton: {
            backgroundColor: theme.colors.surface_surface_high,
        },
        walletIcon: {
            width: 20,
            height: 20,
            backgroundColor: appColors.neutral.white,
            borderRadius: 100,
            ...appStyles.center,
        },
        account: {
            borderRadius: 100,
            borderColor: theme.colors.outline,
            marginLeft: 50,
            ...appStyles.flexRow,
            ...appStyles.center,
            ...appStyles.pd5,
            backgroundColor: theme.colors.surface_surface__medium,
            maxWidth: (Utils.screenWidth * 3.4) / 10,
            paddingRight: 10,
            alignSelf: 'center',
        },
        titleProtocol: {
            textAlign: 'center',
        },
        closeIconStyle: { position: 'absolute', right: 25, top: -5 },
        protocolList: {
            shadowColor: appColors.neutral.n500,
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 2,
            ...appStyles.mt15,
            backgroundColor: appColors.neutral.white,
            borderRadius: 4,
            flex: 1,
        },
        bottomSheet: {
            ...StyleSheet.absoluteFillObject,
        },
        mh6: {
            marginHorizontal: 6,
        },
        size20: {
            width: 20,
            height: 20,
            borderRadius: 20,
        },
        accountIcon: {
            ...appStyles.center,
            width: 26,
            height: 26,
            backgroundColor: theme.colors.surface_surface_high,
            borderRadius: 100,
            shadowColor: appColors.neutral.black,
            shadowOffset: {
                width: 0,
                height: 5,
            },
            shadowOpacity: 0.5,
            shadowRadius: 30,
            elevation: 4,
        },
        protocolContainer: {
            backgroundColor: appColors.other.outline_lightest,
        },
        container: {
            ...appStyles.flexRow,
            ...appStyles.justifyContentBetween,
            ...appStyles.alignItemsCenter,
            ...appStyles.pH25,
            ...appStyles.fullWidth,
            marginTop: insets.top,
            paddingTop: 0,
            backgroundColor: undefined,
        },
        ml8: {
            marginLeft: 8,
        },
        qualityConnect: {
            backgroundColor: 'white',
            borderRadius: 20,
            position: 'absolute',
            right: 0,
            top: -6,
            width: 20,
            height: 20,
            ...appStyles.center,
        },
        searchBar: {
            width: '100%',
            height: 38,
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: 19,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
        },
        searchArea: {
            flex: 1,
            marginHorizontal: 10,
            position: 'relative',
            zIndex: 100,
        },
        searchInput: {
            flex: 1,
            fontSize: 14,
            paddingLeft: 6,
            paddingVertical: 0,
            color: 'white',
        },
        suggestionContainer: {
            position: 'absolute',
            top: 42,
            left: 0,
            right: 0,
            borderRadius: 14,
            backgroundColor: 'rgba(25, 22, 60, 0.96)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.16)',
            overflow: 'hidden',
        },
        suggestionItem: {
            paddingHorizontal: 12,
            paddingVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255,255,255,0.08)',
        },
        suggestionSymbol: {
            color: '#FFFFFF',
            fontWeight: '700',
            fontSize: 12,
            minWidth: 54,
        },
        suggestionName: {
            color: 'rgba(255,255,255,0.75)',
            fontSize: 12,
            flex: 1,
        },
        iconBtn: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: 'rgba(0,0,0,0.05)',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 6,
        },
        protocolScrollWrapper: {
            maxWidth: 156, // Fixed width for the protocol area
            marginHorizontal: 4,
        },
        protocolScroll: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 2,
        },
        protocolIconItem: {
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: 'rgba(255,255,255,0.1)',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 6,
            borderWidth: 1,
            borderColor: 'transparent',
        },
        protocolIconActive: {
            backgroundColor: 'rgba(255,100,100,0.2)', // Light red-ish tint for active
            borderColor: 'rgba(255,255,255,0.4)',
        },
    });

export default useStyles;
