import {PinCodeStackScreenKey} from 'src/navigation/enum/NavigationKey';

export type PinCodeStackParamListType = {
    [PinCodeStackScreenKey.CreatePin]: undefined;
    [PinCodeStackScreenKey.ReEnterPin]: {pinCode: string};
};
