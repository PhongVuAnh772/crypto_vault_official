import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';

import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { ethers } from 'ethers';
import { t } from 'i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import AppToastType from 'src/core/enum/AppToastType';
import Slip0044 from 'src/core/enum/Slip0044';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import {
    useCurrentWallet,
    useProtocolSelected,
} from 'src/core/redux/slice/account.selector';
import {
    changeAccount,
    changWallet,
    getAccountId,
    getAllAccount,
    getProtocolDataLists,
    getSelectedProtocolId,
    setSelectedProtocol,
} from 'src/core/redux/slice/account.slice';
import { ProtocolDataWithSupportedTokensFormBEType } from 'src/core/redux/slice/account.type';
import Web3Service from 'src/core/services/Web3';
import { getIdAccountWithChainIdAndAddress } from 'src/core/utils/accountUtils';
import Utils from 'src/core/utils/commonUtils';
import { compareAddressesEVM } from 'src/core/utils/evmUtils';
import { rejectTransaction } from 'src/core/utils/walletConnectUtils';
import { walletKit } from 'src/core/utils/WalletKitUtil';
import { clearBitcoinTransactionData } from 'src/features/coinDetails/bitcoin/bitcoin.coinDetails.slice';
import {
    setMaxTonEventList,
    setTonEvents,
} from 'src/features/coinDetails/ton/ton.coinDetails.slice';
import { getIsTestnet } from 'src/core/redux/slice/app.selector';
import { getRequestEvent, setModalConnect } from '../slice/walletConnect.slice';
import { SignTypedData } from './sessionSingTypeData.type';

const TESTNET_CHAIN_IDS = new Set([5, 97, 80001, 11155111, 421614, 84532, 43113]);
const MAINNET_CHAIN_IDS = new Set([1, 56, 137, 10, 42161, 8453, 43114]);

const detectChainIsTestnet = (walletConnectChain?: string): boolean | undefined => {
    if (!walletConnectChain) return undefined;
    const idPart = walletConnectChain.includes(':')
        ? walletConnectChain.split(':')[1]
        : walletConnectChain;
    const chainId = Number(idPart);
    if (Number.isNaN(chainId)) return undefined;
    if (TESTNET_CHAIN_IDS.has(chainId)) return true;
    if (MAINNET_CHAIN_IDS.has(chainId)) return false;
    return undefined;
};

const useSessionSignTypeData = () => {
    const insets = useAppSafeAreaInsets();
    const theme = useAppTheme();
    const dispatch = useAppDispatch();
    const requestEvent = useAppSelector(getRequestEvent);
    const { topic, params, id, verifyContext } = requestEvent!;
    const { request } = params;
    const allAccounts = useAppSelector(getAllAccount);
    const currentProtocol = useProtocolSelected();
    const wallet = useCurrentWallet();
    const bottomSheetSignTypeRef = useRef<BottomSheetModal>(null);
    const [isEnableDismissOnClose, setIsEnableDismissOnClose] = useState(true);
    const [visibleLoading, setVisibleLoading] = useState(false);
    const [requirePinCode, setRequirePinCode] = useState(false);
    const protocolDataLists = useAppSelector(getProtocolDataLists) ?? [];
    const isTestnet = useAppSelector(getIsTestnet);
    const selectedAccountId = useAppSelector(getAccountId);
    const selectedProtocolId = useAppSelector(getSelectedProtocolId);
    const protocolSelected = [
        ...(protocolDataLists.length > 0 ? protocolDataLists : []),
    ]?.find(e => e?._id === selectedProtocolId);
    const onShowModalSignType = () => bottomSheetSignTypeRef.current?.present();
    const onCloseModalSignType = () => bottomSheetSignTypeRef.current?.close();
    const closeRequirePinCode = () => {
        setRequirePinCode(false);
        onReject();
    };
    const closeModalSignType = () => {
        dispatch(setModalConnect(false));
    };
    const protocolRequire = protocolDataLists.find(
        item => item.walletConnectSupportedChain === params.chainId,
    );
    const switchProtocol = () => {
        if (protocolSelected?._id !== protocolRequire?._id) {
            handlePressProtocol(protocolRequire!);
        }
    };
    const handlePressProtocol = (
        data: ProtocolDataWithSupportedTokensFormBEType,
    ) => {
        switch (protocolSelected?.slip0044) {
            case Slip0044.Bitcoin:
                dispatch(clearBitcoinTransactionData());
                break;
            case Slip0044.Ton:
                dispatch(setTonEvents(undefined));
                dispatch(setMaxTonEventList(false));
                break;
            default:
                break;
        }
        dispatch(setSelectedProtocol(data._id));
    };
    const initWeb3 = () => {
        const urpUrl = currentProtocol?.rpcUrl ?? '';
        return new Web3Service({
            urpUrl,
        });
    };
    const web3 = initWeb3();
    const parsedParams = JSON.parse(
        requestEvent?.params.request.params[1],
    ) as SignTypedData;
    const signTypedDataRequest = request.params[0] as string;
    const onApprove = useCallback(
        async (pinCode: string) => {
            if (requestEvent) {
                try {
                    setVisibleLoading(true);
                    setRequirePinCode(false);
                    const key = await web3.getPrivateKeyAndNonceAddress(
                        pinCode,
                        wallet?.path!,
                        currentProtocol?.slip0044!,
                    );
                    const signer = new ethers.Wallet(key?.privateKey ?? '');
                    delete parsedParams.types.EIP712Domain;
                    const signature = await signer.signTypedData(
                        parsedParams.domain,
                        parsedParams.types,
                        parsedParams.message,
                    );

                    const response = { id, result: signature, jsonrpc: '2.0' };

                    await walletKit.respondSessionRequest({
                        topic,
                        response,
                    });
                    closeModalSignType();
                } catch (e) {
                    console.log((e as Error).message, 'error');
                    await rejectTransaction(id, topic);
                    closeModalSignType();

                    return;
                }
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [requestEvent, topic],
    );
    const onReject = useCallback(async () => {
        if (requestEvent) {
            try {
                const response = {
                    id,
                    jsonrpc: '2.0',
                    error: {
                        code: 5000,
                        message: 'User rejected.',
                    },
                };
                await walletKit.respondSessionRequest({
                    topic,
                    response,
                });
                closeModalSignType();
            } catch (e) {
                console.log((e as Error).message, 'error');
                closeModalSignType();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requestEvent, topic]);
    const openRequirePinCode = () => {
        setIsEnableDismissOnClose(false);
        onCloseModalSignType();
        setRequirePinCode(true);
    };
    const accountRequest = getIdAccountWithChainIdAndAddress({
        addressRequest: signTypedDataRequest,
        chaiId: params.chainId,
        protocolListData: protocolDataLists,
        allCount: allAccounts,
    });
    const [validateAccount, setValidateAccount] = useState(
        accountRequest?.id !== selectedAccountId,
    );
    const walletRequest = async () => {
        const chainIsTestnet = detectChainIsTestnet(params.chainId);
        const isWrongNetworkByChainId =
            chainIsTestnet !== undefined && chainIsTestnet !== !!isTestnet;
        const isWrongNetworkByProtocol =
            protocolRequire?.isTestnet !== undefined &&
            !!protocolRequire.isTestnet !== !!isTestnet;

        if (isWrongNetworkByChainId || isWrongNetworkByProtocol) {
            Utils.showToast({
                type: AppToastType.error,
                msg: 'WalletConnect request is not in current Testnet/Mainnet mode',
            });
            await rejectTransaction(id, topic);
            closeModalSignType();
            return;
        }
        const walletDataProtocol = accountRequest?.protocolData.find(
            item => item._id === protocolSelected?._id,
        );
        if (wallet?.address !== signTypedDataRequest) {
            const addressRequest = walletDataProtocol?.addressList.find(item =>
                compareAddressesEVM(item.address, signTypedDataRequest),
            );
            if (addressRequest?.id) {
                await dispatch(changWallet(addressRequest?.id));
            }
        }
        onShowModalSignType();
    };
    const accountChange = async () => {
        if (accountRequest) {
            setTimeout(async () => {
                const res = await dispatch(changeAccount(accountRequest));

                if (changeAccount.fulfilled.match(res)) {
                    Utils.showToast({
                        msg: t(LanguageKey.common_switch_to_name_successfully, {
                            name: accountRequest.name,
                        }),
                        type: AppToastType.success,
                    });
                    console.log(accountRequest, 'accountRequest');

                    const payload = res.payload;
                    if (!payload) {
                        Utils.showToast({
                            type: AppToastType.error,
                            msg: 'Change wallet error',
                        });
                        await rejectTransaction(id, topic);
                    }

                    setValidateAccount(false);
                } else {
                    Utils.showToast({
                        type: AppToastType.error,
                        msg: 'Change wallet error',
                    });
                    await rejectTransaction(id, topic);
                }
            }, 500);
        }
    };
    useEffect(() => {
        if (!protocolRequire) {
            Utils.showToast({
                type: AppToastType.error,
                msg: 'Unsupported WalletConnect chain',
            });
            rejectTransaction(id, topic);
            closeModalSignType();
            return;
        }
        switchProtocol();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        if (!validateAccount) {
            walletRequest();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [validateAccount]);

    return {
        theme,
        verifyContext,
        bottomSheetSignTypeRef,
        isEnableDismissOnClose,
        currentProtocol,
        request,
        insets,
        data: parsedParams,
        visibleLoading,
        requirePinCode,
        validateAccount,
        wallet,
        onApprove,
        onReject,
        openRequirePinCode,
        closeRequirePinCode,
        accountChange
    };
};

export default useSessionSignTypeData;
