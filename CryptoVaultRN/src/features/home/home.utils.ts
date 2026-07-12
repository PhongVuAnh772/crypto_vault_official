import Slip0044 from 'src/core/enum/Slip0044';
import { ProtocolDataFromBEType } from 'src/core/redux/slice/account.type';
import { IBitcoinDataRes } from 'src/core/services/BitcoinServices/type';
import BitcoinUtils from 'src/core/utils/bitcoinUtils';
import Utils from 'src/core/utils/commonUtils';
import TonUtils from 'src/core/utils/tonUtils';

const handleBitcoinBalance = <T>(fetchDataCryptoRes: T) => {
    const newData = fetchDataCryptoRes as IBitcoinDataRes | undefined;
    const bitcoinAmount = BitcoinUtils.getBitcoinFromSatoshi(
        newData?.final_balance ?? 0,
    );
    const finalBalance = parseFloat(bitcoinAmount);
    return finalBalance;
};

const handleTonBalance = <T>(
    fetchDataCryptoRes: T,
    protocolData?: ProtocolDataFromBEType,
) => {
    const balance = fetchDataCryptoRes as BigInt | undefined;
    const tonBalance = TonUtils.formatBigNumber(
        balance?.toString() ?? '',
        protocolData?.nativeToken?.decimal ?? 9,
    );
    return Utils.truncateToSixDecimals(tonBalance);
};

const getBalance = <T>(
    fetchDataCryptoRes: T,
    protocolData?: ProtocolDataFromBEType,
): number => {
    switch (protocolData?.slip0044) {
        case Slip0044.Bitcoin:
            return handleBitcoinBalance(fetchDataCryptoRes);
        case Slip0044.Ton:
            return handleTonBalance(fetchDataCryptoRes);
        case Slip0044.Ethereum:
            return 0;
        default:
            return 0;
    }
};

const HomeUtils = { getBalance };

export default HomeUtils;
