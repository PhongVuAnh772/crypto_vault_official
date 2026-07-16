import React from 'react';
import Slip0044 from 'src/core/enum/Slip0044';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import TransferBitcoinComponent from './bitcoin/bitcoin.transfer.view';
import SendTokenEVM from './evm/send.evm.view';
import TransferTonComponent from './ton/ton.transfer.view';
import { useSelectorTransferSlip0044 } from './transfer.selector';

const TransferScreen = ({ navigation }: RootNavigationType) => {
    const slip0044 = useSelectorTransferSlip0044();

    const getView = () => {
        switch (slip0044) {
            case Slip0044.Ton:
                return <TransferTonComponent navigation={navigation} />;
            case Slip0044.Bitcoin:
                return <TransferBitcoinComponent navigation={navigation} />;
            case Slip0044.Ethereum:
                return <SendTokenEVM navigation={navigation} />;
        }
    };
    return getView();
};

export default TransferScreen;
