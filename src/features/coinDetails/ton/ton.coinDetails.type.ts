import { AddressListItemType } from 'src/core/redux/slice/account.type';
import {
    JettonBalanceDataType,
    TonEvent,
} from 'src/core/services/TonServices/type';

export type TonSliceType = {
    balance?: number;
    isTonDataLoading: boolean;
    isJettonDataLoading: boolean;
    tonEvents?: TonEvent[];
    beforeLt?: number;
    isGetEventsLoading: boolean;
    maxTonEventList?: boolean;
    getEventsErrorLimit?: boolean;
    jettonData?: JettonBalanceDataType;
    minFeeForJettonTransfer?: number;
};

export type GetTonEventsParams = {
    tonAddressData: AddressListItemType | undefined;
    isRefreshAction?: boolean;
    currentBeforeLt?: number;
    isJetton?: boolean;
    jettonId?: string;
    isAllEvents?: boolean;
};

export type PriceledgerifyResponse = {
    price: number;
};
