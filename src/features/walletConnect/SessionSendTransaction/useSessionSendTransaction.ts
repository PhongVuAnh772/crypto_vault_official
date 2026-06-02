import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { t } from 'i18next';
import { useCallback, useEffect, useRef, useState } from 'react';

import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';

import AppToastType from 'src/core/enum/AppToastType';
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
import { getRequestEvent, setModalConnect } from '../slice/walletConnect.slice';

import Web3Service from 'src/core/services/Web3';
import { getIdAccountWithChainIdAndAddress } from 'src/core/utils/accountUtils';
import Utils from 'src/core/utils/commonUtils';
import { rejectTransaction } from 'src/core/utils/walletConnectUtils';
import { walletKit } from 'src/core/utils/WalletKitUtil';

import Slip0044 from 'src/core/enum/Slip0044';
import { ProtocolDataWithSupportedTokensFormBEType } from 'src/core/redux/slice/account.type';
import { compareAddressesEVM } from 'src/core/utils/evmUtils';
import { clearBitcoinTransactionData } from 'src/features/coinDetails/bitcoin/bitcoin.coinDetails.slice';
import {
    setMaxTonEventList,
    setTonEvents,
} from 'src/features/coinDetails/ton/ton.coinDetails.slice';
import { getIsTestnet } from 'src/core/redux/slice/app.selector';
import { SendTransactionParamsType } from '../SessionPropsalModal/sessionProposal.type';

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

const useSessionSendTransaction = () => {
    const dispatch = useAppDispatch();
    const theme = useAppTheme();
    const insets = useAppSafeAreaInsets();
    const protocolDataLists = useAppSelector(getProtocolDataLists) ?? [];
    const allAccounts = useAppSelector(getAllAccount);
    const selectedAccountId = useAppSelector(getAccountId);
    const requestEvent = useAppSelector(getRequestEvent);
    const { topic, params, id, verifyContext } = requestEvent!;
    const { request } = params;
    const selectedProtocolId = useAppSelector(getSelectedProtocolId);
    const isTestnet = useAppSelector(getIsTestnet);
    const protocolSelected = [
        ...(protocolDataLists.length > 0 ? protocolDataLists : []),
    ]?.find(e => e?._id === selectedProtocolId);
    const wallet = useCurrentWallet();
    const currentProtocol = useProtocolSelected();

    const initWeb3 = () =>
        new Web3Service({ urpUrl: currentProtocol?.rpcUrl ?? '' });
    const web3 = initWeb3();

    const protocolRequire = protocolDataLists.find(
        item => item.walletConnectSupportedChain === params.chainId,
    );
    const switchProtocol = () => {
        if (protocolSelected?._id !== protocolRequire?._id) {
            handlePressProtocol(protocolRequire!);
        }
    };
    const [requirePinCode, setRequirePinCode] = useState(false);
    const closeRequirePinCode = () => setRequirePinCode(false);

    const dataSendTransaction = request.params[0] as SendTransactionParamsType;
    const bottomSheetTransactionRef = useRef<BottomSheetModal>(null);

    const [visibleLoading, setVisibleLoading] = useState(false);
    const [isEnableDismissOnClose, setIsEnableDismissOnClose] = useState(true);

    const onShowModalConnect = () =>
        bottomSheetTransactionRef.current?.present();
    const onCloseModalConnect = () =>
        bottomSheetTransactionRef.current?.close();
    const closeModalConnect = () => {
        dispatch(setModalConnect(false));
        onCloseModalConnect();
    };
    const openRequirePinCode = () => {
        setIsEnableDismissOnClose(false);
        onCloseModalConnect();
        setRequirePinCode(true);
    };

    const onApprove = useCallback(
        async (pinCode: string) => {
            if (requestEvent && topic) {
                setRequirePinCode(false);
                setVisibleLoading(true);
                try {
                    const signedMessage = await web3.sendTransaction(
                        request.params[0],
                        pinCode,
                        wallet?.path!,
                        currentProtocol?.slip0044!,
                    );

                    const response = {
                        id,
                        result: signedMessage,
                        jsonrpc: '2.0',
                    };
                    await walletKit.respondSessionRequest({ topic, response });
                } catch (e) {
                    console.log((e as Error).message, 'error');
                    await rejectTransaction(id, topic);
                }
                setVisibleLoading(false);
                closeModalConnect();
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [requestEvent, topic],
    );
    const onReject = useCallback(async () => {
        if (requestEvent) {
            try {
                await rejectTransaction(id, topic);
            } catch (e) {
                console.log((e as Error).message, 'error');
            }
            closeModalConnect();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requestEvent, topic]);
    const accountRequest = getIdAccountWithChainIdAndAddress({
        addressRequest: dataSendTransaction.from,
        chaiId: params.chainId,
        protocolListData: protocolDataLists,
        allCount: allAccounts,
    });
    const [validateAccount, setValidateAccount] = useState(
        accountRequest?.id !== selectedAccountId,
    );
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
            closeModalConnect();
            return;
        }
        const walletDataProtocol = accountRequest?.protocolData.find(
            item => item._id === protocolSelected?._id,
        );
        if (wallet?.address !== dataSendTransaction.from) {
            const addressRequest = walletDataProtocol?.addressList.find(item =>
                compareAddressesEVM(item.address, dataSendTransaction.from),
            );
            if (addressRequest?.id) {
                await dispatch(changWallet(addressRequest?.id));
            }
        }
        onShowModalConnect();

    };
    useEffect(() => {
        if (!protocolRequire) {
            Utils.showToast({
                type: AppToastType.error,
                msg: 'Unsupported WalletConnect chain',
            });
            rejectTransaction(id, topic);
            closeModalConnect();
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
        insets,
        netWork: protocolSelected,
        wallet,
        verifyContext,
        request,
        dataSendTransaction,
        validateAccount,
        bottomSheetTransactionRef,
        isEnableDismissOnClose,
        visibleLoading,
        requirePinCode,
        closeRequirePinCode,
        openRequirePinCode,
        onApprove,
        onReject,
        accountChange,
    };
};

export default useSessionSendTransaction;
