import { ProposalTypes } from '@walletconnect/types';
import React from 'react';
import { FlatList, Image, View } from 'react-native';
import AppText from 'src/components/common/AppText';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import {
    AccountType,
    ProtocolDataWithSupportedTokensFormBEType,
} from 'src/core/redux/slice/account.type';
import appStyles from 'src/core/styles';
import AccountUtils from 'src/core/utils/accountUtils';
import WalletUtils from 'src/core/utils/walletUtils';
import useStyles from './SessionPropsalModal/sessionProposal.stye';
import {
    informationChainType,
    ListChainRequireType,
    OptionalNamespacesType,
} from './SessionPropsalModal/sessionProposal.type';

const ListChainRequire: React.FC<ListChainRequireType> = ({
    listChain,
    protocolDataLists,
    currentAccount,
    address
}) => {
    const theme = useAppTheme();
    const insets = useAppSafeAreaInsets();
    const style = useStyles(theme,insets);
    const renderItem = ({ item }: { item: string }) => {
        const data = informationChain(
            item,
            protocolDataLists,
            currentAccount,
            address
        ) as informationChainType;
        return (
            <View style={[style.listChain]}>
                <View
                    style={[
                        appStyles.flexRow,
                        appStyles.justifyContentBetween,
                    ]}>
                    <View
                        style={[appStyles.flexRow, appStyles.alignItemsCenter]}>
                        <Image
                            source={{ uri: data.logo ?? '' }}
                            style={[style.iconChains]}
                        />
                        <View>
                            <AppText
                                title={data.name}
                                variant={TextVariantKeys.bodyMMedium}
                                styles={style.nameProtocol}
                                textColor={
                                    theme.colors.text_on_surface_text_high
                                }
                            />
                            <AppText
                                title={WalletUtils.getShortAddress(address)}
                                variant={TextVariantKeys.bodyMSmall}
                                styles={style.nameProtocol}
                                textColor={
                                    theme.colors.text_on_surface_text_light
                                }
                            />
                        </View>
                    </View>
                </View>
            </View>
        );
    };
    return (
        <View >
            <FlatList
                bounces={false}
                data={listChain}
                renderItem={renderItem}
            />
        </View>
    );
};
export { ListChainRequire };

export function getSupportedChains(
    requiredNamespaces: ProposalTypes.OptionalNamespaces | undefined,
    protocolDataLists: ProtocolDataWithSupportedTokensFormBEType[],
    currentAccount: AccountType,
    address: string,
) {
    if (!requiredNamespaces) {
        return [];
    }
    const required = [];
    const keyChains = [];
    const method = [];
    const events = [];
    for (const [key, values] of Object.entries(requiredNamespaces)) {
        const chains = (key.includes(':') ? key : values.chains) as string[];
        if (chains) {
            const filteredResults = chains.filter(
                chain_id =>
                    informationChain(chain_id, protocolDataLists,currentAccount,address) !== undefined,
            );
            required.push(filteredResults);
            keyChains.push(key);
            method.push(key.includes(':') ? key : values.methods);
            events.push(key.includes(':') ? key : values.events);
        }
    }

    return {
        key: keyChains,
        chains: required,
        method: method,
        event: events,
    };
}
export function supportedNamespaces(
    nameSpaces: OptionalNamespacesType,
    address: string,
) {
    const result = nameSpaces.key.reduce(
        (acc, curr, index) => {
            acc[curr] = {
                chains: nameSpaces.chains[index],
                methods: nameSpaces.method[index],
                events: nameSpaces.event[index],
                accounts: nameSpaces.chains[index]
                    .map(chain => `${chain}:${address}`)
                    .flat(),
            };
            return acc;
        },
        {} as Record<
            string,
            {
                chains: string[];
                methods: string[];
                events: string[];
                accounts: string[];
            }
        >,
    );
    return result;
}
export function findWalletAddress(
    chain_id: string,
    protocolDataLists: ProtocolDataWithSupportedTokensFormBEType[],
    currentAccount: AccountType,
) {
    const addressData = AccountUtils.getAddressDataWithWalletConnectChainId({
        chaiId: chain_id,
        protocolListData: protocolDataLists,
        currentAccount,
    });
    return addressData?.address;
}
export function informationChain(
    chain_id: string,
    protocolDataLists: ProtocolDataWithSupportedTokensFormBEType[],
    currentAccount: AccountType,
    address: string,
) {
    const coinProtocolData = protocolDataLists.find(
        item => item.walletConnectSupportedChain === chain_id,
    );
    const accountProtocolListData = currentAccount?.protocolData;

    const coinAccountData = accountProtocolListData?.find(
        e => e._id === coinProtocolData?._id,
    );
    const polAddressList = coinAccountData?.addressList;
    const currentCoinAddressData = polAddressList?.find(
        e =>  e.address === address,
    );
    return currentCoinAddressData ? coinProtocolData : undefined;
}
