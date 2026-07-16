import { SendMode } from '@ton/core';
import TonWalletVersion from 'src/core/enum/TonWalletVersion';
import TonConnectUtils from '../TonConnect/TonConnectUntil';
import TonServices from '../TonServices';
import { TonAccountsType } from '../TonServices/type';
import TonWallet from '../TonWallet';
import { CreateTransactionsTonConnectParamType } from './tonTransactions.type';
import TransferUtils from './transferUtils';

class TonConnectTransfer {
    async createTransferTonConnect({
        privateKey,
        estimateFee = false,
        bounce,
        fromAccountData,
        version,
        publicKey,
        param,
        isDummySecretKey,
    }: CreateTransactionsTonConnectParamType) {
        try {
            let secretKey;
            let contract;
            const tonWallet = new TonWallet();
            if (isDummySecretKey) {
                const { dummySecretKey } =
                    await tonWallet.createDummySecretKey();
                secretKey = dummySecretKey;
                contract = await TransferUtils.createContract(
                    version ?? TonWalletVersion.V5,
                    publicKey,
                );
            } else {
                const walletKey = await TransferUtils.initializeWallet(
                    version ?? TonWalletVersion.V5,
                    publicKey,
                    privateKey,
                );
                secretKey = walletKey.secretKey;
                contract = walletKey.contract;
            }

            let finalFromAccountData = fromAccountData;

            if (!finalFromAccountData) {
                const tonServices = new TonServices();
                const getAccountRes = await tonServices.getAccounts({
                    address: contract.address,
                });
                if (getAccountRes.isSuccess) {
                    finalFromAccountData =
                        getAccountRes.data as TonAccountsType;
                } else {
                    console.error('Get account data error');
                    return undefined;
                }
            }
            const internalMessages = await TonConnectUtils.internalMessages(
                finalFromAccountData.address.toString(),
                param,
                bounce,
            );

            if (!secretKey) {
                console.error('secretKey error');
                return undefined;
            }

            const seqno = await TransferUtils.getSeqno({
                currentSeqno: 0,
                finalFromAccountData,
            });
            if (!internalMessages) {
                console.error('internalMessages error', internalMessages);
                return undefined;
            }

            const transferData = await TransferUtils.createExternalTransfer({
                internalMessages,
                secretKey,
                sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
                contract,
                seqno,
            });

            if (!estimateFee) {
                return { transferData: transferData, fee: undefined };
            }

            const balance = Number(finalFromAccountData.balance);

            const fee = await TransferUtils.estimateFee({
                boc: transferData.messageBOCString,
                address: finalFromAccountData.address,
                balance: balance,
            });

            if (!fee) {
                console.error('_estimateFee error', fee);
                return undefined;
            }

            return { transferData, fee };
        } catch (error) {
            console.error('createTransfer error:', error);
            return undefined;
        }
    }
}

export default TonConnectTransfer;
