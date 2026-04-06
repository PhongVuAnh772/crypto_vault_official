import { StackActions } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';
import { LoadingImage } from 'src/components/common/AppImage/type';
import AppToastType from 'src/core/enum/AppToastType';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import { useProtocolSelected } from 'src/core/redux/slice/account.selector';
import { getProtocolDataLists } from 'src/core/redux/slice/account.slice';
import { getBlockTonNftTransfer } from 'src/core/redux/slice/app.slice';
import Utils from 'src/core/utils/commonUtils';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import {
    getTonCollectionById,
    setDeleteTonNFT,
} from '../../../../../core/redux/slice/NFT/NFTImport.slice';
import { NFTTonData } from '../NFTImport/NFTTonImport.type';

const useNFTTonDetail = (
    data: NFTTonData,
    { navigation }: RootNavigationType,
) => {
    const { t } = useTranslation();
    const currentProtocol = useProtocolSelected();
    const listProtocol = useAppSelector(getProtocolDataLists);
    const blockTonNftTransfer = useAppSelector(getBlockTonNftTransfer);

    const dispatch = useAppDispatch();

    const [isLoadings, setIsLoadings] = useState<LoadingImage>({});
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const getLinkWithTon = (chainID: number) => {
        let url = '';
        listProtocol?.forEach(protocol => {
            if (protocol.slip0044 === chainID) {
                url = protocol.blockExplorerUrl;
            }
        });
        return url;
    };

    const urlTon = getLinkWithTon(currentProtocol?.slip0044 ?? 0);

    const collectionStore = useAppSelector(getTonCollectionById);

    const getCurrentCollection = () => {
        return collectionStore?.find(
            item =>
                item.contractAddress === data.root.contractAddress &&
                item.network === data.root.symbol,
        );
    };

    const setLoadings = (uri: string, value: boolean) => {
        setIsLoadings(prev => {
            return {
                ...prev,
                [uri]: {
                    uri: uri,
                    loading: value,
                },
            };
        });
    };
    const handlePressURL = useCallback(async () => {
        const address = `${urlTon}/${data.root.contractAddress}`;
        const supported = await Linking.canOpenURL(address);
        if (supported) {
            await Linking.openURL(address);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.root.contractAddress, urlTon]);

    const [showModal, setShowModal] = useState<boolean>(false);
    const [bottomSheetClose, setBottomSheetClose] = useState<boolean>(false);
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] =
        useState<boolean>(false);

    const onShowModal = () => {
        setShowModal(true);
        onBottomSheetOpen();
    };

    const onBottomSheetClose = () => setBottomSheetClose(true);
    const onBottomSheetOpen = () => setBottomSheetClose(false);

    const onHideModal = () => setShowModal(false);

    const onShowConfirmModal = () => setShowConfirmDeleteModal(true);
    const onHideConfirmModal = () => setShowConfirmDeleteModal(false);

    const onDeleteNFT = () => {
        onHideModal();
        onShowConfirmModal();
    };

    const handleDeleteNFT = (NFT: NFTTonData) => {
        dispatch(setDeleteTonNFT(NFT));
        Utils.showToast({
            msg: t(LanguageKey.nft_remove_successfully),
            type: AppToastType.success,
        });
        setIsDeleting(true);
        onHideConfirmModal();
    };

    const onListenDelete = () => {
        const hasData = getCurrentCollection();
        if (!isDeleting) {
            return;
        }
        if (hasData) {
            navigation.goBack();
        } else {
            navigation.dispatch(StackActions.popToTop());
        }
    };

    useEffect(() => {
        onListenDelete();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collectionStore]);
    const onClickSendButton = () => {
        
        navigation.dispatch(
            StackActions.push(HomeStackScreenKey.NFTTonSend, data),
        );
    };
    const copyAction = () => {
        Clipboard.setStringAsync(data.root.contractAddress);
        Utils.showToast({
            msg: t(LanguageKey.common_copied),
            type: AppToastType.success,
        });
    };
    return {
        setLoadings,
        isLoadings,
        handlePressURL,
        showModal,
        onShowModal,
        onHideModal,
        onDeleteNFT,
        t,
        onHideConfirmModal,
        showConfirmDeleteModal,
        handleDeleteNFT,
        setBottomSheetClose,
        onBottomSheetClose,
        bottomSheetClose,
        setIsDeleting,
        onClickSendButton,
        copyAction,
        currentProtocol,
    };
};
export default useNFTTonDetail;
