import Slip0044 from '../enum/Slip0044';
import { ChainMoralis } from '../services/Moralis/type';

const convertChainByProtocol = (slip0044: number) => {
    switch (slip0044) {
        case Slip0044.SmartChain:
            return ChainMoralis.bsc;
        case Slip0044.Ethereum:
            return ChainMoralis.eth;
        case Slip0044.Polygon:
            return ChainMoralis.polygon;
        default:
            return undefined;
    }
};
const compareAddressesEVM = (address1?: string, address2?: string) => {
    if (!address1 || !address2) {
        return false;
    }
    return address1.toLowerCase() === address2.toLowerCase();
};
export { compareAddressesEVM, convertChainByProtocol };
