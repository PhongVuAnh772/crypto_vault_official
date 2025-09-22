import { RouteProp, useRoute } from '@react-navigation/native';
import React from 'react';
import VMType from 'src/core/enum/VMType';
import { NFTDetailEVMCollectionType } from 'src/core/redux/slice/NFT/NFTImport.type';
import { Nftitem } from 'src/core/services/TonServices/type';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import { HomeStackParamListType } from 'src/navigation/stacks/type/HomeStackParamListType';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import NFTUnAddedDetailEVMView from './evm/NFTUnAddedDetail.view';
import useNFTUnAddedDetail from './index.hook';
import UnAddedDetailTonView from './ton/NFTUnAddedDetail.view';

type NFTDetailParams = RouteProp<
    HomeStackParamListType,
    HomeStackScreenKey.NFTUnAddedDetail
>;
const NFTUnAddedDetail: React.FC<RootNavigationType> = ({ navigation }) => {
    const NFT = useRoute<NFTDetailParams>().params;
    const { detail, metadata, added, archived } = NFT;
    const { currentProtocol } = useNFTUnAddedDetail();
    const getHistoryView = () => {
        switch (currentProtocol?.VM) {
            case VMType.EVM:
                return (
                    <NFTUnAddedDetailEVMView
                        detail={detail as NFTDetailEVMCollectionType}
                        metadata={metadata}
                        added={added}
                        archived={archived}
                        navigation={navigation}
                    />
                );
            case VMType.Ton:
                return (
                    <UnAddedDetailTonView
                        detail={detail as Nftitem}
                        metadata={metadata}
                        added={added}
                        archived={archived}
                        navigation={navigation}
                    />
                );
        }
    };
    return getHistoryView();
};

export default NFTUnAddedDetail;
