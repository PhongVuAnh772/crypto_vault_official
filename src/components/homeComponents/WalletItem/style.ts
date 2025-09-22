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
            marginHorizontal: 16,
        },
        markIconProtocol: {
            color: appColors.main.tokyoRed,
        },
        size28: {
            width: 28,
            height: 28,
        },
        walletSelected: {
            backgroundColor: theme.colors.surface_surface__medium,
        },
        walletIcon3: {
            ...appStyles.center,
            width: 32,
            height: 32,
            backgroundColor: theme.colors.surface_surface_high,
            borderRadius: 100,
            shadowColor: appColors.neutral.n300,
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 1,
            shadowRadius: 4,
            elevation: 4,
        },
        walletOption: {
            ...appStyles.center,
            ...appStyles.pd15,
        },
    });

export default useStyles;
