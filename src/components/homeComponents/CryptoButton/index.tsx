import React from 'react';
import { Pressable, View } from 'react-native';
import AppText from 'src/components/common/AppText';
import ProtocolImage from 'src/components/specific/ProtocolImage';
import Slip0044 from 'src/core/enum/Slip0044';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import appStyles from 'src/core/styles';
import useStyles from './styles';

type CryptoButtonType = {
    title?: string;
    symbol?: string;
    logoUri?: string | null;
    balanceString?: string;
    baseRateFiatString?: string;
    balanceToCurrencyString?: string;
    onPress?: () => void;
    isDefaultData?: boolean;
    slip0044?: Slip0044;
    decimals?: number;
};

const CryptoButton: React.FC<CryptoButtonType> = ({
    symbol,
    balanceString,
    onPress,
    logoUri,
    title,
    isDefaultData,
    slip0044,
    decimals,
    baseRateFiatString,
    balanceToCurrencyString,
}) => {
    const theme = useAppTheme();
    const styles = useStyles(theme);

    return (
        <Pressable
            onPress={() => {
                if (onPress) {
                    onPress();
                }
            }}
            style={[
                appStyles.flexRow,
                appStyles.alignItemsCenter,
                styles.container,
            ]}>
            <ProtocolImage
                isDefaultData={isDefaultData}
                slip0044={slip0044}
                size={28}
                logoUri={logoUri}
            />
            <View
                style={[
                    appStyles.flex1,
                    appStyles.pL10,
                    appStyles.justifyContentBetween,
                ]}>
                <View>
                    <View
                        style={[appStyles.flexRow, appStyles.alignItemsCenter]}>
                        <AppText
                            title={title}
                            variant={TextVariantKeys.bodyMMedium}
                            textColor={theme.colors.text_on_surface_text_high}
                            numberOfLines={1}
                        />
                        <View
                            style={[
                                appStyles.ml10,
                                styles.shortCurrencyContainer,
                                appStyles.mr10,
                            ]}>
                            <AppText
                                title={symbol}
                                variant={TextVariantKeys.labelTiny}
                                textColor={
                                    theme.colors.text_on_surface_text_medium
                                }
                            />
                        </View>
                    </View>
                    <View style={appStyles.mt5}>
                        <AppText
                            title={baseRateFiatString ?? '-'}
                            variant={TextVariantKeys.bodyMSmall}
                            textColor={theme.colors.text_on_surface_text_light}
                        />
                    </View>
                </View>
            </View>
            <View
                style={[
                    appStyles.alignItemsEnd,
                    appStyles.justifyContentCenter,
                ]}>
                <View style={[appStyles.mt5, appStyles.alignItemsEnd]}>
                    <AppText
                        title={balanceString}
                        variant={TextVariantKeys.titleSmall}
                        textColor={theme.colors.text_on_surface_text_high}
                        styles={appStyles.textAlignRight}
                    />
                    <View style={appStyles.mt5}>
                        <AppText
                            title={balanceToCurrencyString ?? '-'}
                            variant={TextVariantKeys.bodyRSmall}
                            textColor={
                                theme.colors.text_on_surface_text_lightest
                            }
                        />
                    </View>
                </View>
            </View>
        </Pressable>
    );
};

export default CryptoButton;
