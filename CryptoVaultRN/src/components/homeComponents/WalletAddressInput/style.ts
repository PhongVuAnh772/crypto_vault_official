import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';
import { mPlus1 } from 'src/core/constants/FontFamily';
import appStyles from 'src/core/styles';

const WalletAddressInputStyle = StyleSheet.create({
    ...appStyles,
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#161729',
        borderColor: '#23253b',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
        marginTop: 8,
    },
    labelName: {
        color: '#6C7A8A',
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    inputAddressContent: {
        flex: 1,
        color: '#FFFFFF',
        fontFamily: mPlus1.bold,
        fontWeight: '700',
        fontSize: 15,
        padding: 0,
        height: '100%',
    },
    to: {
        marginRight: 8,
    },
    actionIconsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionIconButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    verticalDivider: {
        width: 1,
        height: 20,
        backgroundColor: '#23253b',
        marginHorizontal: 4,
    },
});

export default WalletAddressInputStyle;
