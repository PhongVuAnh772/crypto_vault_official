import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import { useCurrentWallet, useSelectedCurrencySetting } from 'src/core/redux/slice/account.selector';
import Utils from 'src/core/utils/commonUtils';

type WalletAcBalanceRedXProps = {
    balance: number;
    withoutCurrencyRate: boolean;
    onPressAccount?: () => void;
};
const BalanceCard: React.FC<WalletAcBalanceRedXProps> = ({
    withoutCurrencyRate,
    balance,
    onPressAccount,
}) => {
    const theme = useAppTheme();
    const selectedCurrencySetting = useSelectedCurrencySetting();
    const currentWallet = useCurrentWallet();
    const balanceConverted = `${selectedCurrencySetting?.sign ?? ''} ${Utils.fiatFormat(balance * (withoutCurrencyRate ? 1 : selectedCurrencySetting?.rate))}`;

    const formattedAddress = currentWallet?.address
        ? `${currentWallet.address.slice(0, 8)}...${currentWallet.address.slice(-8)}`
        : 'Accounts';

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Main - {selectedCurrencySetting.symbol || 'EUR'}</Text>
            <Text style={styles.balance}>{balanceConverted}</Text>
            <TouchableOpacity style={styles.accountsBtn} onPress={onPressAccount}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.accountsText}>{formattedAddress}</Text>
                    <Feather name="chevron-down" size={16} color="#fff" style={{ marginLeft: 5 }} />
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 15,
        width: '100%',
    },
    label: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    balance: {
        color: '#fff',
        fontSize: 48,
        fontWeight: '700',
        marginBottom: 10,
    },
    accountsBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 25,
        paddingVertical: 8,
        borderRadius: 25,
    },
    accountsText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
});

export default BalanceCard;
