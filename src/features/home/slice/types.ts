import SelectTokenAction from 'src/core/enum/SelectTokenAction';
import {
    GetBalanceTokensParams,
    TokensGetPrice,
} from 'src/core/services/Moralis/type';
import { ListCryptoDataType } from '../home.type';

export type HomeSliceType = {
    selectTokenAction?: SelectTokenAction;
    listCryptoData: ListCryptoDataType[];
    selectedCryptoDataId?: string;
};

export type ErrorResponse = {
    message?: string;
    statusCode?: number;
    stackTrace?: string;
    errorCode?: string;
};
export type GetBalanceTokenParamsThunk = {
    walletAddress: string;
    params: GetBalanceTokensParams;
};
export type GetBalanceNativeParamsThunk = GetBalanceTokenParamsThunk & {
    contractAddress: string;
};
export type GetPriceTokenParamsThunk = Pick<
    GetBalanceTokenParamsThunk,
    'params'
> & {
    tokenAddresses: TokensGetPrice[];
};
