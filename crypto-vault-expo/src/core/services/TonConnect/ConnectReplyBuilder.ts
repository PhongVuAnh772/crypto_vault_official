import { Address } from '@ton/core';
import {
    CHAIN,
    ConnectItem,
    ConnectItemReply,
    ConnectRequest,
    TonProofItemReply,
} from '@tonconnect/protocol';
import { Buffer } from 'buffer';
import { Int64LE } from 'int64-buffer';
import { getDomainFromUrl } from 'src/core/utils/tonConnect';
import { DAppManifest } from 'src/features/tonConnect/slice/tonConnect.type';
import nacl from 'tweetnacl';
import naclUtils from 'tweetnacl-util';
import { TonConnectKey } from '../../../features/tonConnect/enum/TonConnectKey';
import TonServices from '../TonServices';
const { createHash } = require('react-native-crypto');
export class ConnectReplyBuilder {
    request: ConnectRequest;

    manifest: DAppManifest;

    constructor(request: ConnectRequest, manifest: DAppManifest) {
        this.request = request;
        this.manifest = manifest;
    }

    private async createTonProofItem(
        address: string,
        secretKey: Uint8Array,
        payload: string,
    ): Promise<TonProofItemReply> {
        try {
            const tonWallet = new TonServices();
            const timestamp = await tonWallet.getRawTimeFromLiteserverSafely();
            const timestampBuffer = new Int64LE(timestamp).toBuffer();
            const domain = getDomainFromUrl(this.manifest.url);
            const domainBuffer = Buffer.from(domain ?? '');
            const domainLengthBuffer = Buffer.allocUnsafe(4);
            domainLengthBuffer.writeInt32LE(domainBuffer.byteLength);
            const [workchain, addrHash] = address.split(':');
            const addressWorkchainBuffer = Buffer.allocUnsafe(4);

            addressWorkchainBuffer.writeInt32BE(Number(workchain));

            const addressBuffer = Buffer.concat([
                addressWorkchainBuffer,
                Buffer.from(addrHash, 'hex'),
            ]);

            const messageBuffer = Buffer.concat([
                Buffer.from('ton-proof-item-v2/'),
                addressBuffer,
                domainLengthBuffer,
                domainBuffer,
                timestampBuffer,
                Buffer.from(payload),
            ]);
            const message = createHash('sha256').update(messageBuffer).digest();

            const bufferToSign = Buffer.concat([
                Buffer.from('ffff', 'hex'),
                Buffer.from('ton-connect'),
                message,
            ]);

            const signed = nacl.sign.detached(
                createHash('sha256').update(bufferToSign).digest(),
                secretKey,
            );

            const signature = naclUtils.encodeBase64(signed);

            return {
                name: TonConnectKey.ton_proof,
                proof: {
                    timestamp,
                    domain: {
                        lengthBytes: domainBuffer.byteLength,
                        value: domain ?? '',
                    },
                    signature: signature,
                    payload,
                },
            };
        } catch (e) {
            return {
                name: TonConnectKey.ton_proof,
                error: {
                    code: 0,
                    message: `Wallet internal error: ` + e,
                },
            };
        }
    }

    async createReplyItems(
        addr: string,
        secretKey: Uint8Array,
        publicKey: Uint8Array,
        walletStateInit: string,
        isTestnet: boolean,
    ): Promise<ConnectItemReply[]> {
        const replyItems: ConnectItemReply[] = [];

        for (const item of this.request.items) {
            switch (item.name) {
                case TonConnectKey.ton_addr:
                    replyItems.push({
                        name: TonConnectKey.ton_addr,
                        address: addr,
                        network: isTestnet ? CHAIN.TESTNET : CHAIN.MAINNET,
                        publicKey: Buffer.from(publicKey).toString('hex'),
                        walletStateInit,
                    });
                    break;

                case TonConnectKey.ton_proof:
                    replyItems.push(
                        await this.createTonProofItem(
                            addr,
                            secretKey,
                            item.payload,
                        ),
                    );
                    break;

                default:
                    replyItems.push({
                        name: (item as ConnectItem).name,
                        error: { code: 400 },
                    } as unknown as ConnectItemReply);
            }
        }

        return replyItems;
    }

    static createAutoConnectReplyItems(
        addr: string,
        publicKey: Uint8Array,
        walletStateInit: string,
        isTestNet: boolean,
    ): ConnectItemReply[] {
        const address = Address.parse(addr).toRawString();
        return [
            {
                name: TonConnectKey.ton_addr,
                address,
                network: isTestNet ? CHAIN.TESTNET : CHAIN.MAINNET,
                publicKey: Buffer.from(publicKey).toString('hex'),
                walletStateInit,
            },
        ];
    }
}
