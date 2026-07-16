/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import AppText from 'src/components/common/AppText';
import {
    SearchSvgIcon,
    AddSvgIcon,
    ArrowDownSvgIcon,
    ArrowCircleRightSvgIcon,
    PulseSvgIcon,
    MoreSvgIcon,
    WalletLogoSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import appStyles from 'src/core/styles';

interface RevolutHeaderProps {
    balance: string;
    onAddMoney?: () => void;
    onExchange?: () => void;
    onDetails?: () => void;
    onMore?: () => void;
}

const QuickAction = ({ Icon, label, onPress }: { Icon: any; label: string; onPress?: () => void }) => (
    <View style={styles.actionItem}>
        <TouchableOpacity style={styles.actionCircle} onPress={onPress}>
            <Icon color="#FFFFFF" width={26} height={26} />
        </TouchableOpacity>
        <AppText title={label} variant={TextVariantKeys.bodyRTiny} textColor="#FFFFFF" styles={{ marginTop: 8, fontWeight: '500' }} />
    </View>
);

const RevolutHeader: React.FC<RevolutHeaderProps> = ({ balance, onAddMoney, onExchange, onDetails, onMore }) => {
    return (
        <View style={styles.headerGradient}>
            <View style={styles.topBar}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatarImg} />
                </View>
                <TouchableOpacity style={styles.searchPill}>
                    <SearchSvgIcon color="rgba(255,255,255,0.7)" width={18} height={18} />
                    <AppText title="Search" variant={TextVariantKeys.bodyRSmall} textColor="rgba(255,255,255,0.7)" styles={{ marginLeft: 10 }} />
                </TouchableOpacity>
                <View style={appStyles.flexRow}>
                    <TouchableOpacity style={styles.headerIconBtn}>
                        <PulseSvgIcon color="#FFFFFF" width={22} height={22} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.headerIconBtn, { marginLeft: 10 }]}>
                        <WalletLogoSvgIcon color="#FFFFFF" width={22} height={22} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.balanceSection}>
                <AppText title="Main - EUR" variant={TextVariantKeys.bodyRTiny} textColor="rgba(255,255,255,0.8)" styles={{ fontWeight: '600' }} />
                <AppText title={balance} variant={TextVariantKeys.headlineLarge} textColor="#FFFFFF" styles={styles.balanceText} />
                <TouchableOpacity style={styles.accountsBtn}>
                    <AppText title="Accounts" variant={TextVariantKeys.bodyRTiny} textColor="#FFFFFF" styles={{ fontWeight: '700', marginRight: 4 }} />
                    <ArrowDownSvgIcon color="#FFFFFF" width={10} height={10} />
                </TouchableOpacity>
            </View>

            <View style={styles.actionRow}>
                <QuickAction Icon={AddSvgIcon} label="Add money" onPress={onAddMoney} />
                <QuickAction Icon={ArrowCircleRightSvgIcon} label="Exchange" onPress={onExchange} />
                <QuickAction Icon={PulseSvgIcon} label="Details" onPress={onDetails} />
                <QuickAction Icon={MoreSvgIcon} label="More" onPress={onMore} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerGradient: {
        backgroundColor: '#4A00E0',
        paddingTop: 60,
        paddingBottom: 50,
        paddingHorizontal: 20,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#CCC',
        overflow: 'hidden',
    },
    avatarImg: {
        width: '100%',
        height: '100%',
        backgroundColor: '#A5A6F6',
    },
    searchPill: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
        height: 38,
        borderRadius: 19,
        marginHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    headerIconBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    balanceSection: {
        alignItems: 'center',
        marginTop: 40,
    },
    balanceText: {
        fontSize: 48,
        fontWeight: '700',
        color: '#FFFFFF',
        marginVertical: 4,
    },
    accountsBtn: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 60,
        paddingHorizontal: 10,
    },
    actionItem: {
        alignItems: 'center',
    },
    actionCircle: {
        width: 62,
        height: 62,
        borderRadius: 31,
        backgroundColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default RevolutHeader;
