import { MotiView } from 'moti';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dimensions,
    Pressable,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppButton from 'src/components/common/AppButton';
import AppImage from 'src/components/common/AppImage';
import AppModal from 'src/components/common/AppModal';
import AppSkeletonLoading from 'src/components/common/AppSkeletonLoading';
import AppText from 'src/components/common/AppText';
import AppTextInput from 'src/components/common/AppTextInput';
import BottomSheetModal from 'src/components/specific/BottomSheetModal/BottomSheetModal.view';
import appColors from 'src/core/constants/AppColors';
import {
    Copy2SvgIcon,
    MenuDotSvgIcon,
    ScanSvgIcon,
    TrashBinSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import { appImages } from 'src/core/constants/AppImages';
import InputMode from 'src/core/enum/InputMode';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import { NFTTokenStandard } from 'src/core/services/Web3/type';
import appStyles from 'src/core/styles';
import GlobalUtils from 'src/core/utils/globalUtils';
import useStyles from '../evm/NFTDetail/NFTDetail.style';
import {
    AvatarNFTType,
    BottomSheetMenuType,
    DeleteNFTModalType,
    MenuOptionType,
    NFTImportContentProps,
    TopContentNFTDetailsProps,
} from '../evm/NFTDetail/NFTDetail.type';
import useNFTImportStyles from '../evm/NFTImport/NFTImport.style';
import useNFTSendStyles from '../evm/NFTSend/NFTSend.style';
import { SendNFTSkeletonLoadingType } from '../evm/NFTSend/NFTSend.type';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MenuOptionIcon = ({ onPress }: MenuOptionType) => {
    return (
        <Pressable onPress={onPress}>
            <MenuDotSvgIcon
                height={24}
                width={24}
                color={appColors.neutral.n800}
            />
        </Pressable>
    );
};

const BottomSheetMenu = ({
    showModal,
    onClose,
    onDelete,
    onDismiss,
}: BottomSheetMenuType) => {
    const theme = useAppTheme();
    const insets = useAppSafeAreaInsets();
    const NFTDetailStyle = useStyles(theme, insets);

    return (
        <BottomSheetModal
            showModal={showModal}
            closeModalAction={onClose}
            maxHeight={0.15}
            onDismiss={onDismiss}
            child={
                <TouchableOpacity
                    style={NFTDetailStyle.removeContainer}
                    onPress={onDelete}>
                    <TrashBinSvgIcon
                        height={24}
                        width={24}
                        style={NFTDetailStyle.trashBinIcon}
                        color={appColors.main.tokyoRed}
                    />
                    <AppText
                        titleWithI18n={LanguageKey.nft_remove}
                        variant={TextVariantKeys.titleMedium}
                        textColor={appColors.main.tokyoRed}
                    />
                </TouchableOpacity>
            }
        />
    );
};

const TopContentNFTDetails = ({
    isLoading,
    setLoadings,
    typeNFT,
    imageUri,
    uriNetwork,
    isERC1155,
    detailName,
    detailId,
    tokenStandard,
    quantity,
    handlePressURL,
    contractAddress,
    copyAction,
    description,
}: TopContentNFTDetailsProps) => {
    const theme = useAppTheme();
    const insets = useAppSafeAreaInsets();
    const NFTDetailStyle = useStyles(theme, insets);

    return (
        <View style={[NFTDetailStyle.pH25, NFTDetailStyle.mt15]}>
            <View>
                <AvatarNFT
                    isLoading={isLoading}
                    setLoadings={setLoadings}
                    typeNFT={typeNFT}
                    uri={imageUri}
                    uriNetwork={uriNetwork ?? ''}
                />
                <View
                    style={[
                        NFTDetailStyle.p16,
                        NFTDetailStyle.boxContainer,
                        NFTDetailStyle.content,
                        !isERC1155
                            ? {
                                  borderTopLeftRadius: 0,
                                  borderTopRightRadius: 0,
                              }
                            : {},
                    ]}>
                    <View style={NFTDetailStyle.nameAndId}>
                        <AppText
                            title={detailName}
                            variant={TextVariantKeys.titleLarge}
                            textColor={appColors.neutral.n800}
                        />
                        <AppText
                            title={`#${detailId}`}
                            variant={TextVariantKeys.bodyMMedium}
                            textColor={appColors.main.tokyoRed}
                            styles={NFTDetailStyle.mt5}
                        />
                    </View>
                    <View style={NFTDetailStyle.information}>
                        <AppText
                            titleWithI18n={LanguageKey.nft_token_standard}
                            variant={TextVariantKeys.bodyRMedium}
                            textColor={appColors.neutral.n800}
                            styles={NFTDetailStyle.tokenStandard}
                        />
                        <AppText
                            title={tokenStandard}
                            variant={TextVariantKeys.bodyMMedium}
                            textColor={appColors.neutral.n800}
                        />
                    </View>
                    {isERC1155 && (
                        <View style={NFTDetailStyle.information}>
                            <AppText
                                titleWithI18n={
                                    LanguageKey.project_detail_quantity
                                }
                                variant={TextVariantKeys.bodyRMedium}
                                textColor={appColors.neutral.n800}
                                styles={NFTDetailStyle.tokenStandard}
                            />
                            <AppText
                                title={`${quantity}` || ''}
                                variant={TextVariantKeys.bodyMMedium}
                                textColor={appColors.neutral.n800}
                                styles={NFTDetailStyle.mt8}
                            />
                        </View>
                    )}
                    <View style={NFTDetailStyle.information}>
                        <AppText
                            titleWithI18n={LanguageKey.nft_asset_contract}
                            variant={TextVariantKeys.bodyRMedium}
                            textColor={appColors.neutral.n800}
                            styles={NFTDetailStyle.tokenStandard}
                        />
                        <View
                            style={[
                                NFTDetailStyle.alignItemsEnd,
                                NFTDetailStyle.flexRow,
                            ]}>
                            <TouchableOpacity onPress={handlePressURL}>
                                <AppText
                                    title={contractAddress}
                                    variant={TextVariantKeys.bodyMMedium}
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
                        title={description}
                        variant={TextVariantKeys.bodyMMedium}
                        textColor={appColors.neutral.n800}
                        styles={NFTDetailStyle.mt8}
                    />
                </View>
            </View>
        </View>
    );
};

export const AvatarNFT = ({
    uri,
    setLoadings,
    isLoading,
    uriNetwork,
    typeNFT,
    loadingHeight,
}: AvatarNFTType) => {
    const theme = useAppTheme();
    const insets = useAppSafeAreaInsets();
    const NFTDetailStyle = useStyles(theme, insets);
    if (typeNFT === NFTTokenStandard.ERC721) {
        return (
            <AppImage
                uri={uri}
                networkImage={uriNetwork}
                styleImage={NFTDetailStyle.image}
                styleNetworkImage={NFTDetailStyle.network}
                isLoading={isLoading}
                setIsLoading={setLoadings}
                defaultImage={appImages.NFTDefault}
                containerStyle={appStyles.backgroundWhite}
            />
        );
    }
    return (
        <View style={NFTDetailStyle.avatarContainer}>
            <MotiView
                from={{
                    translateX: 0,
                    translateY: 0,
                    opacity: 0.2,
                }}
                animate={{
                    opacity: 1,
                    translateY: -10,
                    translateX: 10,
                }}
                transition={{
                    type: 'spring',
                    delay: 500,
                }}
                style={[
                    StyleSheet.absoluteFillObject,
                    NFTDetailStyle.shadowLayer,
                ]}>
                <MotiView
                    from={{
                        translateX: 0,
                        translateY: 0,
                        opacity: 0.2,
                    }}
                    animate={{
                        opacity: 0.5,
                        translateY: -10,
                        translateX: 10,
                    }}
                    transition={{
                        damping: 12,
                        stiffness: 150,
                        mass: 0.8,
                        type: 'spring',
                        delay: 600,
                    }}
                    style={[
                        StyleSheet.absoluteFillObject,
                        NFTDetailStyle.innerShadowLayer,
                    ]}
                />
            </MotiView>
            <AppImage
                uri={uri}
                networkImage={uriNetwork}
                styleImage={NFTDetailStyle.image}
                styleNetworkImage={NFTDetailStyle.network}
                isLoading={isLoading}
                setIsLoading={setLoadings}
                defaultImage={appImages.NFTDefault}
                loadingHeight={loadingHeight}
                containerStyle={[appStyles.backgroundWhite, appStyles.bor4]}
            />
        </View>
    );
};

const NFTImportContent = ({
    handleCopyToClipboard,
    setContractAddress,
    contractAddress,
    idNFT,
    onScanQR,
    setIdNFT,
    usingWithEVM = false,
}: NFTImportContentProps) => {
    const theme = useAppTheme();
    const { t } = useTranslation();
    const insets = useAppSafeAreaInsets();
    const NFTImportStyle = useNFTImportStyles(insets);
    return (
        <View style={NFTImportStyle.flex1}>
            <View style={[NFTImportStyle.mt15, appStyles.pH25]}>
                <AppText
                    titleWithI18n={t(LanguageKey.nft_contract_address)}
                    variant={TextVariantKeys.bodyRSmall}
                    textColor={theme.colors.text_on_surface_text_medium}
                />
                <View
                    style={[
                        NFTImportStyle.flexRow,
                        NFTImportStyle.alignItemsCenter,
                        NFTImportStyle.justifyContentBetween,
                    ]}>
                    <View style={NFTImportStyle.flex1}>
                        <TextInput
                            numberOfLines={1}
                            onChangeText={setContractAddress}
                            value={contractAddress}
                            mode={InputMode.outlined}
                            outlineColor={theme.colors.surface_surface_default}
                            activeOutlineColor={
                                theme.colors.surface_surface_default
                            }
                            placeholder={t(LanguageKey.nft_contract_address)}
                            selectionColor={
                                theme.colors.text_on_surface_text_highest
                            }
                            style={[
                                NFTImportStyle.inputAddressContainer,
                                {
                                    backgroundColor:
                                        theme.colors.surface_surface_default,
                                },
                            ]}
                            contentStyle={[NFTImportStyle.inputAddressContent]}
                            right={
                                contractAddress.length > 0 ? (
                                    <TextInput.Icon
                                        icon={'close'}
                                        onPress={() => {
                                            setContractAddress('');
                                        }}
                                    />
                                ) : null
                            }
                        />
                    </View>
                    <AppButton
                        onPress={handleCopyToClipboard}
                        titleWithI18n={LanguageKey.common_text_paste}
                        textVariant={TextVariantKeys.bodyMMedium}
                        textColor={appColors.main.tokyoRed}
                    />
                    <TouchableOpacity
                        style={NFTImportStyle.scanIcon}
                        onPress={onScanQR}>
                        <ScanSvgIcon />
                    </TouchableOpacity>
                </View>
                <View style={NFTImportStyle.mt15}>
                    {usingWithEVM && (
                        <AppTextInput
                            labelName={t(LanguageKey.common_id)}
                            required
                            placeholder={t(LanguageKey.common_enter_id)}
                            styleTextInput={[
                                NFTImportStyle.enterId,
                                {
                                    backgroundColor:
                                        theme.colors.surface_surface_high,
                                    color: theme.colors
                                        .text_on_surface_text_high,
                                },
                            ]}
                            value={idNFT}
                            onChangeText={setIdNFT}
                            keyboardType="numeric"
                        />
                    )}
                </View>
            </View>
        </View>
    );
};

const SendNFTSkeletonLoading: React.FC<SendNFTSkeletonLoadingType> = ({
    isHasQuantity,
}) => {
    const insets = useSafeAreaInsets();
    const NFTSendStyle = useNFTSendStyles(insets);
    const getSizePercent = (percent: number) => {
        return (SCREEN_WIDTH * percent) / 100;
    };

    return (
        <View
            style={[NFTSendStyle.flex1, NFTSendStyle.pH25, NFTSendStyle.pT15]}>
            <View
                style={[
                    NFTSendStyle.flexRow,
                    NFTSendStyle.justifyContentBetween,
                    NFTSendStyle.backgroundNFTInformationSkeleton,
                ]}>
                <AppSkeletonLoading
                    width={getSizePercent(27)}
                    height={getSizePercent(27)}
                />
                <View style={[NFTSendStyle.justifyContentCenter]}>
                    <AppSkeletonLoading
                        width={getSizePercent(50)}
                        height={24}
                    />
                    <View style={NFTSendStyle.mv10}>
                        <AppSkeletonLoading
                            width={getSizePercent(45)}
                            height={20}
                        />
                    </View>
                    <AppSkeletonLoading
                        width={getSizePercent(25)}
                        height={20}
                    />
                </View>
            </View>

            <View style={[NFTSendStyle.mt25]}>
                <AppSkeletonLoading width={getSizePercent(30)} height={16} />
            </View>
            <View style={[NFTSendStyle.mt5, NFTSendStyle.shadowBox]}>
                <AppSkeletonLoading width={getSizePercent(87)} height={44} />
            </View>
            {isHasQuantity && (
                <>
                    <View style={[NFTSendStyle.mt15]}>
                        <AppSkeletonLoading
                            width={getSizePercent(30)}
                            height={16}
                        />
                    </View>
                    <View style={[NFTSendStyle.mt5, NFTSendStyle.shadowBox]}>
                        <AppSkeletonLoading
                            width={getSizePercent(87)}
                            height={44}
                        />
                    </View>
                </>
            )}
        </View>
    );
};

const DeleteNFTModal = ({
    showModal,
    onConfirm,
    onCancel,
    detailName,
    usingTonView = false,
    indexNFT,
}: DeleteNFTModalType) => {
    const { t } = useTranslation();
    const theme = useAppTheme();
    const insets = useAppSafeAreaInsets();
    const NFTDetailStyle = useStyles(theme, insets);
    return (
        <AppModal
            visible={showModal}
            titleWithI18n={LanguageKey.nft_removing}
            subTitle={
                usingTonView
                    ? `${t(LanguageKey.nft_ton_remove_confirm, {
                          indexNFT: indexNFT,
                          collectionName: detailName,
                      })}?`
                    : `${t(LanguageKey.nft_remove_confirm)} ${detailName}?`
            }
            buttonTitleWithI18n={LanguageKey.common_yes}
            buttonTitleWithI18n2={LanguageKey.common_text_cancel}
            textButtonSecondColor={theme.colors.text_on_surface_text_brand_2}
            buttonSecondContainerStyle={
                GlobalUtils.getEnableRedXNewTheme()
                    ? undefined
                    : NFTDetailStyle.cancelButton
            }
            onPress={onConfirm}
            onPress2={onCancel}
            twoOptions
        />
    );
};

export {
    BottomSheetMenu,
    DeleteNFTModal,
    MenuOptionIcon,
    NFTImportContent,
    SendNFTSkeletonLoading,
    TopContentNFTDetails,
};
