import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';

const NFTItemStyle = StyleSheet.create({
    ...appStyles,
    container: {
        borderRadius: 4,
        flex: 1,
    },
    pH12: {
        paddingHorizontal: 12,
    },
    pl8: {
        paddingLeft: 8,
    },
    pr8: {
        paddingRight: 8,
    },
    ml8: {
        marginLeft: 8,
    },
    mr8: {
        marginRight: 8,
    },
    avatarDetail: {
        ...appStyles.fullWidth,
        width: '100%',
        backgroundColor: appColors.neutral.white,
        height: 172,
    },
    flexHalf: {
        flex: 1 / 2,
    },
    itemHalfStat: {
        width: '50%',
    },
});

export default NFTItemStyle;
