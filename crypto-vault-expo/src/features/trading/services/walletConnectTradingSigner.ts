import { walletKit } from 'src/core/utils/WalletKitUtil';

type UnsignedTx = {
  to?: string;
  data?: string;
  value?: string;
  gasLimit?: string | number | null;
  maxFeePerGas?: string | number | null;
  maxPriorityFeePerGas?: string | number | null;
  nonce?: number | null;
};

type WalletConnectSession = {
  topic: string;
  namespaces?: Record<string, { accounts?: string[] }>;
};

const toHex = (value?: string | number | null) => {
  if (value == null) return undefined;
  if (typeof value === 'string' && value.startsWith('0x')) return value;
  const bigintValue = BigInt(value);
  return `0x${bigintValue.toString(16)}`;
};

const hasAddressInSession = (session: WalletConnectSession, chainId: number, address: string) => {
  const expected = `eip155:${chainId}:${address.toLowerCase()}`;
  const namespaces = Object.values(session.namespaces || {});
  return namespaces.some((namespace) =>
    (namespace.accounts || []).some((account) => account.toLowerCase() === expected),
  );
};

export const findActiveWalletConnectSession = (
  chainId: number,
  address: string,
): WalletConnectSession | null => {
  try {
    const sessions: WalletConnectSession[] =
      walletKit?.engine?.signClient?.session?.getAll?.() || [];
    return sessions.find((session) => hasAddressInSession(session, chainId, address)) || null;
  } catch (error) {
    return null;
  }
};

export const createWalletConnectSessionSigner = ({
  chainId,
  fromAddress,
}: {
  chainId: number;
  fromAddress: string;
}) => {
  const session = findActiveWalletConnectSession(chainId, fromAddress);
  if (!session) {
    throw new Error('Không có WalletConnect session phù hợp cho ví hiện tại');
  }

  return async (unsignedTx: UnsignedTx): Promise<string> => {
    const request = {
      method: 'eth_signTransaction',
      params: [
        {
          from: fromAddress,
          to: unsignedTx.to,
          data: unsignedTx.data || '0x',
          value: toHex(unsignedTx.value || '0') || '0x0',
          gas: toHex(unsignedTx.gasLimit),
          maxFeePerGas: toHex(unsignedTx.maxFeePerGas),
          maxPriorityFeePerGas: toHex(unsignedTx.maxPriorityFeePerGas),
          nonce: toHex(unsignedTx.nonce),
        },
      ],
    };

    const chainNamespace = `eip155:${chainId}`;
    const signed = await walletKit.engine.signClient.request({
      topic: session.topic,
      chainId: chainNamespace,
      request,
    });

    if (typeof signed !== 'string' || !signed.startsWith('0x')) {
      throw new Error('WalletConnect trả về chữ ký giao dịch không hợp lệ');
    }
    return signed;
  };
};

