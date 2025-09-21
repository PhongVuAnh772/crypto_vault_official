import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { Avatar } from 'react-native-paper';
import AppImage from 'src/components/common/AppImage';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import {
    ArrowRightSvgIcon,
    UnVerifyFullFillSvgIcon,
    VerifyFullFillSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import { UnAddedNFTListType } from 'src/core/redux/slice/NFT/NFTImport.type';
import appStyles from 'src/core/styles';
import GlobalUtils from 'src/core/utils/globalUtils';
import useStyle from './style';

type Props = {
    collection: UnAddedNFTListType;
    handlingCheckingSpam: (collection: UnAddedNFTListType) => void;
    handlingCollectionArchivedNavigating: (
        collection: UnAddedNFTListType,
    ) => void;
    isArchived: boolean;
};
const EVMNFTitem: React.FC<Props> = ({
    collection,
    handlingCheckingSpam,
    handlingCollectionArchivedNavigating,
    isArchived,
}) => {
    const theme = useAppTheme();
    const styles = useStyle(theme);
    const { t } = useTranslation();
    const newUI = GlobalUtils.getEnableRedXNewTheme();

    return (
        <Pressable
            onPress={() => {
                if (isArchived) {
                    handlingCollectionArchivedNavigating(collection);
                } else {
                    handlingCheckingSpam(collection);
                }
            }}>
            <View
                style={[
                    appStyles.flexRow,
                    appStyles.flex1,
                    appStyles.alignItemsCenter,
                    appStyles.justifyContentCenter,
                ]}>
                <View style={styles.logoCollection}>
                    {collection.collection_logo ? (
                        <AppImage
                            uri={collection.collection_logo}
                            styleImage={styles.logoCollection}
                            resizeMode="cover"
                        />
                    ) : (
                        <Avatar.Text
                            size={24}
                            label={
                                collection.name
                                    ? collection.name.slice(0, 1)
                                    : 'R'
                            }
                            style={styles.logoCollectionText}
                            labelStyle={styles.logoCollectionTextLabel}
                            maxFontSizeMultiplier={1.4}
                        />
                    )}
                </View>
                <View style={[appStyles.flex1, appStyles.ph12]}>
                    <AppText
                        titleWithI18n={
                            collection.name ||
                            t(LanguageKey.nft_unnamed_collection)
                        }
                        variant={TextVariantKeys.bodyRMedium}
                        textColor={theme.colors.text_on_surface_text_highest}
                        numberOfLines={1}
                        allowFontScaling={true}
                        maxFontSizeMultiplier={1.4}
                    />
                    <View style={[appStyles.mv5, appStyles.flexRow]}>
                        {collection.verified_collection ? (
                            <View
                                style={[
                                    styles.pV2,
                                    styles.pH6,
                                    styles.verifiedContainer,
                                    appStyles.flexRow,
                                    appStyles.alignItemsCenter,
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
                                    styles.pV2,
                                    styles.pH6,
                                    styles.unVerifiedContainer,
                                    appStyles.flexRow,
                                    appStyles.alignItemsCenter,
                                ]}>
                                <UnVerifyFullFillSvgIcon
                                    color={appColors.neutral.white}
                                    width="14"
                                    height="14"
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
                        {collection.possible_spam && (
                            <View
                                style={[
                                    styles.pV2,
                                    styles.pH6,
                                    appStyles.ml10,
                                    styles.spamContainer,
                                    appStyles.flexRow,
                                    appStyles.alignItemsCenter,
                                    appStyles.justifyContentCenter,
                                ]}>
                                <UnVerifyFullFillSvgIcon
                                    color={appColors.neutral.white}
                                    width="14"
                                    height="14"
                                />
                                <AppText
                                    titleWithI18n={
                                        LanguageKey.un_added_nfts_unverified_spam
                                    }
                                    styles={appStyles.ml5}
                                    variant={TextVariantKeys.bodyMTiny}
                                    textColor={appColors.neutral.white}
                                    numberOfLines={1}
                                />
                            </View>
                        )}
                    </View>
                </View>
                <ArrowRightSvgIcon
                    color={
                        newUI
                            ? theme.colors.text_on_surface_text_light
                            : theme.colors.text_on_surface_text_medium
                    }
                    width="27"
                    height="27"
                />
            </View>
        </Pressable>
    );
};

export default EVMNFTitem;
