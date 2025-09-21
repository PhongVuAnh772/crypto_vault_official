import { useState } from 'react';
import { LoadingImage } from 'src/components/common/AppImage/type';
import {
    CommonContextMessage,
    Feature,
} from 'src/core/enum/ContactFailedAction';
import { ProtocolType } from 'src/core/enum/ProtocolType';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
    setActionFailedNeedToContact,
    setShowCommonErrorModal,
} from 'src/core/redux/slice/app.slice';
import createContextError from 'src/core/services/ContextError';
import { AppThemeType } from 'src/core/type/ThemeType';
import GlobalUtils from 'src/core/utils/globalUtils';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { ListCryptoDataType } from '../home/home.type';
import {
    selectorListCryptoData,
    setSelectedCryptoDataId,
} from '../home/slice/home.slice';
import { setTransferSlip0044 } from '../transfer/transfer.slice';

const useSelectToken = ({ navigation }: RootNavigationType) => {
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const dispatch = useAppDispatch();
    const [searchValue, setSearchValue] = useState('');
    const [isLoadingImages, setIsLoadingImages] = useState<LoadingImage>({});
    const listCryptoData = useAppSelector(selectorListCryptoData);

    const [filteredListCryptoData, setFilteredListCryptoData] =
        useState<ListCryptoDataType[]>(listCryptoData);

    const theme: AppThemeType = useAppTheme();

    const handleSearchChange = (text: string) => {
        const currentFilteredListCryptoData = handleSearchList(text);
        setFilteredListCryptoData(currentFilteredListCryptoData);
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

    const handlePressItem = (item: ListCryptoDataType) => {
        dispatch(setSelectedCryptoDataId(item.id));
        if (item.slip0044) {
            dispatch(setTransferSlip0044(item.slip0044));
            navigation.goBack();
        } else {
            const errorConTextMissingData = createContextError({
                feature: Feature.SelectToken,
                fileError: `selectToken.hook.ts`,
                functionError: `handlePressItem`,
                lineError: 60,
                reason: `${CommonContextMessage.errorMissingData}: item.slip0044`,
                protocol: ProtocolType.All,
            });
            console.error('select Token handlePressItem error');
            dispatch(setShowCommonErrorModal(true));
            dispatch(setActionFailedNeedToContact(errorConTextMissingData));
        }
    };

    const handleSearchList = (text: string) => {
        if (text) {
            return listCryptoData.filter(
                item =>
                    item.name?.toLowerCase().includes(text.toLowerCase()) ||
                    item.symbol?.toLowerCase().includes(text.toLowerCase()),
            );
        } else {
            return listCryptoData;
        }
    };

    return {
        searchValue,
        theme,
        handleSearchChange,
        cleanSearch,
        handlePressItem,
        setLoadingImages,
        isLoadingImages,
        filteredListCryptoData,
        newUI,
    };
};
export default useSelectToken;
