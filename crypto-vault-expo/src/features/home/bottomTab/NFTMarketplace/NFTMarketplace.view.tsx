import React from 'react';
import { View } from 'react-native';
import VMType from 'src/core/enum/VMType';
import { useProtocolSelected } from 'src/core/redux/slice/account.selector';
import EvmMarketplaceScreen from './evm/evm.view';
import TonMarketplaceScreen from './ton/ton.view';

const NFTMarketplaceScreen = () => {
    const currentProtocol = useProtocolSelected();

    switch (currentProtocol?.VM) {
        case VMType.EVM:
            return <EvmMarketplaceScreen />;
        case VMType.Ton:
            return <TonMarketplaceScreen />;
        default:
            return <View style={{ flex: 1 }} />;
    }
};

export default NFTMarketplaceScreen;
