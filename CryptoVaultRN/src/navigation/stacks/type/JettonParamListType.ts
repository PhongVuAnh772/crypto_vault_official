import { BalanceItem } from 'src/core/services/TonServices/type';
import { ListCryptoDataType } from 'src/features/home/home.type';

export type JettonParamListType = {
    jettonData?: BalanceItem;
    cryptoData?: ListCryptoDataType;
};
