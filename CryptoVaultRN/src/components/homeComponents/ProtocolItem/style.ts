import { StyleSheet } from 'react-native';
import appColors from 'src/core/constants/AppColors';

const protocolItemStyle = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        backgroundColor: '#FFFFFF',
    },
    selectedCard: {
        borderColor: '#D6D4FF',
        backgroundColor: '#F8F7FF',
        shadowColor: '#6A56FD',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 1,
    },
    unselectedCard: {
        borderColor: '#F0F1F5',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        marginRight: 14,
    },
    imageToken: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    textContainer: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    protocolName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1C36',
    },
    symbolBadge: {
        backgroundColor: '#F0EEFF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginLeft: 8,
    },
    symbolText: {
        color: '#6A56FD',
        fontSize: 10,
        fontWeight: '700',
    },
    protocolDesc: {
        fontSize: 12,
        color: '#7D859A',
    },
    rightContainer: {
        marginLeft: 12,
    },
    checkedCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#6A56FD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    uncheckedCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1.5,
        borderColor: '#D0D5DD',
        backgroundColor: '#FFFFFF',
    },
});

export default protocolItemStyle;
