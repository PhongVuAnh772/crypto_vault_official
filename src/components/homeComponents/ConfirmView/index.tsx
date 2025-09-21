import React from 'react';
import { View } from 'react-native';
import AppImage from 'src/components/common/AppImage';
import AppText from 'src/components/common/AppText';
import {
    BitcoinSvgIcon,
    SendDownSvgIcon,
    TonSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import { CoinType } from 'src/core/enum/CoinType';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import useStyles from './styles';

type ModalConfirmType = {
    logoUri?: string | null;
    coinType?: CoinType;
    fromAddress: string;
    fromAmount: string;
    fromSubAmount: string;
    toAddress: string;
    networkFee: string;
    adminFee: string;
    subNetworkFee?: string | null;
    subAdminFee?: string | null;
};

const ConfirmView: React.FC<ModalConfirmType> = props => {
    const {
        logoUri,
        coinType,
        fromAddress,
        fromAmount,
        fromSubAmount,
        toAddress,
        networkFee,
        subNetworkFee,
        adminFee,
        subAdminFee,
    } = props;

    const theme = useAppTheme();

    const styles = useStyles(theme);

    const getIcon = () => {
        if (logoUri) {
            return (
                <AppImage
                    uri={logoUri}
                    styleImage={appStyles.iconCircleSize32}
                />
            );
        }
        switch (coinType) {
            case CoinType.Bitcoin:
                return <BitcoinSvgIcon width={32} height={32} />;
            case CoinType.Ton:
                return <TonSvgIcon width={32} height={32} />;
            default:
                return (
                    <AppImage
                        uri={logoUri ?? ''}
                        styleImage={appStyles.iconCircleSize32}
                    />
                );
        }
    };

    return (
        <View style={appStyles.justifyContentBetween}>
            <View>
                <AppText
                    titleWithI18n={LanguageKey.common_text_confirmation}
                    variant={TextVariantKeys.titleLarge}
                    styles={styles.confirmTitle}
                />
                <View style={styles.viewFrom}>
                    <View style={styles.viewFromAddress}>
                        <View style={styles.fromText}>
                            <AppText
                                titleWithI18n={LanguageKey.common_text_from}
                                variant={TextVariantKeys.bodyMMedium}
                            />
                        </View>
                        <AppText
                            title={fromAddress}
                            variant={TextVariantKeys.titleSmall}
                        />
                    </View>
                    <View style={styles.viewFromAddress}>
                        <View style={[appStyles.flex1]}>
                            <AppText
                                title={fromAmount}
                                variant={TextVariantKeys.titleMedium}
                            />
                            <AppText
                                title={fromSubAmount}
                                variant={TextVariantKeys.bodyMSmall}
                                textColor={
                                    theme.colors.text_on_surface_text_light
                                }
                            />
                        </View>
                        {getIcon()}
                    </View>
                </View>
                <View style={[appStyles.center, appStyles.pd10]}>
                    <SendDownSvgIcon />
                </View>

                <View style={styles.viewTo}>
                    <View style={styles.viewFromAddress}>
                        <View style={styles.fromText}>
                            <AppText
                                titleWithI18n={LanguageKey.common_text_to}
                                variant={TextVariantKeys.bodyMMedium}
                            />
                        </View>
                        <AppText
                            title={toAddress}
                            variant={TextVariantKeys.titleSmall}
                        />
                    </View>
                </View>
                <View style={styles.networkFee}>
                    <AppText
                        titleWithI18n={LanguageKey.send_service_fee_title}
                        variant={TextVariantKeys.bodyMMedium}
                    />
                    <View style={appStyles.alignItemsEnd}>
                        <AppText
                            title={adminFee}
                            variant={TextVariantKeys.bodyMMedium}
                        />
                        {subAdminFee ? (
                            <AppText
                                title={subAdminFee}
                                variant={TextVariantKeys.bodyMSmall}
                                textColor={
                                    theme.colors.text_on_surface_text_light
                                }
                            />
                        ) : null}
                    </View>
                </View>
                <View style={styles.networkFee}>
                    <AppText
                        titleWithI18n={LanguageKey.send_network_fee_title}
                        variant={TextVariantKeys.bodyMMedium}
                    />
                    <View style={appStyles.alignItemsEnd}>
                        <AppText
                            title={networkFee}
                            variant={TextVariantKeys.bodyMMedium}
                        />
                        {subNetworkFee ? (
                            <AppText
                                title={subNetworkFee}
                                variant={TextVariantKeys.bodyMSmall}
                                textColor={
                                    theme.colors.text_on_surface_text_light
                                }
                            />
                        ) : null}
                    </View>
                </View>
            </View>
        </View>
    );
};

export default ConfirmView;
