import {CreateWalletStackScreenKey} from 'src/navigation/enum/NavigationKey';

export type CreateNewWalletStackParamListType = {
    [CreateWalletStackScreenKey.ConfirmSecretPhrase]: {mnemonic: string};
    [CreateWalletStackScreenKey.RecoveryPhraseWarning]: undefined;
    [CreateWalletStackScreenKey.SecretPhrase]: undefined;
};
