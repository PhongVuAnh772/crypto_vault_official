import { t } from 'i18next';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';
import Canvas from 'react-native-canvas';
import AppButton from 'src/components/common/AppButton';
import AppButtonSVG from 'src/components/common/AppButtonSvg';
import AppImage from 'src/components/common/AppImage';
import AppModal from 'src/components/common/AppModal';
import AppText from 'src/components/common/AppText';
import SvgView from 'src/components/SvgBox';
import appColors from 'src/core/constants/AppColors';
import {
    EmptyTransactionSvgIcon,
    NotFoundSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import { appImages } from 'src/core/constants/AppImages';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import Utils from 'src/core/utils/commonUtils';
import GlobalUtils from 'src/core/utils/globalUtils';
import WalletUtils from 'src/core/utils/walletUtils';
import { LoadingWrapper } from '../../bottomTab/NFTCollection/NFTCollectionTab/components/NFTCollection.components';
import useNFTImportStyles from '../../NFTCollection/evm/NFTImport/NFTImport.style';
import {
    ProtocolNFTView,
    renderNFTYouConfirmList,
} from '../confirm/confirmClaimToken.component';
import { useStyles as confirmClaimTokenStyles } from '../confirm/confirmClaimToken.style';
import { useStyles } from './NFTYouOwn.style';
import {
    CollectionDetailNFTProps,
    LoadingListNFTOwnViewProps,
    ProjectDetailChildProps,
    ProjectInformationProps,
    RenderNFTYouOwnListNewProps,
    TotalClaimingFooterProps,
} from './NFTYouOwn.type';

export const TotalClaimingFooter: React.FC<TotalClaimingFooterProps> = ({
    total,
    theme,
    loading,
}) => {
    const { t } = useTranslation();
    return (
        <View
            style={[
                appStyles.justifyContentBetween,
                appStyles.alignItemsCenter,
                appStyles.flexRow,
                appStyles.pT15,
                {
                    borderTopWidth: 0.6,
                    borderTopColor: theme.colors.outline_outine,
                },
            ]}>
            <View>
                <AppText
                    titleWithI18n={LanguageKey.confirm_claim_total_claim}
                    variant={TextVariantKeys.titleSmall}
                    textColor={theme.colors.text_on_surface_text_highest}
                />
                <AppText
                    title={`(${t(LanguageKey.confirm_claim_JETTON_token)})`}
                    variant={TextVariantKeys.bodyRSmall}
                    textColor={theme.colors.text_on_surface_text_highest}
                    styles={appStyles.pV10}
                />
            </View>
            <LoadingWrapper
                loading={loading}
                skeletonWidth={100}
                skeletonHeight={15}>
                <AppText
                    title={total?.toLocaleString()}
                    variant={TextVariantKeys.titleSmall}
                    textColor={appColors.main.tokyoRed}
                />
            </LoadingWrapper>
        </View>
    );
};

export const ProjectInformation: React.FC<ProjectInformationProps> = ({
    theme,
    project_name,
    wallet_1,
    recipient_address,
}) => {
    const styles = confirmClaimTokenStyles(theme);
    return (
        <View style={styles.project}>
            <View
                style={[
                    appStyles.justifyContentBetween,
                    appStyles.alignItemsCenter,
                    appStyles.flexRow,
                ]}>
                <AppText
                    titleWithI18n={LanguageKey.confirm_claim_project_name}
                    variant={TextVariantKeys.bodyMMedium}
                    textColor={theme.colors.text_on_surface_text_light}
                />
                <AppText
                    title={project_name}
                    variant={TextVariantKeys.titleSmall}
                    textColor={theme.colors.text_on_surface_text_highest}
                />
            </View>

            <View
                style={[
                    appStyles.justifyContentBetween,
                    appStyles.alignItemsCenter,
                    appStyles.flexRow,
                ]}>
                <AppText
                    titleWithI18n={LanguageKey.confirm_claim_recipient_address}
                    variant={TextVariantKeys.bodyMMedium}
                    textColor={theme.colors.text_on_surface_text_light}
                />
                <AppText
                    title={WalletUtils.getShortAddress(recipient_address)}
                    variant={TextVariantKeys.bodyMLarge}
                    textColor={theme.colors.text_on_surface_text_highest}
                />
            </View>
        </View>
    );
};

export const CollectionDetailNFT: React.FC<CollectionDetailNFTProps> = ({
    information,
    actionCollecting,
    cancelAction,
    statusModal,
    theme,
    setItemYouOwnSelected,
    handleSubmitImport,
    loadingHandle,
    setLoadingHandle,
    checkingExistingInCollection,
    isExistingInCollection,
    handleGetImage,
    image,
    canvasRef,
    actionHideStatus,
}) => {
    const styles = useStyles(theme);
    useEffect(() => {
        checkingExistingInCollection();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        if (information?.image?.startsWith('data:image/')) {
            handleGetImage();
        } else {
            return;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const insets = useAppSafeAreaInsets();
    const NFTImportStyle = useNFTImportStyles(insets);
    return (
        <AppModal
            titleWithI18n={`${t(LanguageKey.nft_id)}: #${information?.nftId}`}
            keepBottomButton={false}
            visible={statusModal}
            footerView={
                <View style={styles.NFTAddingContainer}>
                    <AppImage
                        uri={
                            information?.image?.startsWith('data:image/')
                                ? image
                                : information?.image
                        }
                        styleImage={styles.imageTokenNFT}
                        defaultImage={appImages.NFTDefault}
                    />
                    {information?.image?.startsWith('data:image/') && (
                        <View style={NFTImportStyle.hideCanvas}>
                            <Canvas ref={canvasRef} />
                        </View>
                    )}
                    <View style={NFTImportStyle.hideCanvas}>
                        <Canvas ref={canvasRef} />
                    </View>
                    <View style={appStyles.mt25}>
                        {isExistingInCollection ? null : newUI ? (
                            <AppButtonSVG
                                onPress={handleSubmitImport}
                                titleWithI18n={
                                    loadingHandle
                                        ? ''
                                        : LanguageKey.add_nft_to_my_collection
                                }
                                textColor={
                                    theme.colors.text_on_surface_text_invert
                                }
                                styles={styles.buttonModal_continue}
                                textVariant={TextVariantKeys.bodyMMedium}
                                disabled={loadingHandle}
                                icon={
                                    loadingHandle && (
                                        <ActivityIndicator
                                            color={theme.colors.backdrop}
                                            size="small"
                                        />
                                    )
                                }
                                SvgView={SvgView.button}
                            />
                        ) : (
                            <AppButton
                                onPress={handleSubmitImport}
                                titleWithI18n={
                                    loadingHandle
                                        ? ''
                                        : LanguageKey.add_nft_to_my_collection
                                }
                                textColor={
                                    theme.colors.text_on_surface_text_invert
                                }
                                styles={styles.buttonModal_continue}
                                textVariant={TextVariantKeys.bodyMMedium}
                                disabled={loadingHandle}
                                icon={
                                    loadingHandle && (
                                        <ActivityIndicator
                                            color={theme.colors.backdrop}
                                            size="small"
                                        />
                                    )
                                }
                            />
                        )}

                        {newUI ? (
                            <AppButtonSVG
                                onPress={actionHideStatus}
                                titleWithI18n={LanguageKey.cancel}
                                textColor={
                                    theme.colors.text_on_surface_text_brand_2
                                }
                                backgroundColor={
                                    theme.colors.surface_surface_high
                                }
                                borderWidth={1}
                                borderColor={
                                    theme.colors.text_on_surface_text_brand_2
                                }
                                textVariant={TextVariantKeys.bodyMMedium}
                                SvgView={SvgView.button}
                            />
                        ) : (
                            <AppButton
                                onPress={actionHideStatus}
                                titleWithI18n={LanguageKey.cancel}
                                textColor={
                                    theme.colors.text_on_surface_text_brand_2
                                }
                                styles={styles.buttonModal_cancel}
                                textVariant={TextVariantKeys.bodyMMedium}
                            />
                        )}
                    </View>
                </View>
            }
        />
    );
};

export const ProjectDetailChild: React.FC<ProjectDetailChildProps> = ({
    theme,
    dataClaimable,
    dataGetOwned,
    insets,
    loading,
    totalClaim,
}) => {
    const styles = confirmClaimTokenStyles(theme);
    return (
        <View style={styles.project}>
            <FlatList
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                data={dataGetOwned}
                renderItem={({ item }) =>
                    renderNFTYouConfirmList(
                        item,
                        theme,
                        dataClaimable,
                        insets,
                        loading,
                        true,
                    )
                }
                ListEmptyComponent={
                    <View style={[appStyles.center]}>
                        <View style={[appStyles.mt30, appStyles.mbt10]}>
                            <EmptyTransactionSvgIcon
                                color={appColors.neutral.n600}
                            />
                        </View>
                        <AppText
                            titleWithI18n={
                                LanguageKey.claim_token_detail_empty_title
                            }
                            textColor={theme.colors.text_on_surface_text_medium}
                            variant={TextVariantKeys.bodyRMedium}
                        />
                    </View>
                }
                ListFooterComponent={
                    <TotalClaimingFooter
                        total={totalClaim}
                        theme={theme}
                        loading={loading}
                    />
                }
            />
        </View>
    );
};

export const RenderNFTYouOwnListNew: React.FC<RenderNFTYouOwnListNewProps> = ({
    item,
    theme,
    dataClaimable,
    handleOpenNFTSelectedModal,
    t,
    loading,
    inModal = false,
}) => {
    const styles = useStyles(theme);

    return (
        <View style={[appStyles.flexRow, appStyles.mv10]}>
            <View
                style={[
                    appStyles.justifyContentBetween,
                    appStyles.alignItemsCenter,
                    appStyles.flex1,
                    appStyles.flexRow,
                ]}>
                <View style={[appStyles.flex1]}>
                    <View
                        style={[
                            appStyles.flex5,
                            appStyles.pL10,
                            appStyles.flexRow,
                            appStyles.justifyContentBetween,
                            appStyles.alignItemsCenter,
                        ]}>
                        <LoadingWrapper
                            loading={loading}
                            skeletonWidth={150}
                            skeletonHeight={15}>
                            <View
                                style={[
                                    appStyles.flexRow,
                                    appStyles.alignItemsCenter,
                                ]}>
                                <AppText
                                    title={`#${item?.nftId}`}
                                    variant={TextVariantKeys.bodyMLarge}
                                    textColor={
                                        !inModal
                                            ? theme.colors
                                                  .text_on_surface_text_highest
                                            : theme.colors
                                                  .text_on_surface_text_high
                                    }
                                    numberOfLines={1}
                                    maxFontSizeMultiplier={1.2}
                                />
                                <View style={appStyles.ml5}>
                                    {dataClaimable?.projectNftProtocol
                                        ?.name && (
                                        <View
                                            style={[
                                                appStyles.ml5,
                                                dataClaimable
                                                    ?.projectNftProtocol?.name
                                                    ?.length > 16
                                                    ? styles.protocolNFTViewContainer
                                                    : undefined,
                                            ]}>
                                            <ProtocolNFTView
                                                loading={loading}
                                                theme={theme}
                                                protocol_name={
                                                    dataClaimable
                                                        ?.projectNftProtocol
                                                        ?.name
                                                }
                                                project_image={
                                                    dataClaimable
                                                        ?.projectNftProtocol
                                                        ?.logo
                                                }
                                            />
                                        </View>
                                    )}
                                </View>
                            </View>
                        </LoadingWrapper>

                        <LoadingWrapper
                            loading={loading}
                            skeletonWidth={50}
                            containerSkeleton={appStyles.ml10}
                            skeletonHeight={15}>
                            <AppText
                                title={`${Utils.formattedAmountClaim(item?.amount)}`}
                                variant={TextVariantKeys.bodyMLarge}
                                textColor={appColors.main.tokyoRed}
                                styles={appStyles.mbt5}
                                maxFontSizeMultiplier={1.2}
                                numberOfLines={1}
                            />
                        </LoadingWrapper>
                    </View>
                    <View
                        style={[
                            appStyles.flex5,
                            appStyles.pL10,
                            appStyles.flexRow,
                            appStyles.justifyContentBetween,
                            appStyles.alignItemsCenter,
                        ]}>
                        <LoadingWrapper
                            loading={loading}
                            skeletonWidth={100}
                            skeletonHeight={15}>
                            <AppText
                                title={dataClaimable?.projectNFT?.name}
                                variant={TextVariantKeys.bodyMSmall}
                                textColor={
                                    !inModal
                                        ? appColors.main.tokyoRed
                                        : theme.colors
                                              .text_on_surface_text_light
                                }
                                maxFontSizeMultiplier={1.2}
                                numberOfLines={1}
                            />
                        </LoadingWrapper>

                        <LoadingWrapper
                            loading={loading}
                            skeletonWidth={50}
                            skeletonHeight={30}>
                            <Pressable
                                onPress={() => handleOpenNFTSelectedModal(item)}
                                style={{
                                    paddingVertical: 4,
                                    paddingHorizontal: 12,
                                    backgroundColor:
                                        theme.colors.label_surface_button_light,
                                    borderRadius: 4,
                                }}>
                                <AppText
                                    titleWithI18n={LanguageKey.common_text_view}
                                    variant={TextVariantKeys.bodyMLarge}
                                    textColor={
                                        theme.colors.text_on_surface_text_high
                                    }
                                    numberOfLines={1}
                                    maxFontSizeMultiplier={1.2}
                                />
                            </Pressable>
                        </LoadingWrapper>
                    </View>
                </View>
            </View>
        </View>
    );
};

export const LoadingListNFTOwnView: React.FC<LoadingListNFTOwnViewProps> = ({
    isLoading,
    refreshing,
    onRefresh,
}) => {
    const theme = useAppTheme();
    const styles = useStyles(theme);
    const insets = useAppSafeAreaInsets();
    const NFTImportStyle = useNFTImportStyles(insets);
    const renderItemLoading = () => {
        return (
            <View
                style={[
                    appStyles.flexRow,
                    appStyles.mv10,
                    styles.containerLoading,
                    appStyles.pV10,
                    appStyles.alignItemsCenter,
                    appStyles.justifyContentBetween,
                    appStyles.flex1,
                ]}>
                <View
                    style={[
                        appStyles.justifyContentBetween,
                        appStyles.alignItemsCenter,
                        appStyles.flexRow,
                        appStyles.flex1,
                    ]}>
                    <View>
                        <View
                            style={[
                                appStyles.flex5,
                                appStyles.pH10,
                                appStyles.flexRow,
                                appStyles.justifyContentBetween,
                                appStyles.alignItemsCenter,
                                appStyles.flex1,
                                appStyles.fullWidth,
                            ]}>
                            <View
                                style={[
                                    appStyles.flexRow,
                                    appStyles.alignItemsCenter,
                                ]}>
                                <LoadingWrapper
                                    loading={true}
                                    skeletonWidth={100}
                                    skeletonHeight={20}>
                                    <View />
                                </LoadingWrapper>
                            </View>

                            <LoadingWrapper
                                loading={true}
                                skeletonWidth={73}
                                containerSkeleton={appStyles.ml10}
                                skeletonHeight={20}>
                                <View />
                            </LoadingWrapper>
                        </View>
                        <View
                            style={[
                                appStyles.flex5,
                                appStyles.pH10,
                                appStyles.flexRow,
                                appStyles.justifyContentBetween,
                                appStyles.alignItemsCenter,
                                appStyles.flex1,
                                appStyles.fullWidth,
                                appStyles.pT10,
                            ]}>
                            <LoadingWrapper
                                loading={true}
                                skeletonWidth={140}
                                skeletonHeight={20}>
                                <View />
                            </LoadingWrapper>

                            <LoadingWrapper
                                loading={true}
                                skeletonWidth={53}
                                skeletonHeight={28}>
                                <View />
                            </LoadingWrapper>
                        </View>
                    </View>
                </View>
            </View>
        );
    };
    const getView = () => {
        if (!isLoading) {
            return (
                <View style={styles.viewContainer}>
                    <NotFoundSvgIcon style={NFTImportStyle.noAssetFoundIcon} />
                    <AppText
                        titleWithI18n={LanguageKey.nft_you_own_empty_list}
                        variant={TextVariantKeys.bodyRMedium}
                        styles={[
                            NFTImportStyle.titleNoAssetFound,
                            appStyles.pT15,
                            appStyles.textAlignCenter,
                        ]}
                    />
                </View>
            );
        }
        return (
            <View style={styles.containerLoadingListNFTOwnViewList}>
                <FlatList
                    data={[1, 2, 3]}
                    renderItem={renderItemLoading}
                    scrollEnabled={false}
                />
            </View>
        );
    };

    return getView();
};
