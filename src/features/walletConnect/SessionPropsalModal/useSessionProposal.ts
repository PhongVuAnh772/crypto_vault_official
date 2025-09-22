import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AppToastType from 'src/core/enum/AppToastType';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
    useAccount,
    useCurrentWallet,
} from 'src/core/redux/slice/account.selector';
import { getProtocolDataLists } from 'src/core/redux/slice/account.slice';
import Utils from 'src/core/utils/commonUtils';
import { walletKit } from 'src/core/utils/WalletKitUtil';
import { getSupportedChains, supportedNamespaces } from '../index.component';
import {
    getProposal,
    setModalConnect,
    setProposal,
} from '../slice/walletConnect.slice';
import { OptionalNamespacesType } from './sessionProposal.type';
const useSessionProposal = () => {
    const theme = useAppTheme()
    const dispatch = useAppDispatch();
    const protocolDataLists = useAppSelector(getProtocolDataLists) ?? [];
    const currentAccount = useAccount();
    const proposal = useAppSelector(getProposal);
    const wallet = useCurrentWallet();
    const insets = useAppSafeAreaInsets();
    const bottomSheetConnectRef = useRef<BottomSheetModal>(null);
    const [isEnableDismissOnClose, setIsEnableDismissOnClose] = useState(true);
    const [visibleLoading, setVisibleLoading] = useState(false);
    const onShowModalConnect = () => bottomSheetConnectRef.current?.present();
    const onCloseModalConnect = () => bottomSheetConnectRef.current?.close();
    const supportedName = getSupportedChains(
        proposal?.params.optionalNamespaces,
        protocolDataLists,
        currentAccount!,
        wallet?.address!,
    ) as OptionalNamespacesType;
    const closeModalConnect = () => {
        dispatch(setModalConnect(false));
        dispatch(setProposal(undefined));
        onCloseModalConnect();
    };

    const SupportNamespace = useMemo(() => {
        if (proposal && currentAccount) {
            return supportedNamespaces(supportedName, wallet?.address!);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [proposal]);

    const onApprove = useCallback(async () => {
        if (proposal && SupportNamespace) {
            setVisibleLoading(true);
            try {
                setIsEnableDismissOnClose(false);
                const namespaces = buildApprovedNamespaces({
                    proposal: proposal.params,
                    supportedNamespaces: SupportNamespace,
                });

                await walletKit.approveSession({
                    id: proposal.id,
                    namespaces,
                });
                closeModalConnect();
            } catch (error) {
                console.log(error);
                closeModalConnect();
            }
            setVisibleLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [proposal]);

    const onReject = useCallback(
        async (msg: boolean) => {
            if (proposal) {
                try {
                    await walletKit.rejectSession({
                        id: proposal.id,
                        reason: getSdkError(
                            msg ? 'UNSUPPORTED_CHAINS' : 'USER_REJECTED_EVENTS',
                        ),
                    });
                    closeModalConnect();
                } catch (e) {
                    console.log((e as Error).message, 'error');

                    return closeModalConnect();
                }
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [proposal],
    );
    useEffect(() => {
        onShowModalConnect();
        if (supportedName.chains) {
            if (supportedName.chains.flat().length === 0) {
                onReject(true);
                Utils.showToast({
                    type: AppToastType.error,
                    msg: 'REDX does not support required dApp protocol',
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [supportedName.chains]);

    return {
        bottomSheetConnectRef,
        isEnableDismissOnClose,
        visibleLoading,
        theme,
        proposal,
        protocolDataLists,
        currentAccount,
        supportedName,
        wallet,
        insets,
        onApprove,
        onReject,
    };
};

export default useSessionProposal;
