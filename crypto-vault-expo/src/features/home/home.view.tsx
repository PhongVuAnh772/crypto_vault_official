import React from 'react';
import AppLogoLoadingAnimation from 'src/components/common/AppLogoLoadingAnimation';
import Slip0044 from 'src/core/enum/Slip0044';
import { useProtocolSelected } from 'src/core/redux/slice/account.selector';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import BitcoinHomeView from './bitcoin/bitcoin.home.view';
import useHome from './home.hook';
import EVMHomeView from './homeEVM/evm.home.view';
import TonHomeView from './ton/ton.home.view';

const HomeView: React.FC<RootNavigationType> = ({ navigation }) => {
    const protocolBaseData = useProtocolSelected();
    const slip0044 = protocolBaseData?.slip0044;
    const { isLoading } = useHome();

    const getView = () => {
        switch (slip0044) {
            case Slip0044.Bitcoin:
                return <BitcoinHomeView navigation={navigation} />;
            case Slip0044.Ton:
                return <TonHomeView navigation={navigation} />;
            case Slip0044.Ethereum:
            case Slip0044.Binance:
            case Slip0044.SmartChain:
            case Slip0044.Polygon:
                return <EVMHomeView navigation={navigation} />;
            default:
                return <BitcoinHomeView navigation={navigation} />;
        }
    };
    return (
        <>
            {getView()}
            <AppLogoLoadingAnimation isLoading={isLoading} />
        </>
    );
};

export default HomeView;
