import { LoadingImage } from 'src/components/common/AppImage/type';
import {
    SupportedNativeTokenWithProtocol,
    SupportedTokenItemWithProtocol,
    TokenType,
} from 'src/core/redux/slice/customToken/addCustomToken.type';

export type ManageListCryptoType = {
    searching: string;
    tokenData: (
        | SupportedTokenItemWithProtocol
        | SupportedNativeTokenWithProtocol
    )[];
    isLoadingImages: LoadingImage;
    setIsLoadingImage?: (uri: string, value: boolean) => void;
    handleOnChangeStatus: (data: TokenType) => void;
};
