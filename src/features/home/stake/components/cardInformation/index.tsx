import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleProp, View, ViewStyle } from 'react-native';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import { GifIconSvg } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import style from './style';

type CardInformationProps = {
    description: string;
    totalAmount: string;
    symbol: string;
    containerStyle?: StyleProp<ViewStyle>;
    titleGift?: string;
    customTitleGift?: string;
};
const CardInformation = ({
    description,
    totalAmount,
    symbol,
    containerStyle,
    titleGift,
    customTitleGift,
}: CardInformationProps) => {
    const { t } = useTranslation();
    return (
        <View style={[style.container, containerStyle]}>
            <AppText
                title={description}
                variant={TextVariantKeys.bodyRSmall}
                textColor={appColors.neutral.n600}
                numberOfLines={3}
            />
            <View style={[appStyles.mt12]}>
                <View
                    style={[
                        style.totalAmountContainer,
                        appStyles.flexRow,
                        appStyles.alignItemsCenter,
                    ]}>
                    <GifIconSvg
                        color={appColors.neutral.n800}
                        style={appStyles.mr5}
                        width={16}
                        height={16}
                    />
                    <AppText
                        titleWithI18n={t(
                            titleGift || LanguageKey.common_text_total,
                        )}
                        variant={TextVariantKeys.bodyMSmall}
                        textColor={appColors.neutral.n800}>
                        <AppText
                            title={
                                customTitleGift || `: ${totalAmount} ${symbol}`
                            }
                            variant={TextVariantKeys.bodyMSmall}
                            textColor={appColors.neutral.n800}
                        />
                    </AppText>
                </View>
            </View>
        </View>
    );
};

export default CardInformation;
