import {createNativeStackNavigator} from '@react-navigation/native-stack';
import * as React from 'react';
import HideHeaderStack from '../../../components/layout/HideHeaderStack';
import {RestoreWalletStackScreenKey} from 'src/navigation/enum/NavigationKey';
import {RestoreWallet} from 'src/features/auth';

const Stack = createNativeStackNavigator();

const RestoreWalletStack = () => {
    return (
        <HideHeaderStack
            initialRouteName={RestoreWalletStackScreenKey.RestoreWallet}>
            <Stack.Screen
                name={RestoreWalletStackScreenKey.RestoreWallet}
                component={RestoreWallet}
            />
        </HideHeaderStack>
    );
};

export default RestoreWalletStack;
