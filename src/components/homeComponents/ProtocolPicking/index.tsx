import {TouchableOpacity, View, FlatList} from 'react-native';
import React from 'react';
import appStyles from 'src/core/styles';
import AppText from 'src/components/common/AppText';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import {
    BitcoinSvgIcon,
    CheckSvgIcon2,
    SelectAllProtocolSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import useStyles from './styles';
import {AppThemeType} from 'src/core/type/ThemeType';
import {useAppTheme} from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import useProtocolPicking from './ProtocolPicking.hook';
import {ProtocolType} from 'src/core/enum/ProtocolType';

type CryptoButtonType = {
    actionHideModal: () => void;
    protocol: {protocol: string}[];
    searching: string;
    protocolSelect: ProtocolType;
    changeProtocolSelect: (type: ProtocolType) => void;
};

const ProtocolPicking: React.FC<CryptoButtonType> = ({
    actionHideModal,
    protocol,
    searching,
    protocolSelect,
    changeProtocolSelect,
}) => {
    const theme: AppThemeType = useAppTheme();
    const styles = useStyles(theme);

    const getIcon = (protocolType: ProtocolType, address: string) => {
        const Bitcoin = {
            icon: <BitcoinSvgIcon width={32} height={32} />,
            title: LanguageKey.btc_coin_title,
            address: address,
        };
        const AllProtocols = {
            icon: (
                <SelectAllProtocolSvgIcon
                    width={32}
                    height={32}
                    style={styles.iconSellecAll}
                />
            ),
            title: LanguageKey.all_protocols_title,
            address: address,
        };
        switch (protocolType) {
            case ProtocolType.Bitcoin:
                return Bitcoin;
            case ProtocolType.All:
                return AllProtocols;
            default:
                return Bitcoin;
        }
    };
    const {filteredData, actionPicking} = useProtocolPicking(
        protocol,
        searching,
        actionHideModal,
    );

    const renderItem = ({item}: {item: any}) => {
        const data = getIcon(item.type, item.address);
        const isSelected = item.type === protocolSelect;

        return (
            <TouchableOpacity
                onPress={() => {
                    changeProtocolSelect(item.type);
                    actionPicking();
                }}
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
                                variant={TextVariantKeys.titleMedium}
                                styles={styles.titleCryptoDetail}
                            />
                        </View>
                    </View>
                    {isSelected && (
                        <View
                            style={[appStyles.flex1, appStyles.alignItemsEnd]}>
                            <CheckSvgIcon2 />
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[appStyles.mt25, styles.listContainer]}>
            <FlatList
                data={filteredData}
                renderItem={renderItem}
                keyExtractor={item => item.type.toString()}
            />
        </View>
    );
};

export default ProtocolPicking;
