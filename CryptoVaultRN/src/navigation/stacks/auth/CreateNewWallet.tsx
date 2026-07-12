import {createNativeStackNavigator} from '@react-navigation/native-stack';
import * as React from 'react';
import {CreateWalletStackScreenKey} from 'src/navigation/enum/NavigationKey';
import {ConfirmSecretPhrase, SecretPhrase} from 'src/features/auth';
import HideHeaderStack from 'src/components/layout/HideHeaderStack';
import {CreateNewWalletStackParamListType} from '../type/CreateNewWalletStackParamListType';

const Stack = createNativeStackNavigator<CreateNewWalletStackParamListType>();

const CreateNewWalletStack = () => {
    return (
        <HideHeaderStack
            initialRouteName={CreateWalletStackScreenKey.RecoveryPhraseWarning}>
            <Stack.Screen
                name={CreateWalletStackScreenKey.SecretPhrase}
                component={SecretPhrase}
            />
            <Stack.Screen
                name={CreateWalletStackScreenKey.ConfirmSecretPhrase}
                component={ConfirmSecretPhrase}
            />
        </HideHeaderStack>
    );
};

export default CreateNewWalletStack;
