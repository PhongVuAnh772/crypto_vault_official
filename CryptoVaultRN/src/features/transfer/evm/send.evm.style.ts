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
const useStyles = (theme: AppThemeType, insets?: EdgeInsets) =>
    StyleSheet.create({
        ...appStyles,
        container: {
            ...appStyles.pT10,
            ...appStyles.flex1,
            backgroundColor: '#08090C',
        },
        closeButton: {
            backgroundColor: '#4C4FFC',
            width: '40%',
            ...appStyles.mt25,
        },
        WalletInput: {
            paddingVertical: 8,
            borderRadius: 12,
            borderColor: '#23253b',
        },
        labelWalletAddress: {
            color: '#6C7A8A',
            fontSize: 13,
            fontWeight: '600',
            textTransform: 'uppercase',
            marginBottom: 3,
        },
        input: {
            borderWidth: 0,
        },
        amountInputWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#161729',
            borderColor: '#23253b',
            borderWidth: 1,
            borderRadius: 12,
            paddingHorizontal: 16,
            height: 56,
        },
        amountInput: {
            flex: 1,
            color: '#FFFFFF',
            fontSize: 22,
            fontWeight: '700',
            padding: 0,
        },
        tokenSelectorBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#1D1F3B',
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderWidth: 1,
            borderColor: '#2D3056',
        },
        tokenBadgeText: {
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: '700',
            marginHorizontal: 6,
        },
        feeCard: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#111222',
            borderColor: '#1B1C30',
            borderWidth: 1,
            borderRadius: 12,
            padding: 16,
            marginTop: 20,
        },
        feeIconWrapper: {
            backgroundColor: '#1D1F3B',
            padding: 10,
            borderRadius: 10,
            marginRight: 12,
        },
        warningBanner: {
            flexDirection: 'row',
            backgroundColor: 'rgba(225, 37, 27, 0.08)',
            borderColor: 'rgba(225, 37, 27, 0.3)',
            borderWidth: 1,
            borderRadius: 12,
            padding: 16,
            marginTop: 15,
        },
        warningTextContainer: {
            flex: 1,
            marginLeft: 12,
        },
        button: {
            backgroundColor: '#4C4FFC',
            borderRadius: 12,
            minHeight: 54,
            justifyContent: 'center',
            alignItems: 'center',
        },
        newButton: {
            paddingBottom: insets ? Math.max(insets.bottom, 15) : 15,
            ...appStyles.pH25,
            backgroundColor: 'transparent',
        },
        flex1: {
            flex: 1,
        },
        pH25: {
            paddingHorizontal: 25,
        },
    });
export default useStyles;
