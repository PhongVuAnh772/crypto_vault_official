import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    FlatList,
    Pressable,
    RefreshControl,
    ScrollView,
    TouchableOpacity,
    View,
} from 'react-native';
import AppImage from 'src/components/common/AppImage';
import AppText from 'src/components/common/AppText';
import NFTItemStyle from 'src/components/homeComponents/NFTItem/NFTitem.style';
import BottomSheetModal from 'src/components/specific/BottomSheetModal/BottomSheetModal.view';
import appColors from 'src/core/constants/AppColors';
import {
    CheckSvgIcon,
    CoinStacked01SvgIcon,
    ReceiveSvgIcon,
    TrashBinSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import { appImages } from 'src/core/constants/AppImages';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import nftUtils from 'src/core/utils/nftUtils';
import useStyles from 'src/features/home/NFTCollection/evm/NFTDetail/NFTDetail.style';
import { LoadingWrapper } from '../../bottomTab/NFTCollection/NFTCollectionTab/components/NFTCollection.components';
import { ProtocolNFTView } from '../../projectDetails/confirm/confirmClaimToken.component';
import NFTCollectionStyle from './NFTCollectionStats.style';
import {
    BottomSheetNFTArchivingType,
    BottomSheetNFTStatsMenuType,
    EmptyNFTCollectionDetailProps,
    NFTCollectionLoadingItemProps,
    NFTCollectionLoadingStatProps,
    NFTItemStatsProps,
} from './NFTCollectionStats.type';

const NFTCollectionLoadingItem: React.FC<NFTCollectionLoadingItemProps> = ({
    item,
    index,
}) => {
    return (
        <View
            style={[
                appStyles.flexRow,
                appStyles.mv10,
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

export const BottomSheetNFTStatsMenu: React.FC<BottomSheetNFTStatsMenuType> = ({
    showModal,
    onClose,
    onConfirm,
    onDismiss,
}) => {
    const theme = useAppTheme();
    const insets = useAppSafeAreaInsets();
    const NFTDetailStyle = useStyles(theme, insets);
    return (
        <BottomSheetModal
            showModal={showModal}
            closeModalAction={onClose}
            maxHeight={0.14}
            onDismiss={onDismiss}
            child={
                <TouchableOpacity
                    style={NFTDetailStyle.removeContainer}
                    onPress={onConfirm}>
                    <TrashBinSvgIcon
                        height={24}
                        width={24}
                        style={NFTDetailStyle.trashBinIcon}
                    />
                    <AppText
                        titleWithI18n={LanguageKey.un_added_nfts_add_all}
                        variant={TextVariantKeys.titleMedium}
                        textColor={appColors.main.tokyoRed}
                    />
                </TouchableOpacity>
            }
        />
    );
};

export const NFTCollectionLoadingStat: React.FC<
    NFTCollectionLoadingStatProps
> = ({ loading, refreshing, onRefresh }) => {
    if (!loading) {
        return (
            <EmptyNFTCollectionDetail
                refreshing={refreshing ?? false}
                onRefresh={onRefresh}
            />
        );
    }
    const styles = NFTCollectionStyle();
    return (
        <View
            style={[appStyles.flex1, styles.containerLoading, appStyles.pH25]}>
            <FlatList
                data={[1, 2, 3, 4, 5, 6]}
                renderItem={({ item, index }) => (
                    <NFTCollectionLoadingItem item={item} index={index} />
                )}
            />
        </View>
    );
};

export const NFTItemStats: React.FC<NFTItemStatsProps> = ({
    item,
    index,
    onPress,
    setIsLoading,
    isLoading,
    selectedProtocol,
    archived,
}) => {
    const theme = useAppTheme();
    const styles = NFTCollectionStyle(theme);
    const { t } = useTranslation();
    return (
        <View
            style={[
                appStyles.flexRow,
                appStyles.fullWidth,
                styles.nftItem,
                appStyles.pV15,
            ]}>
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
                        <View style={appStyles.flex4}>
                            <LoadingWrapper
                                loading={isLoading}
                                skeletonWidth={150}
                                skeletonHeight={15}>
                                <View
                                    style={[
                                        appStyles.flexRow,
                                        appStyles.alignItemsCenter,
                                        styles.seperateTop,
                                    ]}>
                                    <AppText
                                        title={`#${item.token_id}`}
                                        variant={TextVariantKeys.bodyMLarge}
                                        textColor={
                                            theme.colors
                                                .text_on_surface_text_high
                                        }
                                        numberOfLines={1}
                                        maxFontSizeMultiplier={1.2}
                                    />
                                    <View style={appStyles.ml5}>
                                        {selectedProtocol && (
                                            <View
                                                style={[
                                                    appStyles.ml5,
                                                    selectedProtocol?.name
                                                        ?.length > 16
                                                        ? styles.protocolNFTViewContainer
                                                        : undefined,
                                                ]}>
                                                <ProtocolNFTView
                                                    loading={isLoading}
                                                    theme={theme}
                                                    protocol_name={
                                                        selectedProtocol?.name
                                                    }
                                                    project_image={
                                                        selectedProtocol?.logo
                                                    }
                                                />
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </LoadingWrapper>
                            <LoadingWrapper
                                loading={isLoading}
                                skeletonWidth={100}
                                skeletonHeight={15}>
                                <AppText
                                    titleWithI18n={`${item.name || t(LanguageKey.nft_unnamed_collection)}`}
                                    variant={TextVariantKeys.bodyMSmall}
                                    textColor={
                                        theme.colors.text_on_surface_text_light
                                    }
                                    maxFontSizeMultiplier={1.2}
                                    numberOfLines={1}
                                    styles={styles.seperateBottom}
                                />
                            </LoadingWrapper>
                        </View>
                        {archived ? (
                            <Pressable
                                onPress={() => onPress(item)}
                                style={[styles.addedContainer, styles.unAdded]}>
                                <AppText
                                    titleWithI18n={LanguageKey.common_text_view}
                                    styles={appStyles.ml5}
                                    variant={TextVariantKeys.labelSmall}
                                    textColor={appColors.neutral.white}
                                    numberOfLines={1}
                                    allowFontScaling={true}
                                    maxFontSizeMultiplier={1.2}
                                />
                            </Pressable>
                        ) : (
                            <LoadingWrapper
                                loading={isLoading}
                                skeletonWidth={50}
                                skeletonHeight={30}>
                                <View>
                                    {item.active ? (
                                        <Pressable
                                            onPress={() => onPress(item)}
                                            style={[
                                                styles.addedContainer,
                                                styles.added,
                                            ]}>
                                            <CheckSvgIcon
                                                color={appColors.neutral.white}
                                                width="15"
                                                height="15"
                                            />
                                            <AppText
                                                titleWithI18n={
                                                    LanguageKey.common_text_added
                                                }
                                                styles={appStyles.ml5}
                                                variant={
                                                    TextVariantKeys.labelSmall
                                                }
                                                textColor={
                                                    appColors.neutral.white
                                                }
                                                numberOfLines={1}
                                                allowFontScaling={true}
                                                maxFontSizeMultiplier={1.2}
                                            />
                                        </Pressable>
                                    ) : (
                                        <Pressable
                                            onPress={() => onPress(item)}
                                            style={[
                                                styles.addedContainer,
                                                styles.unAdded,
                                            ]}>
                                            <AppText
                                                titleWithI18n={
                                                    LanguageKey.common_text_view
                                                }
                                                variant={
                                                    TextVariantKeys.labelSmall
                                                }
                                                textColor={
                                                    appColors.neutral.white
                                                }
                                                numberOfLines={1}
                                                maxFontSizeMultiplier={1.2}
                                            />
                                        </Pressable>
                                    )}
                                </View>
                            </LoadingWrapper>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
};

export const BottomSheetNFTArchiving = ({
    showModal,
    onClose,
    onDelete,
    onDismiss,
    isArchived,
}: BottomSheetNFTArchivingType) => {
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
                    {isArchived ? (
                        <TrashBinSvgIcon
                            height={24}
                            width={24}
                            style={[
                                NFTDetailStyle.trashBinIcon,
                                {
                                    color: isArchived
                                        ? appColors.main.tokyoRed
                                        : appColors.neutral.black,
                                },
                            ]}
                        />
                    ) : (
                        <ReceiveSvgIcon
                            height={24}
                            width={24}
                            style={[
                                NFTDetailStyle.trashBinIcon,
                                {
                                    color: isArchived
                                        ? appColors.main.tokyoRed
                                        : appColors.neutral.black,
                                },
                            ]}
                        />
                    )}
                    <AppText
                        titleWithI18n={
                            isArchived
                                ? LanguageKey.nft_unarchive_collection
                                : LanguageKey.nft_archive_collection
                        }
                        variant={TextVariantKeys.titleMedium}
                        textColor={
                            isArchived
                                ? appColors.main.tokyoRed
                                : appColors.neutral.black
                        }
                    />
                </TouchableOpacity>
            }
        />
    );
};

const NFTCollectionStatItem = ({
    item,
    index,
    onPress,
    isLoading,
    setIsLoading,
}: NFTItemStatsProps) => {
    const styles = NFTCollectionStyle();

    const metadata = item.metadata ? JSON.parse(item.metadata) : {};
    const containerStyle =
        index % 2 === 0 ? NFTItemStyle.pr8 : NFTItemStyle.pl8;
    const image = nftUtils.convertIpfsUrl(metadata.image ?? '');
    const imageURi = image || '';
    return (
        <View style={NFTItemStyle.itemHalfStat}>
            <AppImage
                uri={imageURi}
                name={`#${item.token_id} ${item.name}`}
                styleImage={NFTItemStyle.avatarDetail}
                containerStyle={[containerStyle, NFTItemStyle.mbt15]}
                showName={true}
                onPress={() => onPress(item)}
                setIsLoading={setIsLoading}
                isLoading={isLoading}
                defaultImage={appImages.NFTDefault}
                resizeMode={'cover'}
                numberOfLines={1}
            />
            {item.active && (
                <View
                    style={[
                        styles.pV2,
                        styles.pH6,
                        styles.spamContainer,
                        appStyles.flexRow,
                        index % 2 === 0 ? { right: 12 } : { right: 5 },
                        appStyles.alignItemsCenter,
                    ]}>
                    <CheckSvgIcon
                        color={appColors.neutral.white}
                        width="15"
                        height="15"
                    />
                    <AppText
                        titleWithI18n={LanguageKey.common_text_added}
                        styles={appStyles.ml5}
                        variant={TextVariantKeys.bodyMSmall}
                        textColor={appColors.neutral.white}
                        numberOfLines={1}
                        allowFontScaling={true}
                        maxFontSizeMultiplier={1.4}
                    />
                </View>
            )}
        </View>
    );
};

export const EmptyNFTCollectionDetail: React.FC = ({
    refreshing,
    onRefresh,
}: EmptyNFTCollectionDetailProps) => {
    const theme = useAppTheme();
    return (
        <ScrollView
            refreshControl={
                <RefreshControl
                    refreshing={refreshing ?? false}
                    onRefresh={onRefresh}
                />
            }
            style={[appStyles.flex1, appStyles.mt55]}>
            <CoinStacked01SvgIcon
                color={appColors.neutral.black}
                style={{ alignSelf: 'center' }}
            />
            <View style={appStyles.mv10}>
                <AppText
                    titleWithI18n={LanguageKey.No_asset_found_title}
                    variant={TextVariantKeys.titleLarge}
                    textColor={
                        theme.colors.text_on_surface_text_medium
                    }
                    styles={appStyles.textAlignCenter}
                />
            </View>
            <AppText
                titleWithI18n={LanguageKey.we_have_found_any_token_title}
                variant={TextVariantKeys.bodyRMedium}
                textColor={
                    theme.colors.text_on_surface_text_light
                }
                styles={appStyles.textAlignCenter}
            />
        </ScrollView>
    );
};

export default NFTCollectionStatItem;
