import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import { useCurrentWallet, useSelectedCurrencySetting } from 'src/core/redux/slice/account.selector';
import Utils from 'src/core/utils/commonUtils';
import * as Clipboard from 'expo-clipboard';
import { mPlus1 } from 'src/core/constants/FontFamily';

type WalletAcBalanceledgerifyProps = {
    balance: number;
    withoutCurrencyRate: boolean;
    onPressAccount?: () => void;
    isLoading?: boolean;
};
const BalanceCard: React.FC<WalletAcBalanceledgerifyProps> = ({
    withoutCurrencyRate,
    balance,
    onPressAccount,
    isLoading,
}) => {
    const theme = useAppTheme();
    const selectedCurrencySetting = useSelectedCurrencySetting();
    const currentWallet = useCurrentWallet();
    const balanceConverted = `${selectedCurrencySetting?.sign ?? ''} ${Utils.fiatFormat(balance * (withoutCurrencyRate ? 1 : selectedCurrencySetting?.rate))}`;

    const formattedAddress = currentWallet?.address
        ? `${currentWallet.address.slice(0, 8)}...${currentWallet.address.slice(-8)}`
        : 'Accounts';

    const handleCopyAddress = async () => {
        if (currentWallet?.address) {
            await Clipboard.setStringAsync(currentWallet.address);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.walletSelector} onPress={onPressAccount}>
                <Text style={styles.label}>Main - {selectedCurrencySetting.symbol || 'EUR'}</Text>
                <Feather name="chevron-down" size={14} color="rgba(255,255,255,0.7)" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Text style={[styles.balance, { marginBottom: 0 }]}>{balanceConverted}</Text>
                {isLoading && (
                    <ActivityIndicator size="small" color="#9E86FF" style={{ marginLeft: 12 }} />
                )}
            </View>
            
            <TouchableOpacity style={styles.accountsBtn} onPress={handleCopyAddress}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.accountsText}>{formattedAddress}</Text>
                    <Feather name="copy" size={12} color="#D0CDE3" style={{ marginLeft: 6 }} />
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'flex-start',
        paddingVertical: 10,
        width: '100%',
        paddingLeft: 20,
    },
    walletSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    label: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        fontWeight: '600',
        fontFamily: mPlus1.medium,
    },
    balance: {
        color: '#fff',
        fontSize: 38,
        fontWeight: '700',
        marginBottom: 10,
        fontFamily: mPlus1.bold,
    },
    accountsBtn: {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    accountsText: {
        color: '#D0CDE3',
        fontSize: 12,
        fontWeight: '500',
        fontFamily: mPlus1.medium,
    },
});

export default BalanceCard;