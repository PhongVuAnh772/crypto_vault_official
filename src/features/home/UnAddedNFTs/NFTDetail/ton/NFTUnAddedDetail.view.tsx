import React from 'react';
import {
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
    View,
} from 'react-native';
import { ScreenWrapper } from 'src/components';
import AppButton from 'src/components/common/AppButton';
import AppButtonSVG from 'src/components/common/AppButtonSvg';
import AppText from 'src/components/common/AppText';
import SvgView from 'src/components/SvgBox';
import appColors from 'src/core/constants/AppColors';
import { CheckSvgIcon, Copy2SvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import walletUtils from 'src/core/utils/walletUtils';
import { AvatarTonNFT } from 'src/features/home/NFTCollection/ton/NFTTonDetail/NFTTonDetail.components';
import NFTUnAddedDetailStyles from '../index.style';
import useNFTUnAddedDetailEVM from './NFTUnAddedDetail.hook';
import { NFTUnAddedDetailTonViewProps } from './NFTUnAddedDetail.type';

const NFTUnAddedDetailEVMView: React.FC<NFTUnAddedDetailTonViewProps> = ({
    navigation,
    detail,
    added,
    archived,
}) => {
    const {
        insets,
        handleAddNFT,
        loadingHandle,
        currentProtocol,
        handlePressURL,
        copyAction,
        isTon,
        lastPreview,
        theme,
        newUI,
    } = useNFTUnAddedDetailEVM({
        navigation,
        detail,
    });
    const NFTUnAddedDetailStyle = NFTUnAddedDetailStyles(insets, theme);
    return (
        <ScreenWrapper
            enableHeader
            paddingTop
            mainStyle={[NFTUnAddedDetailStyle.flex1]}
            headerTitleWithI18n={LanguageKey.un_added_nfts_nft_you_own}
            headerTextVariant={TextVariantKeys.titleLarge}
            backgroundColor={
                newUI ? appColors.main.tokyoRed : appColors.neutral.n100
            }
            backButtonColor={newUI ? appColors.neutral.white : undefined}
            headerTextColor={newUI ? appColors.neutral.white : undefined}>
            <ScrollView style={NFTUnAddedDetailStyle.containerUnAddedDetail}>
                <View style={NFTUnAddedDetailStyle.boxUnAddedDetail}>
                    <View style={[NFTUnAddedDetailStyle.content]}>
                        <AvatarTonNFT
                            uri={lastPreview?.url ?? detail.metadata?.image}
                            uriNetwork={currentProtocol?.logo ?? ''}
                        />
                        {isTon && added && (
                            <View
                                style={[
                                    NFTUnAddedDetailStyle.pV2,
                                    NFTUnAddedDetailStyle.pH6,
                                    NFTUnAddedDetailStyle.addedContainer,
                                    appStyles.flexRow,
                                    appStyles.alignItemsCenter,
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
                                    variant={TextVariantKeys.bodyMSmall}
                                    textColor={appColors.neutral.white}
                                    numberOfLines={1}
                                    allowFontScaling={true}
                                    maxFontSizeMultiplier={1.4}
                                />
                            </View>
                        )}
                        <View style={NFTUnAddedDetailStyle.p16}>
                            <View style={NFTUnAddedDetailStyle.nameAndId}>
                                <AppText
                                    titleWithI18n={`${detail?.metadata?.name ?? LanguageKey.un_added_nfts_unnamed_nft}`}
                                    variant={TextVariantKeys.titleLarge}
                                    textColor={appColors.neutral.n800}
                                />
                                <AppText
                                    title={`#${detail.index}`}
                                    variant={TextVariantKeys.bodyMMedium}
                                    textColor={appColors.main.tokyoRed}
                                    styles={NFTUnAddedDetailStyle.mt5}
                                />
                            </View>

                            <View style={NFTUnAddedDetailStyle.information}>
                                <AppText
                                    titleWithI18n={
                                        LanguageKey.nft_asset_contract
                                    }
                                    variant={TextVariantKeys.bodyRMedium}
                                    textColor={appColors.neutral.n800}
                                    styles={NFTUnAddedDetailStyle.tokenStandard}
                                />
                                <View
                                    style={[
                                        appStyles.flexRow,
                                        appStyles.alignItemsCenter,
                                    ]}>
                                    <TouchableOpacity onPress={handlePressURL}>
                                        <AppText
                                            title={walletUtils.getShortAddress(
                                                detail?.address?.toString() ??
                                                    '',
                                            )}
                                            variant={
                                                TextVariantKeys.bodyMMedium
                                            }
                                            textColor={appColors.main.tokyoRed}
                                            styles={
                                                NFTUnAddedDetailStyle.underline
                                            }
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={copyAction}
                                        style={appStyles.ml5}>
                                        <Copy2SvgIcon width={20} height={20} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {isTon && (
                                <View style={NFTUnAddedDetailStyle.information}>
                                    <AppText
                                        titleWithI18n={
                                            LanguageKey.common_collection
                                        }
                                        variant={TextVariantKeys.bodyRMedium}
                                        textColor={appColors.neutral.n800}
                                        styles={[
                                            NFTUnAddedDetailStyle.tokenStandard,
                                            NFTUnAddedDetailStyle.widthHalf,
                                            appStyles.flex1,
                                        ]}
                                    />
                                    <AppText
                                        title={detail.collection?.name || '-'}
                                        variant={TextVariantKeys.bodyMMedium}
                                        textColor={appColors.neutral.n800}
                                        styles={[
                                            appStyles.textAlignRight,
                                            NFTUnAddedDetailStyle.widthHalf,
                                            appStyles.flex1,
                                        ]}
                                    />
                                </View>
                            )}

                            {isTon && (
                                <View style={NFTUnAddedDetailStyle.information}>
                                    <AppText
                                        titleWithI18n={LanguageKey.common_index}
                                        variant={TextVariantKeys.bodyRMedium}
                                        textColor={appColors.neutral.n800}
                                        styles={
                                            NFTUnAddedDetailStyle.tokenStandard
                                        }
                                    />
                                    <AppText
                                        title={`${detail?.index}`}
                                        variant={TextVariantKeys.bodyMMedium}
                                        textColor={appColors.neutral.n800}
                                    />
                                </View>
                            )}
                        </View>
                    </View>
                    <View style={NFTUnAddedDetailStyle.description}>
                        <AppText
                            titleWithI18n={LanguageKey.common_descriptions}
                            variant={TextVariantKeys.bodyRMedium}
                            textColor={appColors.neutral.n800}
                            styles={NFTUnAddedDetailStyle.tokenStandard}
                        />
                        <AppText
                            title={detail.metadata?.description ?? ''}
                            variant={TextVariantKeys.bodyMMedium}
                            textColor={appColors.neutral.n800}
                            styles={NFTUnAddedDetailStyle.mt8}
                        />
                    </View>
                </View>
            </ScrollView>
            {!added && !archived && (
                <View style={NFTUnAddedDetailStyle.buttonAddCollection}>
                    {newUI ? (
                        <AppButtonSVG
                            titleWithI18n={
                                loadingHandle
                                    ? ''
                                    : LanguageKey.add_nft_to_my_collection
                            }
                            textVariant={TextVariantKeys.bodyMMedium}
                            textColor={appColors.neutral.white}
                            styles={NFTUnAddedDetailStyle.button}
                            onPress={handleAddNFT}
                            isLoading={loadingHandle}
                            disabled={loadingHandle}
                            icon={
                                loadingHandle ? (
                                    <ActivityIndicator
                                        color={appColors.neutral.black}
                                        size="small"
                                    />
                                ) : null
                            }
                            SvgView={SvgView.button}
                        />
                    ) : (
                        <AppButton
                            titleWithI18n={
                                loadingHandle
                                    ? ''
                                    : LanguageKey.add_nft_to_my_collection
                            }
                            textVariant={TextVariantKeys.bodyMMedium}
                            textColor={appColors.neutral.white}
                            styles={NFTUnAddedDetailStyle.button}
                            onPress={handleAddNFT}
                            isLoading={loadingHandle}
                            disabled={loadingHandle}
                            icon={
                                loadingHandle ? (
                                    <ActivityIndicator
                                        color={appColors.neutral.black}
                                        size="small"
                                    />
                                ) : null
                            }
                        />
                    )}
                </View>
            )}
        </ScreenWrapper>
    );
};

export default NFTUnAddedDetailEVMView;
