import { RouteProp } from '@react-navigation/native';
import { LoadingImage } from 'src/components/common/AppImage/type';
import {
    SupportedNativeTokenWithProtocol,
    SupportedTokenItemWithProtocol,
} from 'src/core/redux/slice/customToken/addCustomToken.type';
import { AppThemeType } from 'src/core/type/ThemeType';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import { HomeStackParamListType } from 'src/navigation/stacks/type/HomeStackParamListType';

export type SelectTokenEVMType = {
    item: SupportedTokenItemWithProtocol | SupportedNativeTokenWithProtocol;
    handlePressItem: (
        value:
            | SupportedTokenItemWithProtocol
            | SupportedNativeTokenWithProtocol,
    ) => void;
    theme: AppThemeType;
    loadingImages: LoadingImage;
    setLoadingImages: (uri: string, value: boolean) => void;
    currentToken:
        | SupportedTokenItemWithProtocol
        | SupportedNativeTokenWithProtocol;
};
export type SelectTokenEVMParamsType = RouteProp<
    HomeStackParamListType,
    HomeStackScreenKey.SelectTokenEVM
>;
