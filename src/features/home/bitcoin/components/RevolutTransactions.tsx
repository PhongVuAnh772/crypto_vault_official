/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import AppText from 'src/components/common/AppText';
import { BitcoinSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import appStyles from 'src/core/styles';
import { ListCryptoDataType } from '../../home.type';
import Utils from 'src/core/utils/commonUtils';
import ListCrypto from '../../components/ListCrypto';

interface RevolutTransactionsProps {
    listCryptoData: ListCryptoDataType[];
    selectedCurrencySign: string;
    onSeeAll?: () => void;
    gotoManageCrypto: () => void;
}

const renderAssetRow = ({ item, index, selectedCurrencySign }: { item: ListCryptoDataType, index: number, selectedCurrencySign: string }) => {
    const balanceConverted = Utils.convertBigIntFollowDecimals(item.balance + '', item.decimal ?? 8);
    const balanceDisplay = Utils.formattedBalanceCurrency(+balanceConverted);
    
    return (
        <TouchableOpacity key={index} style={styles.assetRow}>
            <View style={[styles.assetIconBox, { backgroundColor: index % 2 === 0 ? '#E0E7FF' : '#FFF3E0' }]}>
                 <BitcoinSvgIcon color={index % 2 === 0 ? '#4F46E5' : '#FB923C'} width={22} height={22} />
            </View>
            <View style={[appStyles.flex1, appStyles.ml12]}>
                <AppText title={`To ${item.name}`} variant={TextVariantKeys.bodyMMedium} textColor="#000000" styles={{ fontWeight: '600' }} />
                <AppText title="29 Feb, 20:37 · Completed" variant={TextVariantKeys.bodyRTiny} textColor="#8E8E93" />
            </View>
            <AppText title={`${selectedCurrencySign}${balanceDisplay}`} variant={TextVariantKeys.bodyMMedium} textColor="#000000" styles={{ fontWeight: '700' }} />
        </TouchableOpacity>
    );
};

const RevolutTransactions: React.FC<RevolutTransactionsProps> = ({ listCryptoData, selectedCurrencySign, onSeeAll, gotoManageCrypto }) => {
    return (
        <View style={styles.txSection}>
            <View style={appStyles.flexRow}>
                <AppText title="Transaction" variant={TextVariantKeys.labelSmall} textColor="#999999" styles={{ flex: 1 }} />
                <AppText title="Amount" variant={TextVariantKeys.labelSmall} textColor="#999999" />
            </View>
            <View style={{ marginTop: 20 }}>
                <ListCrypto
                    cryptoDataLists={(listCryptoData ?? []).slice(0, 2)}
                    gotoManageCrypto={gotoManageCrypto}
                    renderItem={(props) => renderAssetRow({...props, selectedCurrencySign})}
                />
            </View>
            <TouchableOpacity style={styles.seeAllBtn} onPress={onSeeAll}>
                <AppText title="See all" variant={TextVariantKeys.bodyRSmall} textColor="#007AFF" styles={{ fontWeight: '600' }} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    txSection: {
        backgroundColor: '#FFFFFF',
        marginTop: 30,
        marginHorizontal: 24,
        borderRadius: 24,
        padding: 24,
    },
    assetRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    assetIconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    seeAllBtn: {
        alignSelf: 'center',
        marginTop: 10,
    },
});

export default RevolutTransactions;
