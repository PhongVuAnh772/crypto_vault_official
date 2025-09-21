import { StackActions } from '@react-navigation/native';
import { Address } from '@ton/core';
import { useState } from 'react';
import { LoadingImage } from 'src/components/common/AppImage/type';
import Slip0044 from 'src/core/enum/Slip0044';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
    useCurrentWallet,
    useProtocolSelected,
} from 'src/core/redux/slice/account.selector';
import {
    activeJettonFromBE,
    activeTokenFromBE,
    filterTokenByWalletAddress,
    onChangeActiveJetton,
    onChangeActiveToken,
} from 'src/core/redux/slice/customToken/addCustomToken.slice';
import {
    OriginTokenType,
    SupportedTokenItemWithProtocol,
    TokenType,
} from 'src/core/redux/slice/customToken/addCustomToken.type';
import { AppThemeType } from 'src/core/type/ThemeType';
import GlobalUtils from 'src/core/utils/globalUtils';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';

export const useCrypto = ({ navigation }: RootNavigationType) => {
    const [searchValue, setSearchValue] = useState('');
    const [isLoadingImages, setIsLoadingImages] = useState<LoadingImage>({});
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const theme: AppThemeType = useAppTheme();

    const dispatch = useAppDispatch();

    const currentWallet = useCurrentWallet();
    const protocolBaseData = useProtocolSelected();

    const isTon = protocolBaseData?.slip0044 === Slip0044.Ton;
    const isBitcoin = protocolBaseData?.slip0044 === Slip0044.Bitcoin;
    const hideAddCustomToken = isBitcoin;
    // const hideAddCustomToken = isTon || isBitcoin;

    const listTokenByWalletAddress = useAppSelector(filterTokenByWalletAddress);
    const listTokenAfterHideNativeToken = listTokenByWalletAddress
        .filter(item => !item?.isNativeToken)
        .sort((a, b) => a.name.localeCompare(b.name));
    const handleSearchChange = (text: string) => {
        setSearchValue(text);
    };

    const cleanSearch = () => {
        setSearchValue('');
    };
    const onPressAddCustomCrypto = () => {
        navigation.dispatch(
            StackActions.push(HomeStackScreenKey.AddCustomToken),
        );
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

    const handleFilterJetton = () => {
        const mergedTokens = new Map();
        for (const token of listTokenAfterHideNativeToken) {
            try {
                const parsedAddress = Address.parse(
                    token.contractAddress,
                ).toRawString();
                const existingToken = mergedTokens.get(parsedAddress);

                if (
                    !existingToken ||
                    existingToken.originTokenType === OriginTokenType.LOCAL
                ) {
                    mergedTokens.set(parsedAddress, token);
                }
            } catch (error) {
                console.log(
                    'Failed to parse address:',
                    token.contractAddress,
                    error,
                );
            }
        }

        const uniqueMergedTokens = Array.from(mergedTokens.values());
        return uniqueMergedTokens;
    };

    const handleOnChangeStatusJetton = async (data: TokenType) => {
        const addressParsed = Address.parse(data.contractAddress);
        dispatch(
            activeJettonFromBE({
                id: data.idProtocol,
                contractAddress: addressParsed.toRawString(),
                value: !data.active,
            }),
        );
        dispatch(
            onChangeActiveJetton({
                contractAddress: addressParsed.toRawString(),
                id: `${currentWallet?.address ?? ''}_${protocolBaseData?.slip0044}`,
                value: !data.active,
            }),
        );
    };

    const handleOnChangeStatus = async (data: TokenType) => {
        if (isTon) {
            await handleOnChangeStatusJetton(data);
            return;
        }
        const token = data as SupportedTokenItemWithProtocol;
        const currentStatus = token.active;
        if (token?.originTokenType === OriginTokenType.BE) {
            dispatch(
                activeTokenFromBE({
                    id: token.idProtocol,
                    contractAddress: token.contractAddress,
                    value: !currentStatus,
                }),
            );
        } else {
            dispatch(
                onChangeActiveToken({
                    contractAddress: token.contractAddress,
                    id: `${currentWallet?.address ?? ''}_${
                        protocolBaseData?.slip0044
                    }`,
                    value: !currentStatus,
                }),
            );
        }
    };
    return {
        searchValue,
        theme,
        handleSearchChange,
        cleanSearch,
        onPressAddCustomCrypto,
        listTokenByWalletAddress: isTon
            ? handleFilterJetton()
            : listTokenAfterHideNativeToken,
        setLoadingImages,
        isLoadingImages,
        handleOnChangeStatus,
        hideAddCustomToken,
        newUI,
    };
};
