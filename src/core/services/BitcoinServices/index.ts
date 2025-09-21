import EnvConfig from 'src/core/constants/EnvConfig';
import {sendGet, sendPost} from 'src/core/network/requests';
import {
    BitcoinErrorType,
    IBitcoinDataRes,
    IBitcoinFullDataRes,
    IPushBitcoinTransaction,
} from './type';

class BitcoinServices {
    getBitcoinData = async (bitcoinAddress: string) => {
        const getBitcoinDataRes = await sendGet<IBitcoinDataRes>({
            // customBaseUrl: `${EnvConfig.BLOCK_CYPHER_BTC_DATA_ULR}${bitcoinAddress}?token=${EnvConfig.BLOCK_CYPHER_TOKEN}`,
            customBaseUrl: `${EnvConfig.BLOCK_CYPHER_BTC_DATA_ULR}${bitcoinAddress}`,
        });

        return getBitcoinDataRes;
    };

    getBitcoinFullData = async (bitcoinAddress: string) => {
        const getBitcoinDataRes = await sendGet<IBitcoinFullDataRes>({
            customBaseUrl: `${EnvConfig.BLOCK_CYPHER_BTC_DATA_ULR}${bitcoinAddress}/full`,
            params: {
                token: EnvConfig.BLOCK_CYPHER_TOKEN,
                limit: 50, // Max 50
            },
        });

        return getBitcoinDataRes;
    };

    pushBitcoinTransactionAction = async (tx: string) => {
        const getNetworkFeeRes = await sendPost<
            IPushBitcoinTransaction | BitcoinErrorType
        >({
            customBaseUrl: EnvConfig.BLOCK_CYPHER_PUSH_TRANSACTION_ULR,
            body: {tx: tx},
        });

        return getNetworkFeeRes;
    };
}

export default BitcoinServices;
