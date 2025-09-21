import { useState } from 'react';
import { LoadingImage } from 'src/components/common/AppImage/type';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import { filterTokenByWalletAddress } from 'src/core/redux/slice/customToken/addCustomToken.slice';
import {
    SupportedNativeTokenWithProtocol,
    SupportedTokenItemWithProtocol,
} from 'src/core/redux/slice/customToken/addCustomToken.type';
import { AppThemeType } from 'src/core/type/ThemeType';
import GlobalUtils from 'src/core/utils/globalUtils';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { handleChangeCurrentToken } from '../../../transfer/evm/send.evm.slice';

const useSelectToken = ({ navigation }: RootNavigationType) => {
    const [searchValue, setSearchValue] = useState('');
    const [isLoadingImages, setIsLoadingImages] = useState<LoadingImage>({});
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const theme: AppThemeType = useAppTheme();

    const dispatch = useAppDispatch();

    const listTokenByProtocol = useAppSelector(filterTokenByWalletAddress);

    const filterListToken = listTokenByProtocol
        .filter(token => token?.active || token?.isNativeToken)
        .sort((a, b) => a.name.localeCompare(b.name));

    const handleSearchChange = (text: string) => {
        setSearchValue(text);
    };

    const cleanSearch = () => {
        setSearchValue('');
    };

    const setLoadingImages = (uri: string, value: boolean) => {
        const imageLoading = isLoadingImages[uri];
        if (!imageLoading || imageLoading.loading) {
            setIsLoadingImages(prev => {
                return {
                    ...prev,
                    [uri]: {
                        uri: uri,
                        loading: value,
                    },
                };
            });
        }
    };

    const handlePressItem = (
        item: SupportedTokenItemWithProtocol | SupportedNativeTokenWithProtocol,
    ) => {
        dispatch(handleChangeCurrentToken(item));
        navigation.goBack();
    };

    const handleSearchList = () => {
        if (searchValue) {
            return filterListToken.filter(
                item =>
                    item.name
                        ?.toLowerCase()
                        .includes(searchValue.toLowerCase()) ||
                    item.symbol
                        ?.toLowerCase()
                        .includes(searchValue.toLowerCase()),
            );
        } else {
            return filterListToken;
        }
    };

    return {
        searchValue,
        theme,
        handleSearchChange,
        cleanSearch,
        listTokenByProtocol: handleSearchList(),
        setLoadingImages,
        isLoadingImages,
        newUI,
        handlePressItem,
    };
};
export default useSelectToken;
