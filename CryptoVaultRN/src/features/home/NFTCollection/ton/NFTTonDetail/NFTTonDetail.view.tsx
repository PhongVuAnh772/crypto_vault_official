import {RouteProp, useRoute} from '@react-navigation/native';
import React from 'react';
import {HomeStackScreenKey} from 'src/navigation/enum/NavigationKey';
import {HomeStackParamListType} from 'src/navigation/stacks/type/HomeStackParamListType';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import {NFTDetailWithTon} from './NFTTonDetail.components';
import useNFTTonDetail from './NFTTonDetail.hook';

type NFTDetailParams = RouteProp<
    HomeStackParamListType,
    HomeStackScreenKey.NFTTonDetail
>;
const NFTTonDetail: React.FC<RootNavigationType> = ({navigation}) => {
    const NFT = useRoute<NFTDetailParams>().params;
    const {detail, root} = NFT;

    const {
        isLoadings,
        setLoadings,
        handlePressURL,
        showModal,
        onHideModal,
        onShowModal,
        onDeleteNFT,
        onHideConfirmModal,
        handleDeleteNFT,
        showConfirmDeleteModal,
        onBottomSheetClose,
        bottomSheetClose,
        onClickSendButton,
        copyAction,
    } = useNFTTonDetail(NFT, {navigation});

    return (
        <NFTDetailWithTon
            detail={detail}
            onShowModal={onShowModal}
            onHideModal={onHideModal}
            onDeleteNFT={onDeleteNFT}
            showModal={showModal}
            onBottomSheetClose={onBottomSheetClose}
            isLoadings={isLoadings}
            setLoadings={setLoadings}
            handlePressURL={handlePressURL}
            copyAction={copyAction}
            root={root}
            onClickSendButton={onClickSendButton}
            NFT={NFT}
            onHideConfirmModal={onHideConfirmModal}
            showConfirmDeleteModal={showConfirmDeleteModal}
            bottomSheetClose={bottomSheetClose}
            handleDeleteNFT={handleDeleteNFT}
        />
    );
};

export default NFTTonDetail;
