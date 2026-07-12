import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';

const NFTCollectionStyle = StyleSheet.create({
    ...appStyles,
    screenContent: {
        paddingHorizontal: 20,
        flex: 1,
    },
    listContentContainer: {
        flexGrow: 1,
        paddingTop: 16,
        paddingBottom: 20,
    },
    collectionCard: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: appColors.neutral.n200,
        backgroundColor: appColors.neutral.white,
        padding: 14,
        shadowColor: appColors.neutral.black,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    collectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 14,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarFrame: {
        width: 40,
        height: 40,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: appColors.neutral.n200,
    },
    collectionTitleWrap: {
        paddingHorizontal: 12,
        flex: 1,
    },
    viewAllButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: appColors.neutral.n200,
        borderRadius: 999,
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    viewAllText: {
        marginRight: 2,
    },
    cardInnerList: {
        marginHorizontal: -8,
    },
    container: {
        borderRadius: 4,
        flex: 1,
    },
    image: {},
    pH12: {
        paddingHorizontal: 12,
    },
    iconArrow: {
        color: appColors.neutral.n500,
    },
    columnWrapper: {
        justifyContent: 'space-between', // Optional: Distribute items evenly
    },
    avatarDetail: {
        ...appStyles.fullWidth,
        width: '100%',
        height: 172,
    },
    pl8: {
        paddingLeft: 8,
    },
    pr8: {
        paddingRight: 8,
    },
    flex0: {flex: 0},
    notificationIcon: {
        color: appColors.main.tokyoRed,
    },
    plusIcon: {
        color: appColors.main.tokyoRed,
    },
    notificationContainer: {
        borderWidth: 1,
        borderColor: appColors.neutral.n200,
        padding: 8,
        borderRadius: 4,
    },
    dot: {
        backgroundColor: appColors.main.tokyoRed,
        width: 6,
        height: 6,
        borderRadius: 3,
        position: 'absolute',
        right: -2,
        top: -2,
    },
    mt45: {
        marginTop: 45,
    },
    addDocument: {
        color: appColors.neutral.n500,
    },
    listEmptyContainer: {
        paddingHorizontal: 28,
        paddingVertical: 32,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: appColors.neutral.n200,
        backgroundColor: appColors.neutral.white,
        alignItems: 'center',
    },
    emptyIconWrap: {
        width: 64,
        height: 64,
        borderRadius: 18,
        backgroundColor: appColors.neutral.n100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pv12: {
        paddingVertical: 12,
    },
    importNFTbutton: {
        backgroundColor: appColors.main.tokyoRed,
        minHeight: 48,
        marginBottom: 10,
        width: '100%',
    },
    separator: {
        height: 14,
    },
});

export default NFTCollectionStyle;
