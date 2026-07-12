import React from 'react';
import { View } from 'react-native';
import AppText from 'src/components/common/AppText';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import { LoadingWrapper } from '../../bottomTab/explore/explore.component';
import {
    ClaimHistory,
    NFTHistoryType,
    OwnedNFTType,
} from '../../bottomTab/explore/explore.type';

export const renderClaimDetailList = (
    item: ClaimHistory | OwnedNFTType | NFTHistoryType,
    theme: AppThemeType,
    loading = false,
) => {
    return (
        <View style={[appStyles.flexRow, appStyles.mv10]}>
            <View
                style={[
                    appStyles.justifyContentBetween,
                    appStyles.alignItemsCenter,
                    appStyles.flex1,
                    appStyles.flexRow,
                ]}>
                <View
                    style={[
                        appStyles.flex1,
                        appStyles.flexRow,
                        appStyles.justifyContentBetween,
                        appStyles.alignItemsCenter,
                    ]}>
                    <View>
                        <LoadingWrapper
                            loading={loading}
                            skeletonWidth={80}
                            containerSkeleton={appStyles.ml10}
                            skeletonHeight={25}>
                            <View
                                style={[
                                    appStyles.flexRow,
                                    appStyles.alignItemsCenter,
                                ]}>
                                <AppText
                                    title={`NFT ID #${item?.nftId}`}
                                    variant={TextVariantKeys.bodyMMedium}
                                    textColor={
                                        theme.colors.text_on_surface_text_light
                                    }
                                />
                            </View>
                        </LoadingWrapper>
                    </View>

                    <LoadingWrapper
                        loading={loading}
                        skeletonWidth={50}
                        skeletonHeight={15}>
                        <AppText
                            title={`${item?.amount?.toLocaleString()}`}
                            variant={TextVariantKeys.bodyMLarge}
                            textColor={
                                theme.colors.text_on_surface_text_highest
                            }
                        />
                    </LoadingWrapper>
                </View>
            </View>
        </View>
    );
};
