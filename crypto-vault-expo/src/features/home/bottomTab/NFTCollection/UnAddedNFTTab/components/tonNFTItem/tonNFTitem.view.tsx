import React from 'react';
import { Pressable, View } from 'react-native';
import AppImage from 'src/components/common/AppImage';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import {
    CheckSvgIcon,
    UnVerifyFullFillSvgIcon,
    VerifyFullFillSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import { appImages } from 'src/core/constants/AppImages';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import { Nftitem } from 'src/core/services/TonServices/type';
import appStyles from 'src/core/styles';
import styles from './tonNFTitem.style';

export type TonNFTItemProps = {
    item: Nftitem;
    onPress: (e: Nftitem) => void;
    usingInTab?: boolean;
};

export const TonNFTItem: React.FC<TonNFTItemProps> = ({
    item,
    onPress,
    usingInTab = false,
}) => {
    const theme = useAppTheme();
    const lastPreview = item.previews?.[item.previews.length - 1]?.url;
    return (
        <Pressable onPress={() => onPress(item)}>
            <View
                style={[
                    appStyles.flex1,
                    appStyles.flexRow,
                    appStyles.justifyContentBetween,
                    appStyles.alignItemsCenter,
                ]}>
                <View>
                    <AppImage
                        uri={lastPreview ?? item.metadata.image}
                        styleImage={styles.logoCollection}
                        resizeMode="cover"
                        defaultImage={appImages.NFTDefault}
                    />
                </View>
                <View style={[appStyles.flex1, appStyles.ph12]}>
                    <View style={appStyles.pB8}>
                        <AppText
                            titleWithI18n={
                                item.metadata?.name ??
                                LanguageKey.un_added_nfts_unnamed_nft
                            }
                            styles={[styles.mbt2]}
                            variant={TextVariantKeys.bodyMLarge}
                            textColor={theme.colors.text_on_surface_text_high}
                            numberOfLines={1}
                            allowFontScaling={true}
                            maxFontSizeMultiplier={1.2}
                        />
                    </View>

                    {item.verified ? (
                        <View
                            style={[
                                styles.verifiedNFTContainer,
                                appStyles.flexRow,
                                appStyles.center,
                            ]}>
                            <VerifyFullFillSvgIcon
                                width="14"
                                height="14"
                                color={appColors.neutral.white}
                            />
                            <AppText
                                titleWithI18n={
                                    LanguageKey.un_added_nfts_verified_collection
                                }
                                variant={TextVariantKeys.bodyMTiny}
                                textColor={appColors.neutral.white}
                                styles={[appStyles.ml5]}
                                numberOfLines={1}
                                allowFontScaling={true}
                                maxFontSizeMultiplier={1.2}
                            />
                        </View>
                    ) : (
                        <View
                            style={[
                                styles.unVerifiedNFTContainer,
                                appStyles.flexRow,
                                appStyles.alignItemsCenter,
                            ]}>
                            <UnVerifyFullFillSvgIcon
                                width="15"
                                height="15"
                                color={appColors.neutral.white}
                            />
                            <AppText
                                titleWithI18n={
                                    LanguageKey.un_added_nfts_unverified_collection
                                }
                                variant={TextVariantKeys.bodyMTiny}
                                textColor={appColors.neutral.white}
                                styles={appStyles.ml5}
                                numberOfLines={1}
                                allowFontScaling={true}
                                maxFontSizeMultiplier={1.2}
                            />
                        </View>
                    )}
                </View>
                <View>
                    {item.active ? (
                        <View
                            style={[
                                styles.addedContainer,
                                styles.added,
                                usingInTab && styles.addedBorder,
                            ]}>
                            <CheckSvgIcon
                                color={appColors.neutral.white}
                                width="15"
                                height="15"
                            />
                            <AppText
                                titleWithI18n={LanguageKey.common_text_added}
                                styles={appStyles.ml5}
                                variant={TextVariantKeys.labelSmall}
                                textColor={appColors.neutral.white}
                                numberOfLines={1}
                                allowFontScaling={true}
                                maxFontSizeMultiplier={1.2}
                            />
                        </View>
                    ) : (
                        <View style={[styles.addedContainer, styles.unAdded]}>
                            <AppText
                                titleWithI18n={LanguageKey.common_add}
                                variant={TextVariantKeys.labelSmall}
                                textColor={appColors.neutral.white}
                                numberOfLines={1}
                                allowFontScaling={true}
                                maxFontSizeMultiplier={1.2}
                            />
                        </View>
                    )}
                </View>
            </View>
        </Pressable>
    );
};
export default TonNFTItem;
