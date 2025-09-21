import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import AppImage from 'src/components/common/AppImage';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import { DoubleArrowRightSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import style from './style';

type CoinInfo = {
    nameToken: string;
    nameProtocol: string;
    imageToken: string;
    imageProtocol: string;
};
type CardTransferProps = {
    lockInfo: CoinInfo;
    earnInfo: CoinInfo;
};

const CardTransfer = ({ lockInfo, earnInfo }: CardTransferProps) => {
    const { t } = useTranslation();

    return (
        <View style={[appStyles.flex1, style.container]}>
            <View style={[appStyles.flexRow, appStyles.justifyContentBetween]}>
                <View style={[appStyles.flex1, appStyles.flexRow]}>
                    <View style={style.labelTitleTokenInfo}>
                        <AppText
                            titleWithI18n={t(LanguageKey.common_text_lock)}
                            variant={TextVariantKeys.bodyMSmall}
                            textColor={appColors.main.tokyoRed}
                        />
                    </View>
                </View>
                <View style={style.separator} />
                <View style={[appStyles.flex1, appStyles.flexRow]}>
                    <View style={style.labelTitleTokenInfo}>
                        <AppText
                            titleWithI18n={t(LanguageKey.common_text_earn)}
                            variant={TextVariantKeys.bodyMSmall}
                            textColor={appColors.main.tokyoRed}
                        />
                    </View>
                </View>
            </View>

            <View
                style={[
                    appStyles.flexRow,
                    appStyles.justifyContentBetween,
                    appStyles.alignItemsCenter,
                ]}>
                <View
                    style={[
                        appStyles.flexRow,
                        appStyles.alignItemsCenter,
                        appStyles.mt5,
                        appStyles.flex1,
                    ]}>
                    <View>
                        <AppImage
                            uri={lockInfo.imageToken}
                            styleImage={appStyles.iconCircleSize24}
                        />
                        <AppImage
                            uri={lockInfo.imageProtocol}
                            styleImage={appStyles.iconCircleSize11}
                            containerStyle={style.containerToken}
                        />
                    </View>
                    <View style={appStyles.ml13}>
                        <AppText
                            title={lockInfo.nameToken}
                            variant={TextVariantKeys.bodyMSmall}
                            textColor={appColors.neutral.n800}
                        />
                        <AppText
                            title={`${t(LanguageKey.common_text_on)}${lockInfo.nameProtocol}`}
                            variant={TextVariantKeys.bodyMTiny}
                            textColor={appColors.neutral.n500}
                        />
                    </View>
                </View>
                <View style={style.separator}>
                    <DoubleArrowRightSvgIcon color={appColors.neutral.n800} />
                </View>
                <View
                    style={[
                        appStyles.flexRow,
                        appStyles.alignItemsCenter,
                        appStyles.mt5,
                        appStyles.flex1,
                    ]}>
                    <View>
                        <AppImage
                            uri={earnInfo.imageToken}
                            styleImage={appStyles.iconCircleSize24}
                        />
                        <AppImage
                            uri={earnInfo.imageProtocol}
                            styleImage={appStyles.iconCircleSize11}
                            containerStyle={style.containerToken}
                        />
                    </View>
                    <View style={appStyles.ml13}>
                        <AppText
                            title={earnInfo.nameToken}
                            variant={TextVariantKeys.bodyMSmall}
                            textColor={appColors.neutral.n800}
                        />
                        <AppText
                            title={`${t(LanguageKey.common_text_on)}${earnInfo.nameProtocol}`}
                            variant={TextVariantKeys.bodyMTiny}
                            textColor={appColors.neutral.n500}
                        />
                    </View>
                </View>
            </View>
        </View>
    );
};

export default CardTransfer;
