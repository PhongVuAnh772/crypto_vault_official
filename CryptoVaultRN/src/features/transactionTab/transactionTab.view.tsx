import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Slip0044 from 'src/core/enum/Slip0044';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import BitcoinTransactionTab from './bitcoin/bitcoin.transactionTab.view';
import EvmTransactionTab from './evm/evm.transactionTab.view';
import TonTransactionTab from './ton/ton.transactionTab.view';
import useTransaction from './transactionTab.hook';

const TransactionTab: React.FC<any> = ({ navigation }) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const {
    typeSelect,
    slip0044,
  } = useTransaction();

  const getHistoryView = () => {
    const dummySetShowTypeModal = () => { };
    switch (slip0044) {
      case Slip0044.Ton:
        return (
          <TonTransactionTab
            navigation={navigation}
            setShowTypeModal={dummySetShowTypeModal}
            typeSelect={typeSelect}
          />
        );
      case Slip0044.Bitcoin:
        return (
          <BitcoinTransactionTab
            navigation={navigation}
            setShowTypeModal={dummySetShowTypeModal}
            typeSelect={typeSelect}
          />
        );
      default:
        return (
          <EvmTransactionTab
            navigation={navigation}
            setShowTypeModal={dummySetShowTypeModal}
            typeSelect={typeSelect}
          />
        );
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.topRow}>
          <Text style={styles.headerTitle}>Giao dịch</Text>

        </View>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Feather name="search" size={20} color="#8F9BB3" />
            <TextInput
              placeholder="Tìm kiếm giao dịch"
              placeholderTextColor="#8F9BB3"
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialCommunityIcons name="filter-variant" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Feather name="file-text" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.listArea}>
        {getHistoryView()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#07051A',
  },
  header: {
    backgroundColor: '#07051A',
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1D1E4E',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
  },
  searchBar: {
    flex: 1,
    height: 48,
    backgroundColor: '#131435',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#FFFFFF',
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1D1E4E',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: '#131435',
  },
  listArea: {
    flex: 1,
  },
});

export default TransactionTab;
