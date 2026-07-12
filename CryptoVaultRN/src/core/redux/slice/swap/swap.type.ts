import { CurrencyChangeNow } from 'src/core/services/ChangeNow/types';

export type SwapSlice = {
    listPairAvailable: CurrencyChangeNow[];
    images: Record<string, string>;
    pinCode: string;
    isShowPinCode: boolean;
    isShowFunction: boolean;
};
