import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import AppImage from 'src/components/common/AppImage';
import AppSkeleton from 'src/components/common/AppSkeleton';
import AppText from 'src/components/common/AppText';
import {
    ArrowDownSvgIcon,
    BitcoinSvgIcon,
    TonSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import {CoinType} from 'src/core/enum/CoinType';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import {useAppTheme} from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import styles from './styles';

type CoinWidgetsType = {
    coinType?: CoinType;
    name?: string;
    logoUri?: string | null;
    balanceTitle: string;
    balanceSubTitle?: string;
    action: () => void;
    isLoading: boolean;
    hideAction?: boolean;
};

const CoinWidgets: React.FC<CoinWidgetsType> = props => {
    const {
        coinType,
        balanceTitle,
        name,
        balanceSubTitle,
        action,
        isLoading,
        hideAction = false,
        logoUri,
    } = props;
    const theme = useAppTheme();

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

    const getTitle = () => {
        switch (coinType) {
            case CoinType.Bitcoin:
                return LanguageKey.btc_coin_title;
            case CoinType.Ton:
                return LanguageKey.ton_coin_title;
            default:
                return LanguageKey.btc_coin_title;
        }
    };

    return (
        <TouchableOpacity
            activeOpacity={hideAction ? 1 : undefined}
            onPress={hideAction ? undefined : action}
            style={[
                appStyles.flexRow,
                appStyles.alignItemsCenter,
                styles.container,
            ]}>
            {getIcon()}
            <View
                style={[
                    appStyles.flex1,
                    appStyles.pL15,
                    appStyles.flexRow,
                    appStyles.justifyContentBetween,
                    appStyles.alignItemsCenter,
                ]}>
                <View style={[appStyles.flex2]}>
                    <AppText
                        titleWithI18n={name ?? getTitle()}
                        variant={TextVariantKeys.titleMedium}
                        textColor="#FFFFFF"
                    />

                    {isLoading ? (
                        <AppSkeleton width={100} height={30} />
                    ) : (
                        <>
                            <View style={appStyles.mt5}>
                                <AppText
                                    title="Balance"
                                    variant={TextVariantKeys.bodyMSmall}
                                    textColor="#8894A6"
                                />
                                <AppText
                                    title={balanceTitle}
                                    variant={TextVariantKeys.titleMedium}
                                    textColor="#FFFFFF"
                                    styles={appStyles.fontWeightBold}
                                />
                            </View>
                            {balanceSubTitle ? (
                                <AppText
                                    title={balanceSubTitle}
                                    variant={TextVariantKeys.bodyMSmall}
                                    textColor="#8894A6"
                                />
                            ) : null}
                        </>
                    )}
                </View>
                <View style={[appStyles.flex1, appStyles.alignItemsEnd]}>
                    {hideAction ? null : (
                        <ArrowDownSvgIcon
                            width={20}
                            height={20}
                            color="#FFFFFF"
                        />
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};
export default CoinWidgets;
