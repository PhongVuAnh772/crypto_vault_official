import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { CommonActions } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppToastType from 'src/core/enum/AppToastType';
import { UnAddedType } from 'src/core/enum/UnAddedType';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
    useCurrentWallet,
    useProtocolSelected,
} from 'src/core/redux/slice/account.selector';
import {
    getAccountId,
    getSelectedProtocolId,
} from 'src/core/redux/slice/account.slice';
import {
    addToArchivedCollection,
    getCollectionsMoralisThunk,
    getCursorCollectionsMoralis,
    getListCollectionSpamFocused,
    getTonCollectionById,
    setCursorCollectionsMoralis,
} from 'src/core/redux/slice/NFT/NFTImport.slice';
import { UnAddedNFTListType } from 'src/core/redux/slice/NFT/NFTImport.type';
import {
    getEnableTonPagination,
    getNFTArchivedSpam,
    setEnableTonPagination,
    updateNFTArchivedSpam,
} from 'src/core/redux/slice/NftData.slice';
import Utils from 'src/core/utils/commonUtils';
import {
    compareAddressesEVM,
    convertChainByProtocol,
} from 'src/core/utils/evmUtils';
import GlobalUtils from 'src/core/utils/globalUtils';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';

const useUnAddedNFTTab = ({ navigation }: RootNavigationType) => {
    const wallet = useCurrentWallet();
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const cursorCollectionsMoralis = useAppSelector(
        getCursorCollectionsMoralis,
    );
    const { t } = useTranslation();
    const selectedProtocolId = useAppSelector(getSelectedProtocolId);
    const archivedCollectionFocused = useAppSelector(
        getListCollectionSpamFocused,
    );
    const protocolSelected = useProtocolSelected();
    const dispatch = useAppDispatch();
    const [collections, setCollections] = useState<UnAddedNFTListType[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [modalWarning, setModalWarning] = useState(false);
    const enablePagination = useAppSelector(getEnableTonPagination);
    const collection = useAppSelector(getTonCollectionById);
    const nftArchivedSpam = useAppSelector(getNFTArchivedSpam);
    const [itemCheckingSpam, setItemCheckingSpam] =
        useState<UnAddedNFTListType | null>(null);
    const [typeSelect, setTypeSelect] = useState<UnAddedType>(UnAddedType.All);
    const currentWallet = useCurrentWallet();
    const currentProtocol = useProtocolSelected();
    const selectedAccountId = useAppSelector(getAccountId);
    const bottomSheetSelectorRef = useRef<BottomSheetModal>(null);

    const changeTypeSelect = (type: UnAddedType) => {
        setTypeSelect(type);
    };

    const showBottomSheetModal = () => {
        bottomSheetSelectorRef.current?.present();
    };
    const closeBottomSheet = () => {
        bottomSheetSelectorRef.current?.close();
    };
    const actionArchivingWithLocal = () => {
        if (
            !itemCheckingSpam?.token_address ||
            !itemCheckingSpam ||
            !currentWallet ||
            !currentProtocol ||
            !selectedAccountId
        ) {
            return;
        }
        dispatch(
            updateNFTArchivedSpam({
                collection: itemCheckingSpam,
                collectionAddress: itemCheckingSpam?.token_address,
                walletCombineSlip0044Id: `${currentWallet.address}_${currentProtocol.slip0044}`,
                selectedAccountId: selectedAccountId,
            }),
        );
    };

    const handleArchiving = () => {
        actionArchivingWithLocal();
        setModalWarning(false);
        setItemCheckingSpam(null);
        Utils.showToast({
            msg: t(LanguageKey.nft_action_archive_complete),
            type: AppToastType.success,
        });
    };

    const handleConfirm = () => {
        setModalWarning(false);
        if (!itemCheckingSpam) {
            return;
        }
        let nftArchivedSpamCheckItem: UnAddedNFTListType[] = [];

        if (nftArchivedSpam && itemCheckingSpam) {
            nftArchivedSpamCheckItem = nftArchivedSpam.filter(item => {
                return compareAddressesEVM(
                    item.token_address,
                    itemCheckingSpam.token_address,
                );
            });
        }
        dispatch(addToArchivedCollection(itemCheckingSpam?.token_address));

        const isInArchivedSpam = nftArchivedSpamCheckItem.length === 0;

        navigation.dispatch(
            CommonActions.navigate({
                name: HomeStackScreenKey.NFTCollectionStats,
                params: {
                    collectionAddress: itemCheckingSpam?.token_address,
                    headerTitle: itemCheckingSpam?.name,
                    isArchived: !isInArchivedSpam,
                    collection: itemCheckingSpam,
                    possibleSpam: true,
                },
            }),
        );
    };
    const handlingEVMPagination = async () => {
        dispatch(setEnableTonPagination(true));
        try {
            if (protocolSelected && wallet?.address) {
                const chain = convertChainByProtocol(protocolSelected.slip0044);

                if (cursorCollectionsMoralis === null) {
                    dispatch(setEnableTonPagination(false));
                    return;
                }

                const response = await dispatch(
                    getCollectionsMoralisThunk({
                        chain: chain,
                        address: wallet?.address,
                        limit: 20,
                        cursor: cursorCollectionsMoralis,
                    }),
                );

                if (getCollectionsMoralisThunk.fulfilled.match(response)) {
                    if (
                        response.payload.data &&
                        'result' in response.payload.data
                    ) {
                        const filteredCollections =
                            response.payload.data.result.filter(
                                resultItem =>
                                    !nftArchivedSpam.some(nftArchivedSpamItem =>
                                        compareAddressesEVM(
                                            nftArchivedSpamItem.token_address,
                                            resultItem.token_address,
                                        ),
                                    ),
                            );

                        setCollections(prevCollections => [
                            ...prevCollections,
                            ...filteredCollections,
                        ]);
                        dispatch(
                            setCursorCollectionsMoralis(
                                response.payload.data.cursor ?? null,
                            ),
                        );
                        dispatch(setEnableTonPagination(true));

                        setRefreshing(false);
                        setInitialLoading(false);
                    }
                } else {
                    dispatch(setEnableTonPagination(false));
                    setRefreshing(false);
                    setInitialLoading(false);
                }
            } else {
                setRefreshing(false);
                setInitialLoading(false);
                throw new Error('protocolBaseData or wallet?.address is null');
            }
        } catch (error) {
            setInitialLoading(false);
            setRefreshing(false);
            console.log('error', error);
        }
    };

    const handlingPagination = async () => {
        await handlingEVMPagination();
    };
    const handlingCheckingSpam = (collection: UnAddedNFTListType) => {
        const checkFocused = archivedCollectionFocused.filter(item => {
            return item === collection.token_address;
        });

        let nftArchivedSpamCheckItem: UnAddedNFTListType[] = [];

        if (nftArchivedSpam && collection) {
            const checkArchived = nftArchivedSpam.filter(item => {
                return compareAddressesEVM(
                    item.token_address,
                    collection.token_address,
                );
            });

            nftArchivedSpamCheckItem = [...checkArchived];
        }

        const isSpam = collection.possible_spam;
        const isInFocused = checkFocused.length === 0;
        const isInArchivedSpam = nftArchivedSpamCheckItem.length === 0;

        if (isSpam && isInArchivedSpam && isInFocused) {
            setModalWarning(true);
            setItemCheckingSpam(collection);
            return;
        }

        navigation.dispatch(
            CommonActions.navigate({
                name: HomeStackScreenKey.NFTCollectionStats,
                params: {
                    collectionAddress: collection.token_address,
                    headerTitle: collection.name,
                    isArchived: !isInArchivedSpam,
                    possibleSpam: collection.possible_spam,
                    collection: collection,
                },
            }),
        );
    };

    const handlingCollectionArchivedNavigating = (
        collection: UnAddedNFTListType,
    ) => {
        let nftArchivedSpamCheckItem: UnAddedNFTListType[] = [];

        if (nftArchivedSpam && itemCheckingSpam) {
            nftArchivedSpamCheckItem = nftArchivedSpam.filter(item => {
                return compareAddressesEVM(
                    item.token_address,
                    collection.token_address,
                );
            });
        }

        const isInArchivedSpam = nftArchivedSpamCheckItem.length === 0;

        navigation.dispatch(
            CommonActions.navigate({
                name: HomeStackScreenKey.NFTCollectionStats,
                params: {
                    collectionAddress: collection.token_address,
                    headerTitle: collection.name,
                    isArchived: !isInArchivedSpam,
                    possibleSpam: collection.possible_spam,
                },
            }),
        );
    };

    const getDataCollectionEVM = async () => {
        try {
            if (protocolSelected && wallet?.address) {
                const chain = convertChainByProtocol(protocolSelected.slip0044);
                const response = await dispatch(
                    getCollectionsMoralisThunk({
                        chain: chain,
                        address: wallet?.address,
                        limit: 10,
                    }),
                );
                if (getCollectionsMoralisThunk.fulfilled.match(response)) {
                    if (
                        response.payload.data &&
                        'result' in response.payload.data
                    ) {
                        if (typeSelect === UnAddedType.UnArchive) {
                            const filteredCollections =
                                response.payload.data.result.filter(
                                    resultItem =>
                                        !nftArchivedSpam.some(
                                            nftArchivedSpamItem =>
                                                nftArchivedSpamItem.token_address ===
                                                resultItem.token_address,
                                        ),
                                );
                            setCollections(filteredCollections);
                        } else {
                            setCollections(response.payload.data.result);
                        }
                        if (response.payload.data.cursor) {
                            dispatch(
                                setCursorCollectionsMoralis(
                                    response.payload.data.cursor,
                                ),
                            );
                        } else {
                            dispatch(setCursorCollectionsMoralis(null));
                        }
                        setRefreshing(false);
                        setInitialLoading(false);
                    }
                } else {
                    setCollections([]);
                    setRefreshing(false);
                    setInitialLoading(false);
                }
            } else {
                setCollections([]);
                setRefreshing(false);
                setInitialLoading(false);
                throw new Error('protocolBaseData or wallet?.address is null');
            }
        } catch (error) {
            setInitialLoading(false);
            setRefreshing(false);
            console.log('error', error);
        }
    };

    const getDataCollectionYouOwned = async () => {
        await getDataCollectionEVM();
    };

    const onRefresh = () => {
        setRefreshing(true);
        getDataCollectionYouOwned();
    };
    const fetchDataCollection = async () => {
        await getDataCollectionYouOwned();
    };
    useEffect(() => {
        fetchDataCollection();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProtocolId, wallet, typeSelect, nftArchivedSpam, collection]);

    return {
        collections,
        initialLoading,
        refreshing,
        onRefresh,
        handlingCheckingSpam,
        enablePagination,
        handlingPagination,
        typeSelect,
        handlingCollectionArchivedNavigating,
        nftArchivedSpam,
        modalWarning,
        handleConfirm,
        handleArchiving,
        changeTypeSelect,
        bottomSheetSelectorRef,
        showBottomSheetModal,
        closeBottomSheet,
        newUI,
    };
};

export default useUnAddedNFTTab;
