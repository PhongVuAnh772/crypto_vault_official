import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { StackActions } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppToastType from 'src/core/enum/AppToastType';
import VMType from 'src/core/enum/VMType';
import { useLoadMore } from 'src/core/hooks/useLoadMore';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
    getAccountId,
    getAllAccount,
    getProtocolDataLists,
} from 'src/core/redux/slice/account.slice';
import {
    AddressListItemType,
    ProtocolDataWithSupportedTokensFormBEType,
} from 'src/core/redux/slice/account.type';
import {
    getImagePairThunk,
    getImagesPair,
} from 'src/core/redux/slice/swap/swap.slice';
import ChangeNowService from 'src/core/services/ChangeNow';
import { SortType, SwapHistory } from 'src/core/services/ChangeNow/types';
import Utils from 'src/core/utils/commonUtils';
import WalletUtils from 'src/core/utils/walletUtils';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { HistoryViewDetailTransactionProps } from '../historyDetail/historyDetail.type';
import {
    getAmount,
    getNetworkBySlip0044,
    getSupportedProtocols,
} from '../index.utils';

const _limit = 10;

const useSwapHistory = ({ navigation }: RootNavigationType) => {
    const { t } = useTranslation();
    const refModal = useRef<BottomSheetModal>(null);
    const refWalletManagement = useRef<BottomSheetModal>(null);
    const listImage = useAppSelector(getImagesPair);

    const protocolData = useAppSelector(getProtocolDataLists);
    const selectAccountId = useAppSelector(getAccountId);
    const accountLists = useAppSelector(getAllAccount);

    const [currentWalletSelected, setCurrentWalletSelected] =
        useState<AddressListItemType | null>();

    const protocolList = useMemo(
        () => getSupportedProtocols(protocolData),
        [protocolData],
    );

    const [protocolSelected, setProtocolSelected] =
        useState<ProtocolDataWithSupportedTokensFormBEType | null>(() => {
            return protocolList[1] ?? null;
        });

    const onPressProtocol = () => {
        refModal.current?.present();
    };

    const onCloseModalProtocol = () => {
        refModal.current?.close();
    };

    const onShowModalWalletManagement = () => {
        refWalletManagement.current?.present();
    };

    const onCloseModalWalletManagement = () => {
        refWalletManagement.current?.close();
    };

    const onPressProtocolItem = (
        item: ProtocolDataWithSupportedTokensFormBEType,
    ) => {
        onCloseModalProtocol();
        setTimeout(() => {
            setProtocolSelected(item);
            setCurrentWalletSelected(null);
        }, 500);
    };

    const getCurrentAccount = useCallback(() => {
        if (accountLists !== undefined) {
            const accountWallet = [...accountLists].find(
                e => e?.id === selectAccountId,
            );
            return accountWallet;
        }
    }, [accountLists, selectAccountId]);

    const getWalletInformation = useCallback(() => {
        if (!protocolSelected) return;

        const currentAccount = getCurrentAccount();

        if (!currentAccount) {
            return;
        }

        const walletInfo = currentAccount.protocolData?.find(
            item => item._id === protocolSelected._id,
        );

        if (!walletInfo) {
            return;
        }

        const { selectedAddressId, addressList } = walletInfo;

        let finalWalletId = selectedAddressId;

        if (currentWalletSelected) {
            finalWalletId = currentWalletSelected.id;
        }

        const addressWalletInfo = addressList?.find(
            item => item.id === finalWalletId,
        );

        if (!addressWalletInfo) {
            return;
        }

        if (!currentWalletSelected) {
            setCurrentWalletSelected(addressWalletInfo);
        }

        return { wallet: addressWalletInfo };
    }, [protocolSelected, getCurrentAccount, currentWalletSelected]);

    const handleGetSwapHistory = useCallback(
        async (page: number) => {
            try {
                const walletInfo = getWalletInformation();

                if (!walletInfo) {
                    return [];
                }

                const changeNowService = new ChangeNowService();

                const params = {
                    userId: walletInfo.wallet.address,
                    offset: page * _limit,
                    limit: _limit,
                    sortDirection: SortType.descending,
                };
                const response = await changeNowService.getSwapHistory(params);

                return response.exchanges;
            } catch (error) {
                console.log('🚀 ~ useSwapHistory ~ error:', error);
                Utils.showToast({
                    msg: t(LanguageKey.common_text_error_title),
                    type: AppToastType.error,
                });
                return [];
            }
        },
        [getWalletInformation, t],
    );

    const {
        data,
        isLoading,
        loadMore,
        hasMore,
        isRefreshing,
        onRefresh,
        isLoadingMore,
    } = useLoadMore<SwapHistory>({
        fetchData: handleGetSwapHistory,
        initialPage: 0,
        limit: _limit,
    });

    const onPressHistory = (item: SwapHistory) => {
        const data: HistoryViewDetailTransactionProps = {
            rows: [
                {
                    title: LanguageKey.common_text_from,
                    value: `${Utils.formatAmountSend(item.payin.expectedAmount)} ${item.payin.marketTicker.toUpperCase()}`,
                },
                {
                    title: LanguageKey.common_text_to,
                    value: `${Utils.formatAmountSend(+getAmount(item.status, item, false))} ${item.payout.marketTicker.toUpperCase()}`,
                },
                {
                    title: LanguageKey.common_text_from_address,
                    value: WalletUtils.getShortAddress(item.partnerInfo.userId),
                },
                {
                    title: LanguageKey.common_text_to_address,
                    value: WalletUtils.getShortAddress(item.payout.address),
                },
            ],
            status: item.status,
            swapTo: listImage[
                `${item.payout.marketTicker}_${item.payout.network}`
            ],
            swapFrom:
                listImage[`${item.payin.marketTicker}_${item.payin.network}`],
        };
        navigation.dispatch(
            StackActions.push(
                HomeStackScreenKey.TransactionHistorySwapDetail,
                data,
            ),
        );
    };
    const listWalletByType = useMemo((): AddressListItemType[] => {
        if (!protocolSelected) return [];

        const currentAccount = getCurrentAccount();

        if (!currentAccount) return [];

        const walletInfo = currentAccount.protocolData?.find(
            item => item._id === protocolSelected._id,
        );

        if (!walletInfo) return [];

        const { addressList } = walletInfo;

        return addressList;
    }, [getCurrentAccount, protocolSelected]);

    const onSelectWallet = (wallet: AddressListItemType) => {
        onCloseModalWalletManagement();

        if (wallet.id === currentWalletSelected?.id) return;

        setCurrentWalletSelected(wallet);
    };
    const dispatch = useAppDispatch();

    const handleInitData = useCallback(async () => {
        if (Object.values(listImage).length === 0) {
            await dispatch(getImagePairThunk()).unwrap();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        handleInitData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const listHistoryShow = useMemo(() => {
        if (protocolSelected?.VM === VMType.EVM) {
            const network = getNetworkBySlip0044(protocolSelected.slip0044);
            return data.filter(item => item.payin.network === network);
        } else {
            return data;
        }
    }, [data, protocolSelected?.VM, protocolSelected?.slip0044]);

    return {
        data: listHistoryShow,
        isLoading,
        loadMore,
        hasMore,
        isRefreshing,
        onRefresh,
        isLoadingMore,
        onPressProtocol,
        refModal,
        protocolList,
        protocolSelected,
        onCloseModalProtocol,
        onPressProtocolItem,
        onPressHistory,
        listWalletByType,
        refWalletManagement,
        onShowModalWalletManagement,
        onCloseModalWalletManagement,
        currentWalletSelected,
        onSelectWallet,
        listImage,
    };
};
export default useSwapHistory;
