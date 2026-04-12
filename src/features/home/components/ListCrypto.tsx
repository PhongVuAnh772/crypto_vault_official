import React from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import { AppThemeType } from "src/core/type/ThemeType";
import { ListCryptoDataType } from "../home.type";
import LanguageKey from "src/core/locales/LanguageKey";
import { t } from "i18next";
import Utils from "src/core/utils/commonUtils";

type ListCryptoType = {
  data: ListCryptoDataType[];
  handlePressItem?: (item: ListCryptoDataType) => void;
  handleSeeAll?: () => void;
};

const ListCryptoComponent: React.FC<ListCryptoType> = ({
  data,
  handlePressItem,
  handleSeeAll,
}) => {
  const theme = useAppTheme();
  const styles = useStyles(theme);

  const renderItem = React.useCallback(
    ({ item }: { item: ListCryptoDataType }) => (
      <TouchableOpacity
        style={styles.itemRow}
        onPress={() => handlePressItem && handlePressItem(item)}
      >
        <View style={styles.tokenInfo}>
          <View style={styles.tokenIcon}>
            {item.logo ? (
              typeof item.logo === 'string' ? (
                <Image source={{ uri: item.logo }} style={styles.logoImage} />
              ) : (
                item.logo
              )
            ) : (
              <Text style={styles.tokenInitial}>{item.symbol?.[0]}</Text>
            )}
          </View>
          <View>
            <Text style={styles.tokenName}>{item.name}</Text>
            <Text style={styles.tokenSymbol}>{item.symbol}</Text>
          </View>
        </View>
        <View style={styles.amountInfo}>
          <Text style={styles.tokenAmount}>{item.balance}</Text>
          <Text style={styles.tokenValue}>{item.balanceToCurrency}</Text>
        </View>
      </TouchableOpacity>
    ),
    [handlePressItem, styles]
  );

  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>{t(LanguageKey.token_list)}</Text>
        <Text style={styles.headerText}>
          {t(LanguageKey.project_detail_amount)}
        </Text>
      </View>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
      <TouchableOpacity style={styles.seeAllBtn} onPress={handleSeeAll}>
        <Text style={styles.seeAllText}>{t(LanguageKey.common_view_all)}</Text>
      </TouchableOpacity>
    </View>
  );
};

const ListCrypto = React.memo(ListCryptoComponent, (prevProps, nextProps) => {
  return (
    Utils.deepEqual(prevProps.data, nextProps.data) &&
    prevProps.handlePressItem === nextProps.handlePressItem &&
    prevProps.handleSeeAll === nextProps.handleSeeAll
  );
});

export default ListCrypto;

const useStyles = (theme: AppThemeType) =>
  StyleSheet.create({
    cardContainer: {
      backgroundColor: '#fff',
      borderRadius: 25,
      paddingVertical: 15,
      marginHorizontal: 20,
      marginTop: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginBottom: 15,
    },
    headerText: {
      color: '#8A8A8E',
      fontSize: 14,
      fontWeight: '500',
    },
    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 20,
    },
    tokenInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    tokenIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#F2F2F7',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    logoImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    tokenInitial: {
      color: '#000',
      fontSize: 18,
      fontWeight: '700',
    },
    tokenName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#000',
    },
    tokenSymbol: {
      fontSize: 12,
      color: '#8A8A8E',
    },
    amountInfo: {
      alignItems: 'flex-end',
    },
    tokenAmount: {
      fontSize: 16,
      fontWeight: '600',
      color: '#000',
    },
    tokenValue: {
      fontSize: 12,
      color: '#8A8A8E',
    },
    seeAllBtn: {
      alignItems: 'center',
      marginTop: 15,
      paddingVertical: 10,
    },
    seeAllText: {
      color: '#007AFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });
