import { RouteProp } from '@react-navigation/native';
import { LoadingImage } from 'src/components/common/AppImage/type';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import { HomeStackParamListType } from 'src/navigation/stacks/type/HomeStackParamListType';
import { ListCryptoDataType } from '../home/home.type';

export type SelectTokenEVMType = {
    item: ListCryptoDataType;
    handlePressItem: (value: ListCryptoDataType) => void;
    loadingImages: LoadingImage;
    setLoadingImages: (uri: string, value: boolean) => void;
};
export type SelectTokenEVMParamsType = RouteProp<
    HomeStackParamListType,
    HomeStackScreenKey.SelectTokenEVM
>;
