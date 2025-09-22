import React from 'react';
import AppTabBar from 'src/components/common/AppTabBar';
import VMType from 'src/core/enum/VMType';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useProtocolSelected } from 'src/core/redux/slice/account.selector';
import appStyles from 'src/core/styles';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import useNFTCollectionTab from './index.hook';
import NFTCollectionScreen from './NFTCollectionTab/evm/NFTCollection.view';
import NFTTonCollectionScreen from './NFTCollectionTab/ton/NFTTonCollection.view';
import EVMUnAddedScreen from './UnAddedNFTTab/evm/evm.view';
import TonUnAddedScreen from './UnAddedNFTTab/ton/ton.view';

const NFTCollectionContainerScreen: React.FC<
    RootNavigationType
> = navigation => {
    const currentProtocol = useProtocolSelected();

    const { t, handleTabChange } = useNFTCollectionTab(navigation);

    const getScreensData = () => {
        switch (currentProtocol?.VM) {
            case VMType.EVM:
                return [
                    {
                        screen: NFTCollectionScreen,
                        title: t(LanguageKey.top_tab_my_nft_collection),
                    },
                    {
                        screen: EVMUnAddedScreen,
                        title: t(LanguageKey.un_added_nfts_nfts_you_own),
                    },
                ];
            case VMType.Ton:
                return [
                    {
                        screen: NFTTonCollectionScreen,
                        title: t(LanguageKey.top_tab_my_nft_collection),
                    },
                    {
                        screen: TonUnAddedScreen,
                        title: t(LanguageKey.un_added_nfts_nfts_you_own),
                    },
                ];
            default:
                return null;
        }
    };
    const screensData = getScreensData();

    return (
        <AppTabBar
            screensData={screensData}
            containerStyles={appStyles.mt30}
            onTabChanged={handleTabChange}
        />
    );
};

export default NFTCollectionContainerScreen;
