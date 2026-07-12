// @ts-nocheck
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import AppTabBar from 'src/components/common/AppTabBar';
import VMType from 'src/core/enum/VMType';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useProtocolSelected } from 'src/core/redux/slice/account.selector';
import appStyles from 'src/core/styles';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import NFTOnboarding from '../../NFTCollection/components/NFTOnboarding';
import useNFTCollectionTab from './index.hook';
import NFTCollectionScreen from './NFTCollectionTab/evm/NFTCollection.view';
import NFTTonCollectionScreen from './NFTCollectionTab/ton/NFTTonCollection.view';
import EVMUnAddedScreen from './UnAddedNFTTab/evm/evm.view';
import TonUnAddedScreen from './UnAddedNFTTab/ton/ton.view';

// Icons
import PlusIcon from 'src/assets/icons/add.svg';
import MintIcon from 'src/assets/icons/collect.svg';

const NFTCollectionContainerScreen: React.FC<
    RootNavigationType
> = navigation => {
    const currentProtocol = useProtocolSelected();

    const {
        t,
        handleTabChange,
        showOnboarding,
        handleFinishOnboarding,
        handleNavigateToMint,
        handleNavigateToImport
    } = useNFTCollectionTab(navigation);

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

    const renderHeaderRight = () => (
        <View style={styles.headerRight}>
            <TouchableOpacity
                style={styles.iconBtn}
                onPress={handleNavigateToMint}
                activeOpacity={0.7}
            >
                <MintIcon width={22} height={22} fill="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.iconBtn}
                onPress={handleNavigateToImport}
                activeOpacity={0.7}
            >
                <PlusIcon width={22} height={22} fill="#FFFFFF" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[appStyles.flex1, { backgroundColor: '#07051A' }]}>
            <AppTabBar
                screensData={screensData}
                containerStyles={{ marginTop: 10 }}
                onTabChanged={handleTabChange}
                tabBarBackground="#07051A"
                indicatorColor="#5A3FFF"
                activeTextColor="#FFFFFF"
                inactiveTextColor="#8F9BB3"
                showThemeOpacity={false}
                screenWrapperProps={{
                    enableHeader: true,
                    headerTitle: t(LanguageKey.home_tab_nft_collection_title),
                    renderRight: renderHeaderRight,
                    headerStyle: { paddingRight: 10 },
                    backgroundColor: '#07051A',
                    backgroundImage: null,
                    headerTextColor: '#FFFFFF',
                }}
            />
            <NFTOnboarding visible={showOnboarding} onStart={handleFinishOnboarding} />
        </View>
    );
};

const styles = StyleSheet.create({
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    iconBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#131435', // Dark card background matching home header buttons
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
});

export default NFTCollectionContainerScreen;
