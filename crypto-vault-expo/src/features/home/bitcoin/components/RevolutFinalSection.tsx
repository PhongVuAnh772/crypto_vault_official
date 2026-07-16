/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppText from 'src/components/common/AppText';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import appStyles from 'src/core/styles';

const RevolutFinalSection = () => {
    return (
        <View style={styles.finalCards}>
            <View style={styles.simpleCard}>
                <AppText title="Upcoming payments" variant={TextVariantKeys.labelSmall} textColor="#999999" />
                <View style={[styles.assetRow, { marginTop: 16 }]}>
                    <View style={[styles.assetIconBox, { backgroundColor: '#0052FF' }]}><AppText title="W" variant={TextVariantKeys.bodyMMedium} textColor="#FFFFFF" styles={{ fontWeight: 'bold' }} /></View>
                    <View style={[appStyles.flex1, appStyles.ml12]}>
                        <AppText title="Webflow" variant={TextVariantKeys.bodyMMedium} textColor="#000000" styles={{ fontWeight: '600' }} />
                        <AppText title="One off" variant={TextVariantKeys.bodyRTiny} textColor="#999999" />
                    </View>
                    <AppText title="€124" variant={TextVariantKeys.bodyMMedium} textColor="#000000" styles={{ fontWeight: '600' }} />
                </View>
                <View style={styles.assetRow}>
                    <View style={[styles.assetIconBox, { backgroundColor: '#F0F0F0' }]}><AppText title="UI" variant={TextVariantKeys.bodyMMedium} textColor="#000000" styles={{ fontWeight: 'bold' }} /></View>
                    <View style={[appStyles.flex1, appStyles.ml12]}>
                        <AppText title="UI8" variant={TextVariantKeys.bodyMMedium} textColor="#000000" styles={{ fontWeight: '600' }} />
                        <AppText title="One off" variant={TextVariantKeys.bodyRTiny} textColor="#999999" />
                    </View>
                    <AppText title="€124" variant={TextVariantKeys.bodyMMedium} textColor="#000000" styles={{ fontWeight: '600' }} />
                </View>
            </View>

            <View style={[styles.simpleCard, { marginTop: 16 }]}>
                <AppText title="Total Wealth" variant={TextVariantKeys.labelSmall} textColor="#999999" />
                <AppText title="€ 300" variant={TextVariantKeys.titleMedium} textColor="#000000" styles={{ fontWeight: '700', marginTop: 4, marginBottom: 16 }} />
                
                {[ {name: 'Linked', val: '€200', bg: '#81E2EA'}, {name: 'Cash', val: '€100', bg: '#4A47D1'}, {name: 'Invest', sub: 'Invest for as little as €1', bg: '#4A90E2'}, {name: 'Crypto', sub: 'Invest for as little as €1', bg: '#A5A6F6'} ].map((item, i) => (
                    <View key={i} style={[styles.assetRow, { marginBottom: 12 }]}>
                        <View style={[styles.assetIconBox, { backgroundColor: item.bg, width: 40, height: 40 }]} />
                        <View style={[appStyles.flex1, appStyles.ml12]}>
                            <AppText title={item.name} variant={TextVariantKeys.bodyMMedium} textColor="#000000" styles={{ fontWeight: '600' }} />
                            {item.sub && <AppText title={item.sub} variant={TextVariantKeys.bodyRTiny} textColor="#999999" />}
                        </View>
                        {item.val && <AppText title={item.val} variant={TextVariantKeys.bodyMMedium} textColor="#000000" styles={{ fontWeight: '600' }} />}
                    </View>
                ))}
            </View>

            <View style={[styles.simpleCard, { marginTop: 16 }]}>
                <AppText title="Recent payees" variant={TextVariantKeys.labelSmall} textColor="#999999" />
                <View style={styles.payeesRow}>
                    {[ {n: 'Mario', c: '#E67E22'}, {n: 'Dylan', img: true}, {n: 'Louis', c: '#D35400'} ].map((p, i) => (
                        <View key={i} style={styles.payeeItem}>
                            <View style={[styles.payeeAvatar, { backgroundColor: p.c ?? '#E0E0E0' }]}>
                                 <View style={styles.rBadge}><AppText title="R" variant={TextVariantKeys.labelTiny} textColor="#000000" styles={{ fontSize: 8, fontWeight: 'bold' }} /></View>
                            </View>
                            <AppText title={p.n} variant={TextVariantKeys.bodyRTiny} textColor="#000000" styles={{ marginTop: 8, fontWeight: '500' }} />
                        </View>
                    ))}
                </View>
                <View style={styles.bannerDots}>
                    <View style={[styles.dot, styles.dotActive]} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    finalCards: {
        paddingHorizontal: 24,
        marginTop: 24,
    },
    simpleCard: {
        backgroundColor: '#FFFFFF',
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
    payeesRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    payeeItem: {
        alignItems: 'center',
    },
    payeeAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    bannerDots: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 18,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#DDDDDD',
        marginHorizontal: 3,
    },
    dotActive: {
        backgroundColor: '#999999',
    },
});

export default RevolutFinalSection;
