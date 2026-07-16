import React from 'react';
import { View } from 'react-native';
import AppImage from 'src/components/common/AppImage';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import { appImages } from 'src/core/constants/AppImages';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import NFTInformationStyle from './style';

type NFTInformationType = {
    nftImage: string;
    nftName: string;
    networkImage: string;
    networkName: string;
    nftId: number;
    quantity?: string;
};
const NFTInformation = ({
    nftImage,
    nftName,
    networkImage,
    networkName,
    nftId,
    quantity,
}: NFTInformationType) => {
    return (
        <View
            style={[
                NFTInformationStyle.containerBox,
                { backgroundColor: appColors.neutral.white },
            ]}>
            <AppImage
                uri={nftImage}
                styleImage={NFTInformationStyle.image}
                containerStyle={appStyles.flex0}
                defaultImage={appImages.NFTDefault}
            />
            <View style={[appStyles.ml15, appStyles.flex1]}>
                <AppText
                    title={nftName}
                    variant={TextVariantKeys.titleMedium}
                    textColor={appColors.neutral.n800}
                    numberOfLines={1}
                />
                <View
                    style={[
                        appStyles.flexRow,
                        appStyles.justifyContentBetween,
                        appStyles.alignItemsCenter,
                        appStyles.mt5,
                        appStyles.mbt10,
                    ]}>
                    <View style={appStyles.flex1}>
                        <AppText
                            title={`#${nftId}`}
                            variant={TextVariantKeys.bodyMMedium}
                            textColor={appColors.main.tokyoRed}
                        />
                    </View>
                    {quantity && (
                        <>
                            <View style={NFTInformationStyle.line} />
                            <View style={[appStyles.flex1, appStyles.pl5]}>
                                <AppText
                                    titleWithI18n={
                                        LanguageKey.project_detail_quantity
                                    }
                                    variant={TextVariantKeys.bodyRMedium}
                                    textColor={appColors.neutral.n800}>
                                    <AppText
                                        title={`: ${quantity}`}
                                        variant={TextVariantKeys.bodyRMedium}
                                        textColor={appColors.neutral.n800}
                                    />
                                </AppText>
                            </View>
                        </>
                    )}
                </View>
                <View style={[appStyles.flexRow, appStyles.alignItemsCenter]}>
                    <AppImage
                        uri={networkImage}
                        styleImage={NFTInformationStyle.imageNetwork}
                        containerStyle={[appStyles.flex0, appStyles.mr5]}
                        defaultImage={appImages.NFTDefault}
                    />
                    <AppText
                        title={networkName}
                        variant={TextVariantKeys.bodyRMedium}
                        textColor={appColors.neutral.n800}
                        numberOfLines={1}
                    />
                </View>
            </View>
        </View>
    );
};

export default NFTInformation;
