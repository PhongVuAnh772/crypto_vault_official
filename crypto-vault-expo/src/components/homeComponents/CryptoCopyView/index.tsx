import {TouchableOpacity, View, FlatList} from 'react-native';
import React from 'react';
import appStyles from 'src/core/styles';
import AppText from 'src/components/common/AppText';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import {
    BinanceSvgIcon,
    BitcoinSvgIcon,
    Copy3SvgIcon,
    EthereumSvgIcon,
    PolygonSvgIcon,
    TonSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import useStyles from './styles';
import useCryptoCopyView, {DataCryptoType} from './CryptoCopyView.hook';
import {AppThemeType} from 'src/core/type/ThemeType';
import {useAppTheme} from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import {CoinType} from 'src/core/enum/CoinType';
import WalletUtils from 'src/core/utils/walletUtils';
import SearchEmpty from 'src/components/specific/SearchEmpty';

type CryptoButtonType = {
    actionHideModal: () => void;
    list: DataCryptoType[];
    searching: string;
};

const CryptoCopyView: React.FC<CryptoButtonType> = ({
    actionHideModal,
    list,
    searching,
}) => {
    const theme: AppThemeType = useAppTheme();
    const styles = useStyles(theme);

    const getIcon = (coinType: CoinType, address: string) => {
        const Bitcoin = {
            icon: <BitcoinSvgIcon width={32} height={32} />,
            title: LanguageKey.btc_coin_title,
            address: address,
        };
        const Ton = {
            icon: <TonSvgIcon width={32} height={32} />,
            title: LanguageKey.ton_coin_title,
            address: address,
        };
        const Ethereum = {
            icon: <EthereumSvgIcon width={32} height={32} />,
            title: LanguageKey.eth_coin_title,
            address: address,
        };
        const Polygon = {
            icon: <PolygonSvgIcon width={32} height={32} />,
            title: LanguageKey.pol_coin_title,
            address: address,
        };
        const Binance = {
            icon: <BinanceSvgIcon width={32} height={32} />,
            title: LanguageKey.bnb_coin_title,
            address: address,
        };

        switch (coinType) {
            case CoinType.Bitcoin:
                return Bitcoin;
            case CoinType.Ton:
                return Ton;
            case CoinType.Ethereum:
                return Ethereum;
            case CoinType.Polygon:
                return Polygon;
            case CoinType.Binance:
                return Binance;
            default:
                return Bitcoin;
        }
    };
    const {filteredData, copyAction, isEmptyData} = useCryptoCopyView(
        list,
        searching,
        actionHideModal,
    );

    const renderItem = ({item}: {item: any}) => {
        const data = getIcon(item.type, item.address);
        return (
            <View
                style={[
                    appStyles.flexRow,
                    appStyles.alignItemsCenter,
                    styles.container,
                ]}>
                {data?.icon}
                <View
                    style={[
                        appStyles.flex1,
                        appStyles.pL10,
                        appStyles.flexRow,
                        appStyles.justifyContentBetween,
                        appStyles.alignItemsCenter,
                    ]}>
                    <View
                        style={[
                            appStyles.flex1,
                            styles.shortCryptoDetailContainer,
                        ]}>
                        <View>
                            <AppText
                                titleWithI18n={data?.title}
                                variant={TextVariantKeys.bodyMMedium}
                                styles={styles.titleCryptoDetail}
                            />
                            <AppText
                                title={WalletUtils.getShortAddress(
                                    item?.address,
                                )}
                                variant={TextVariantKeys.bodyMSmall}
                                styles={styles.titleCryptoDescription}
                            />
                        </View>
                    </View>
                    <View style={[appStyles.alignItemsEnd]}>
                        <TouchableOpacity
                            style={styles.headerIconContainer}
                            onPress={() => copyAction(item?.address)}>
                            <Copy3SvgIcon />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={[appStyles.mt25, styles.listContainer]}>
            {isEmptyData ? (
                <SearchEmpty />
            ) : (
                <FlatList
                    data={filteredData}
                    renderItem={renderItem}
                    keyExtractor={item => item.type.toString()}
                />
            )}
        </View>
    );
};
export default CryptoCopyView;
