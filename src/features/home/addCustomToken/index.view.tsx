import React from 'react';
import { View } from 'react-native';
import VMType from 'src/core/enum/VMType';
import appStyles from 'src/core/styles';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import AddCustomTokenEVM from './evm/addCustomToken.evm.view';
import useAddCustomToken from './index.hook';
import AddCustomTokenTon from './ton/addCustomToken.ton.view';

const AddCustomTokenWrapper: React.FC<RootNavigationType> = ({
    navigation,
}) => {
    const { currentProtocol } = useAddCustomToken({ navigation });

    const renderProtocolView = (protocol: string | null | undefined) => {
        switch (protocol) {
            case VMType.EVM:
                return <AddCustomTokenEVM navigation={navigation} />;
            case VMType.Ton:
                return <AddCustomTokenTon navigation={navigation} />;
            default:
                return null;
        }
    };

    return (
        <View style={appStyles.flex1}>
            {renderProtocolView(currentProtocol?.VM)}
        </View>
    );
};

export default AddCustomTokenWrapper;
