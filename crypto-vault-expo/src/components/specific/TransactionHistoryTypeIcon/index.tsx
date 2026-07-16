import React, { useCallback } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import AppImage from 'src/components/common/AppImage';
import appColors from 'src/core/constants/AppColors';
import {
    BitcoinSvgIcon,
    CalledContractSvgIcon,
    CoinTypeSvgIcon,
    LinkSvgIcon,
    ReceiveSvgIcon,
    SendSvgIcon,
    SwapSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import { appImages } from 'src/core/constants/AppImages';
import { CoinType } from 'src/core/enum/CoinType';
import { TransactionType } from 'src/core/enum/TransactionType';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import appStyles from 'src/core/styles';

type TransactionHistoryTypeIconType = {
    style?: StyleProp<ViewStyle>;
    type: TransactionType | null;
    coinType?: CoinType;
    uri?: string;
    size?: number;
};

const TransactionHistoryTypeIcon: React.FC<TransactionHistoryTypeIconType> = ({
    style,
    type,
    coinType,
    uri,
    size = 32,
}) => {
    const theme = useAppTheme();
    const Icon = useCallback(() => {
        switch (type) {
            case TransactionType.Sent:
                return (
                    <SendSvgIcon
                        color={theme.colors.text_on_surface_text_high}
                    />
                );
            case TransactionType.SmartContractExec:
                return (
                    <CalledContractSvgIcon
                        color={theme.colors.text_on_surface_text_high}
                    />
                );
            case TransactionType.Receive:
                return (
                    <ReceiveSvgIcon
                        color={theme.colors.text_on_surface_text_high}
                    />
                );
            case TransactionType.SendNFT:
                return (
                    <SendSvgIcon
                        color={theme.colors.text_on_surface_text_high}
                    />
                );
            case TransactionType.ReceiveNFT:
                return (
                    <ReceiveSvgIcon
                        color={theme.colors.text_on_surface_text_high}
                    />
                );
            case TransactionType.Swap:
                return <SwapSvgIcon />;
            case TransactionType.All:
                return <LinkSvgIcon />;
            case TransactionType.Coin:
                return <CoinTypeSvgIcon />;
            default:
                return null;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type]);

    const CoinIcon = useCallback(() => {
        switch (coinType) {
            case CoinType.Bitcoin:
                return <BitcoinSvgIcon width={13} height={13} />;

            default:
                return (
                    <AppImage
                        uri={uri}
                        defaultImage={appImages.logo}
                        styleImage={appStyles.iconCircleSize13}
                    />
                );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [coinType]);
    return (
        <View style={[styles.icon, style, { width: size, height: size, borderRadius: size / 4 }]}>
            <Icon />
            {coinType || uri ? (
                <View style={styles.coinIcon}>
                    <CoinIcon />
                </View>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    icon: {
        ...appStyles.center,
        width: 32,
        height: 32,
        borderRadius: 4,
        backgroundColor: appColors.neutral.n100,
    },
    coinIcon: {
        width: 13,
        height: 13,
        position: 'absolute',
        bottom: -5,
        right: -5,
    },
});

export default TransactionHistoryTypeIcon;
