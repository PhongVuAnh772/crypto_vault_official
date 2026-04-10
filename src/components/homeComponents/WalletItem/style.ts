import appStyles from 'src/core/styles';
import {StyleSheet} from 'react-native';
import appColors from 'src/core/constants/AppColors';
import {AppThemeType} from 'src/core/type/ThemeType';

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        ...appStyles,
        listProtocolItem: {
            paddingHorizontal: 16,
            paddingVertical: 14,
        },
        nameProtocol: {
            marginLeft: 16,
            marginRight: 8,
        },
        markIconProtocol: {
            color: appColors.main.tokyoRed,
        },
        size28: {
            width: 28,
            height: 28,
        },
        walletSelected: {
            backgroundColor: 'rgba(124, 58, 237, 0.08)',
            borderWidth: 1,
            borderColor: 'rgba(124, 58, 237, 0.2)',
        },
        walletIcon3: {
            ...appStyles.center,
            width: 44,
            height: 44,
            backgroundColor: theme.colors.surface_surface_high,
            borderRadius: 22,
            shadowColor: '#7C3AED',
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 0.15,
            shadowRadius: 10,
            elevation: 8,
            borderWidth: 1,
            borderColor: 'rgba(124, 58, 237, 0.1)',
        },
        copyButton: {
            padding: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.03)',
            borderRadius: 8,
        },
        addressRow: {
            ...appStyles.flexRow,
            ...appStyles.alignItemsCenter,
        },
        walletOption: {
            ...appStyles.center,
            ...appStyles.pd15,
        },
    });

export default useStyles;
