import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';

const NFTCollectionStyle = StyleSheet.create({
    ...appStyles,
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
        paddingHorizontal: 48,
        paddingBottom: 100,
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
        height: 20,
    },
});

export default NFTCollectionStyle;
