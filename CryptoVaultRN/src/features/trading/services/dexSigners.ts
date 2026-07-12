import { ethers } from 'ethers';
import { Buffer } from 'buffer';

type UnsignedTx = {
  to?: string;
  data?: string;
  value?: string;
  gasLimit?: string | number | null;
  maxFeePerGas?: string | number | null;
  maxPriorityFeePerGas?: string | number | null;
  nonce?: number | null;
};

type EmbeddedSignerArgs = {
  privateKey: string;
  rpcUrl: string;
  chainId: number;
  fromAddress: string;
};

const normalizePrivateKey = (privateKey: string): string => {
  if (privateKey.startsWith('0x')) return privateKey;
  if (privateKey.length === 64) return `0x${privateKey}`;
  const buf = Buffer.from(privateKey, 'base64');
  return `0x${buf.toString('hex')}`;
};

export const createEmbeddedEvmSigner = ({
  privateKey,
  rpcUrl,
  chainId,
  fromAddress,
}: EmbeddedSignerArgs) => {
  const normalizedPk = normalizePrivateKey(privateKey);
  const provider = new ethers.JsonRpcProvider(rpcUrl, chainId);
  const wallet = new ethers.Wallet(normalizedPk, provider);

  return async (unsignedTx: UnsignedTx): Promise<string> => {
    if (!unsignedTx.to) throw new Error('unsignedTx.to is required for embedded signer');

    const [networkNonce, feeData] = await Promise.all([
      provider.getTransactionCount(fromAddress, 'pending'),
      provider.getFeeData(),
    ]);

    const txRequest: ethers.TransactionRequest = {
      to: unsignedTx.to,
      data: unsignedTx.data || '0x',
      value: BigInt(unsignedTx.value || '0'),
      chainId,
      nonce: unsignedTx.nonce ?? networkNonce,
      gasLimit: unsignedTx.gasLimit != null ? BigInt(unsignedTx.gasLimit) : BigInt(400000),
      maxFeePerGas:
        unsignedTx.maxFeePerGas != null
          ? BigInt(unsignedTx.maxFeePerGas)
          : (feeData.maxFeePerGas ?? BigInt(30_000_000_000)),
      maxPriorityFeePerGas:
        unsignedTx.maxPriorityFeePerGas != null
          ? BigInt(unsignedTx.maxPriorityFeePerGas)
          : (feeData.maxPriorityFeePerGas ?? BigInt(2_000_000_000)),
      type: 2,
    };

    return wallet.signTransaction(txRequest);
  };
};

type WalletConnectRequest = (method: string, params: unknown[]) => Promise<unknown>;

export const createWalletConnectEvmSigner = ({
  fromAddress,
  walletConnectRequest,
}: {
  fromAddress: string;
  walletConnectRequest: WalletConnectRequest;
}) => {
  return async (unsignedTx: UnsignedTx): Promise<string> => {
    const result = await walletConnectRequest('eth_signTransaction', [
      {
        from: fromAddress,
        to: unsignedTx.to,
        data: unsignedTx.data || '0x',
        value: unsignedTx.value || '0x0',
        gas: unsignedTx.gasLimit || undefined,
        maxFeePerGas: unsignedTx.maxFeePerGas || undefined,
        maxPriorityFeePerGas: unsignedTx.maxPriorityFeePerGas || undefined,
        nonce: unsignedTx.nonce ?? undefined,
      },
    ]);
    if (typeof result !== 'string') {
      throw new Error('WalletConnect signer did not return signed transaction');
    }
    return result;
  };
};
