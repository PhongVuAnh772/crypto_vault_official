import Utils from './commonUtils';
import { walletKit } from './WalletKitUtil';

export const hexToEther = (hexValue: string, decimal: number) => {
    return Utils.formattedBalanceCurrency(
        +Utils.convertBigIntFollowDecimals(BigInt(hexValue), decimal),
    );
};
export const hexToAscii = (hexValue: string) => {
    if (!hexValue.startsWith('0x')) return '';
    return Buffer.from(hexValue.slice(2), 'hex').toString('utf-8');
};

export const feeAmount = (
    gasFee: string,
    decimal: number,
    maxFeePerGas?: string,
) => {
    const gasFeeNumber = maxFeePerGas
        ? BigInt(gasFee) * BigInt(maxFeePerGas)
        : BigInt(gasFee);
        
    return Utils.formattedBalanceCurrency(
        +Utils.convertBigIntFollowDecimals(gasFeeNumber ?? '', decimal),
    );
};
export const rejectTransaction = async (id: number, topic: string) => {
    await walletKit.respondSessionRequest({
        topic,
        response: {
            id,
            jsonrpc: '2.0',
            error: { code: 5000, message: 'Change wallet error' },
        },
    });
};

const walletConnectUtils = {
    hexToEther,
    hexToAscii,
    feeAmount,
    rejectTransaction,
};

export default walletConnectUtils;
