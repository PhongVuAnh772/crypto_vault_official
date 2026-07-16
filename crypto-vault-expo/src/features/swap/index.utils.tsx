import React from 'react';
import appColors from 'src/core/constants/AppColors';
import {
    PendingSvgIcon,
    SuccessSvgIcon,
    WarnTransactionSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import { NetworkType } from 'src/core/enum/ChangeNow';
import { WalletCoreCoinType } from 'src/core/enum/CoinType';
import LanguageKey from 'src/core/locales/LanguageKey';
import { ProtocolDataWithSupportedTokensFormBEType } from 'src/core/redux/slice/account.type';
import { SwapHistory, SwapStatus } from 'src/core/services/ChangeNow/types';
import Utils from 'src/core/utils/commonUtils';

export const getTextByStatus = (status: SwapStatus) => {
    switch (status) {
        case SwapStatus.WAITING:
            return LanguageKey.swap_status_waiting;
        case SwapStatus.FAILED:
            return LanguageKey.swap_status_failed;
        case SwapStatus.FINISHED:
            return LanguageKey.swap_status_finished;
        case SwapStatus.REFUNDED:
            return LanguageKey.swap_status_refunded;
        case SwapStatus.CONFIRMING:
            return LanguageKey.swap_status_confirming;
        case SwapStatus.EXCHANGING:
            return LanguageKey.swap_status_exchanging;
        case SwapStatus.SENDING:
            return LanguageKey.swap_status_sending;
        case SwapStatus.VERIFYING:
            return LanguageKey.swap_status_verifying;
        default:
            return '';
    }
};
export const getSymbol = (status: SwapStatus, item: SwapHistory) => {
    switch (status) {
        case SwapStatus.REFUNDED:
            return item.payin.marketTicker.toUpperCase();
        default:
            return item.payout.marketTicker.toUpperCase();
    }
};

export const getAmount = (
    status: SwapStatus,
    item: SwapHistory,
    withSign = true,
) => {
    let amount = 0;

    if (status === SwapStatus.REFUNDED || status === SwapStatus.FAILED) {
        amount = item.payin.amount || 0;
    } else if (status === SwapStatus.FINISHED) {
        amount = item.payout.amount || 0;
    } else {
        amount = item.payout.expectedAmount;
    }

    const formattedAmount = Utils.formatAmountSend(amount);
    return withSign
        ? `${status === SwapStatus.FAILED ? '-' : '+'}${formattedAmount}`
        : formattedAmount;
};
export const getBackgroundColorByStatus = (status: SwapStatus) => {
    switch (status) {
        case SwapStatus.WAITING:
            return appColors.other.status_pending;
        case SwapStatus.FAILED:
            return appColors.light.red;
        case SwapStatus.FINISHED:
            return appColors.light.green;
        case SwapStatus.REFUNDED:
            return appColors.other.outline_lightest;
        default:
            return appColors.other.status_pending;
    }
};

export const getTextColorByStatus = (status: SwapStatus) => {
    switch (status) {
        case SwapStatus.WAITING:
            return appColors.functional.yellow;
        case SwapStatus.FAILED:
            return appColors.functional.warning;
        case SwapStatus.FINISHED:
            return appColors.functional.green;
        case SwapStatus.REFUNDED:
            return appColors.neutral.n600;
        default:
            return appColors.functional.yellow;
    }
};

export const getAmountColorByStatus = (status: SwapStatus) => {
    switch (status) {
        case SwapStatus.WAITING:
            return appColors.functional.yellow;
        case SwapStatus.FAILED:
            return appColors.functional.warning;
        case SwapStatus.FINISHED:
            return appColors.functional.green;
        case SwapStatus.REFUNDED:
            return appColors.functional.green;
        default:
            return appColors.functional.yellow;
    }
};

export const getIconSwapHistoryDetail = (status: SwapStatus) => {
    switch (status) {
        case SwapStatus.FINISHED:
            return <SuccessSvgIcon color={appColors.functional.green} />;
        case SwapStatus.REFUNDED:
            return <SuccessSvgIcon color={appColors.neutral.n500} />;
        case SwapStatus.FAILED:
            return (
                <WarnTransactionSvgIcon
                    color={appColors.functional.warning}
                    width={60}
                    height={60}
                />
            );
        default:
            return <PendingSvgIcon color={appColors.functional.pending} />;
    }
};

export const getBackgroundColorSwapHistoryDetail = (status: SwapStatus) => {
    switch (status) {
        case SwapStatus.FINISHED:
            return appColors.functional.green;
        case SwapStatus.REFUNDED:
            return appColors.neutral.n200;
        case SwapStatus.FAILED:
            return appColors.functional.warning;
        default:
            return appColors.functional.pending;
    }
};

export const getTextColorStyleSwapHistoryDetail = (status: SwapStatus) => {
    switch (status) {
        case SwapStatus.REFUNDED:
            return appColors.neutral.n500;
        default:
            return appColors.neutral.white;
    }
};

const SUPPORTED_SLIP0044_TO_NETWORK: Record<number, NetworkType> = {
    [WalletCoreCoinType.ton]: NetworkType.TON,
    [WalletCoreCoinType.polygon]: NetworkType.MATIC,
    [WalletCoreCoinType.smartChain]: NetworkType.BSC,
    [WalletCoreCoinType.ethereum]: NetworkType.ETH,
    [WalletCoreCoinType.bitcoin]: NetworkType.BTC,
};

const SUPPORTED_NETWORK_TO_SLIP0044: Record<NetworkType, number> =
    Object.entries(SUPPORTED_SLIP0044_TO_NETWORK).reduce(
        (acc, [slip0044, network]) => {
            acc[network as NetworkType] = Number(slip0044);
            return acc;
        },
        {} as Record<NetworkType, number>,
    );
export const getSupportedProtocols = (
    data: ProtocolDataWithSupportedTokensFormBEType[] = [],
) => {
    return data.filter(
        item => SUPPORTED_SLIP0044_TO_NETWORK[item.slip0044] !== undefined,
    );
};

export const getNetworkBySlip0044 = (slip0044: number): NetworkType | null => {
    return SUPPORTED_SLIP0044_TO_NETWORK[slip0044] ?? null;
};

export const getSlip0044ByNetwork = (network: NetworkType): number | null => {
    return SUPPORTED_NETWORK_TO_SLIP0044[network] ?? null;
};
