import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TouchableOpacity, View } from 'react-native';
import { ScreenWrapper } from 'src/components';
import AppButton from 'src/components/common/AppButton';
import AppButtonSVG from 'src/components/common/AppButtonSvg';
import AppImage from 'src/components/common/AppImage';
import AppText from 'src/components/common/AppText';
import SvgView from 'src/components/SvgBox';
import appColors from 'src/core/constants/AppColors';
import {
    Copy2SvgIcon,
    MenuDotSvgIcon,
    MoreDynamicIconSvg,
} from 'src/core/constants/AppIconsSvg';
import { appImages } from 'src/core/constants/AppImages';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import GlobalUtils from 'src/core/utils/globalUtils';
import walletUtils from 'src/core/utils/walletUtils';
import { BottomSheetMenu, DeleteNFTModal } from '../../components';
import {
    NFTTonData,
    NFTTonRootData,
    NFTTonType,
} from '../NFTImport/NFTTonImport.type';
import { default as useStyle } from './NFTTonDetail.style';
import { AvatarNFTType } from './NFTTonDetail.type';

const NFTDetailWithTon: React.FC<{
    onShowModal: () => void;
    onHideModal: () => void;
    onDeleteNFT: () => void;
    showModal: boolean;
    onBottomSheetClose: () => void;
    isLoadings: Record<string, { loading: boolean }>;
    setLoadings: (uri: string, value: boolean) => void;
    handlePressURL: () => void;
    copyAction: () => void;
    root: NFTTonRootData;
    onClickSendButton: () => void;
    NFT: Readonly<NFTTonData>;
    onHideConfirmModal: () => void;
    showConfirmDeleteModal: boolean;
    bottomSheetClose: boolean;
    handleDeleteNFT: (NFT: NFTTonData) => void;
    detail: NFTTonType;
}> = ({
    detail,
    onShowModal,
    onHideModal,
    onDeleteNFT,
    showModal,
    onBottomSheetClose,
    isLoadings,
    setLoadings,
    handlePressURL,
    copyAction,
    root,
    onClickSendButton,
    NFT,
    onHideConfirmModal,
    showConfirmDeleteModal,
    bottomSheetClose,
    handleDeleteNFT,
}) => {
    const { t } = useTranslation();
    const theme = useAppTheme();
    const insets = useAppSafeAreaInsets();
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const NFTDetailStyle = useStyle(theme, insets);
    const lastPreview =
        detail.nftDetailAll.previews?.[detail.nftDetailAll.previews.length - 1]
            ?.url;

    return (
        <>
            <ScreenWrapper
                bounces={false}
                scrollEnabled
                enableHeader
                paddingTop
                headerTitle={t(LanguageKey.common_nft_detail)}
                headerTextVariant={TextVariantKeys.titleLarge}
                headerTextColor={newUI ? appColors.neutral.white : undefined}
                backButtonColor={newUI ? appColors.neutral.white : undefined}
                backgroundColor={
                    newUI
                        ? appColors.main.tokyoRed
                        : theme.colors.surface_surface_default
                }
                iconRight={
                    newUI ? (
                        <Pressable onPress={() => onShowModal()}>
                            <MenuDotSvgIcon
                                onPress={onShowModal}
                                height={26}
                                width={26}
                                color={
                                    newUI
                                        ? appColors.neutral.white
                                        : appColors.neutral.n800
                                }
                            />
                        </Pressable>
                    ) : (
                        <Pressable onPress={() => onShowModal()}>
                            <MoreDynamicIconSvg
                                onPress={onShowModal}
                                height={26}
                                width={26}
                                color={
                                    newUI
                                        ? appColors.neutral.white
                                        : appColors.neutral.n800
                                }
                            />
                        </Pressable>
                    )
                }>
                <BottomSheetMenu
                    onClose={onHideModal}
                    onDelete={onDeleteNFT}
                    showModal={showModal}
                    onDismiss={onBottomSheetClose}
                />
                <View style={NFTDetailStyle.container}>
                    <View style={NFTDetailStyle.content}>
                        <AvatarTonNFT
                            isLoading={false}
                            setLoadings={setLoadings}
                            uri={
                                lastPreview ??
                                NFT.detail.nftDetailAll.metadata?.image ??
                                appImages.NFTDefault
                            }
                            uriNetwork={detail.network_image ?? ''}
                        />
                        <View
                            style={[
                                NFTDetailStyle.p16,
                                NFTDetailStyle.boxContainer,
                            ]}>
                            <View style={NFTDetailStyle.nameAndId}>
                                <AppText
                                    titleWithI18n={
                                        detail.nftDetailAll.metadata?.name ??
                                        t(LanguageKey.common_unnamed_nft)
                                    }
                                    variant={TextVariantKeys.titleLarge}
                                    textColor={appColors.neutral.n800}
                                    maxFontSizeMultiplier={1.4}
                                />
                            </View>

                            <View style={NFTDetailStyle.information}>
                                <AppText
                                    titleWithI18n={
                                        LanguageKey.nft_asset_contract
                                    }
                                    variant={TextVariantKeys.bodyRMedium}
                                    textColor={appColors.neutral.n800}
                                    styles={NFTDetailStyle.tokenStandard}
                                    maxFontSizeMultiplier={1.4}
                                />
                                <View
                                    style={[
                                        NFTDetailStyle.alignItemsEnd,
                                        NFTDetailStyle.flexRow,
                                    ]}>
                                    <TouchableOpacity onPress={handlePressURL}>
                                        <AppText
                                            title={walletUtils.getShortAddress(
                                                root.contractAddress,
                                            )}
                                            variant={
                                                TextVariantKeys.bodyMMedium
                                            }
                                            textColor={appColors.main.tokyoRed}
                                            styles={NFTDetailStyle.underline}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={copyAction}
                                        style={NFTDetailStyle.ml5}>
                                        <Copy2SvgIcon width={20} height={20} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={NFTDetailStyle.information}>
                                <AppText
                                    titleWithI18n={
                                        LanguageKey.common_collection
                                    }
                                    variant={TextVariantKeys.bodyRMedium}
                                    textColor={appColors.neutral.n800}
                                    styles={NFTDetailStyle.tokenStandard}
                                />
                                <View
                                    style={[
                                        NFTDetailStyle.alignItemsEnd,
                                        NFTDetailStyle.flexRow,
                                        appStyles.justifyContentEnd,
                                        appStyles.flex1,
                                    ]}>
                                    <AppText
                                        title={
                                            NFT.detail.nftDetailAll.collection
                                                ?.name || '-'
                                        }
                                        variant={TextVariantKeys.bodyMMedium}
                                        textColor={
                                            theme.colors
                                                .text_on_surface_text_high
                                        }
                                        styles={appStyles.textAlignRight}
                                    />
                                </View>
                            </View>
                            <View style={NFTDetailStyle.information}>
                                <AppText
                                    titleWithI18n={LanguageKey.common_index}
                                    variant={TextVariantKeys.bodyRMedium}
                                    textColor={appColors.neutral.n800}
                                    styles={NFTDetailStyle.tokenStandard}
                                />
                                <View
                                    style={[
                                        NFTDetailStyle.alignItemsEnd,
                                        NFTDetailStyle.flexRow,
                                    ]}>
                                    <AppText
                                        title={`${NFT.detail.nftDetailAll.index}`}
                                        variant={TextVariantKeys.bodyMMedium}
                                        textColor={
                                            theme.colors
                                                .text_on_surface_text_high
                                        }
                                        maxFontSizeMultiplier={1.4}
                                    />
                                </View>
                            </View>
                        </View>
                        <View
                            style={[
                                NFTDetailStyle.description,
                                NFTDetailStyle.boxContainer,
                            ]}>
                            <AppText
                                titleWithI18n={LanguageKey.common_descriptions}
                                variant={TextVariantKeys.bodyRMedium}
                                textColor={appColors.neutral.n800}
                                styles={NFTDetailStyle.tokenStandard}
                            />
                            <AppText
                                title={
                                    NFT.detail.nftDetailAll.metadata
                                        ?.description
                                }
                                variant={TextVariantKeys.bodyMMedium}
                                textColor={appColors.neutral.n800}
                                styles={NFTDetailStyle.mt8}
                            />
                        </View>
                    </View>
                </View>

                <DeleteNFTModal
                    onCancel={onHideConfirmModal}
                    onConfirm={() => handleDeleteNFT(NFT)}
                    showModal={showConfirmDeleteModal && bottomSheetClose}
                    detailName={
                        NFT.detail.nftDetailAll.metadata?.name ??
                        t(LanguageKey.common_unnamed_nft)
                    }
                    indexNFT={NFT.detail.nftDetailAll.index}
                    usingTonView
                />
            </ScreenWrapper>
            <View style={NFTDetailStyle.buttonSend}>
                {newUI ? (
                    <AppButtonSVG
                        onPress={onClickSendButton}
                        titleWithI18n={LanguageKey.home_send_title}
                        textVariant={TextVariantKeys.bodyMMedium}
                        textColor={appColors.neutral.white}
                        SvgView={SvgView.button}
                        buttonHeight={48}
                    />
                ) : (
                    <AppButton
                        onPress={onClickSendButton}
                        titleWithI18n={LanguageKey.home_send_title}
                        textVariant={TextVariantKeys.bodyMMedium}
                        textColor={appColors.neutral.white}
                        styles={NFTDetailStyle.button}
                    />
                )}
            </View>
        </>
    );
};

const AvatarTonNFT = ({
    uri,
    setLoadings,
    isLoading,
    uriNetwork,
    typeNFT,
}: AvatarNFTType) => {
    const theme = useAppTheme();
    const insets = useAppSafeAreaInsets();
    const NFTDetailStyle = useStyle(theme, insets);
    return (
        <AppImage
            uri={uri}
            networkImage={uriNetwork}
            styleImage={NFTDetailStyle.image}
            styleNetworkImage={NFTDetailStyle.network}
            isLoading={isLoading}
            setIsLoading={setLoadings}
            defaultImage={appImages.NFTDefault}
            loadingHeight={300}
        />
    );
};

export { AvatarTonNFT, NFTDetailWithTon };
