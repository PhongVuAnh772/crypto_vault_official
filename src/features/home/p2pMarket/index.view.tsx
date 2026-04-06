import { Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ApiConstants from "src/core/constants/ApiConstants";
import { useAppSelector } from "src/core/redux/hooks";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";

const P2PMarketScreen: React.FC<RootNavigationType> = ({ navigation }) => {
  const theme = useAppTheme();
  const styles = useStyles(theme);
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  
  // Lấy danh sách token từ Config Server
  const remoteTokens = useAppSelector(state => state.appConfig.tokens);
  const displayTokens = remoteTokens.length > 0 ? remoteTokens : [
    { id: "USDT", symbol: "USDT" },
    { id: "BTC", symbol: "BTC" },
    { id: "ETH", symbol: "ETH" },
  ];

  const [selectedTokenId, setSelectedTokenId] = useState(displayTokens[0]?.symbol || "USDT");
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [fetchingMore, setFetchingMore] = useState(false);

  const fetchP2PAds = useCallback(async (pageNum: number, isRefresh: boolean = false) => {
    try {
      if (isRefresh) setLoading(true);
      else setFetchingMore(true);

      // Ưu tiên lấy từ Server của mình (Supabase)
      const serverRes = await fetch(
        `${ApiConstants.SERVER_URL}/api/v1/p2p/ads?type=${activeTab}&symbol=${selectedTokenId}`
      );
      const serverData = await serverRes.json();

      let formatted: any[] = [];

      if (serverData.success && serverData.data.length > 0) {
        formatted = serverData.data;
      } else {
         const response = await fetch(
            "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              },
              body: JSON.stringify({
                asset: selectedTokenId,
                fiat: "USD",
                merchantCheck: false,
                page: pageNum,
                payTypes: [],
                publisherType: null,
                rows: 10,
                tradeType: activeTab === "buy" ? "BUY" : "SELL",
              }),
            }
          );
          const resData = await response.json();
          if (resData.success && resData.data) {
            formatted = resData.data.map((item: any) => ({
              id: item.adv.advNo,
              name: item.advertiser.nickName,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.advertiser.nickName)}&background=random&color=fff`,
              completionRate: `${(item.advertiser.monthFinishRate * 100).toFixed(1)}%`,
              orderCount: item.advertiser.monthOrderCount,
              isVerified: item.advertiser.userType === "PRO",
              price: item.adv.price,
              currency: item.adv.fiatUnit,
              limitMin: parseFloat(item.adv.minSingleTransAmount),
              limitMax: parseFloat(item.adv.maxSingleTransAmount),
              payments: item.adv.tradeMethods.map((m: any) => m.tradeMethodName),
            }));
          }
      }
      
      if (isRefresh) {
        setMerchants(formatted);
      } else {
        setMerchants(prev => [...prev, ...formatted]);
      }
      
      if (formatted.length < 10) setHasMore(false);
      else setHasMore(true);

    } catch (error) {
      console.error("Fetch P2P ads error:", error);
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  }, [selectedTokenId, activeTab]);

  useEffect(() => {
    setPage(1);
    fetchP2PAds(1, true);
  }, [selectedTokenId, activeTab, fetchP2PAds]);

  const handleLoadMore = () => {
    if (!fetchingMore && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchP2PAds(nextPage);
    }
  };

  const renderMerchantItem = ({ item }: { item: any }) => {
    const symbol = displayTokens.find((t: any) => t.symbol === selectedTokenId)?.symbol || "USDT";
    
    return (
      <View style={styles.merchantCard}>
        <View style={styles.cardHeader}>
           <View style={styles.merchantInfo}>
              <View style={[styles.avatarBox, { backgroundColor: item.isVerified ? '#F0B90B' : '#00C076' }]}>
                 <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
              </View>
              <View>
                 <View style={appStyles.flexRow}>
                    <Text style={styles.merchantName}>{item.name}</Text>
                    {item.isVerified && <MaterialIcons name="verified" size={14} color="#F0B90B" style={{ marginLeft: 4 }} />}
                 </View>
                 <Text style={styles.statsText}>{item.orderCount} lệnh | {item.completionRate} thành công</Text>
              </View>
           </View>
           <View style={styles.priceContainer}>
              <Text style={styles.priceValue}>{parseFloat(item.price).toLocaleString()}</Text>
              <Text style={styles.priceCurrency}>VND</Text>
           </View>
        </View>

        <View style={styles.cardBody}>
           <View style={styles.limitRow}>
              <Text style={styles.limitLabel}>Số lượng </Text>
              <Text style={styles.limitValue}>{(item.limitMax / item.price).toFixed(2)} {symbol}</Text>
           </View>
           <View style={styles.limitRow}>
              <Text style={styles.limitLabel}>Giới hạn </Text>
              <Text style={styles.limitValue}>đ{item.limitMin.toLocaleString()} - đ{item.limitMax.toLocaleString()}</Text>
           </View>
           
           <View style={styles.paymentMethods}>
              {item.payments.map((p: string, idx: number) => (
                <View key={idx} style={styles.paymentTag}>
                   <View style={[styles.paymentDot, { backgroundColor: p.toLowerCase().includes('bank') ? '#F0B90B' : '#00C076' }]} />
                   <Text style={styles.paymentText}>{p}</Text>
                </View>
              ))}
           </View>
        </View>

        <TouchableOpacity 
          style={[styles.buyBtn, activeTab === 'sell' && styles.sellBtn]}
          onPress={() => navigation.navigate(HomeStackScreenKey.P2PBuyDetail, {
            merchant: item,
            token: { symbol },
            tradeType: activeTab === "buy" ? "BUY" : "SELL"
          })}
        >
          <Text style={styles.buyBtnText}>{activeTab === 'buy' ? 'Mua' : 'Bán'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              onPress={() => setActiveTab("buy")}
              style={[styles.tab, activeTab === "buy" && styles.activeTab]}
            >
              <Text style={[styles.tabText, activeTab === "buy" && styles.activeTabText]}>Mua</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setActiveTab("sell")}
              style={[styles.tab, activeTab === "sell" && styles.activeTab]}
            >
              <Text style={[styles.tabText, activeTab === "sell" && styles.activeTabText]}>Bán</Text>
            </TouchableOpacity>
          </View>
          <View style={appStyles.flexRow}>
             <TouchableOpacity style={styles.iconBtn}>
                <MaterialCommunityIcons name="filter-variant" size={24} color="#fff" />
             </TouchableOpacity>
             <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
             </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tokenBar}>
           <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {displayTokens.map((t: any) => (
                <TouchableOpacity 
                  key={t.id} 
                  onPress={() => setSelectedTokenId(t.symbol)}
                  style={[styles.tokenTab, selectedTokenId === t.symbol && styles.activeTokenTab]}
                >
                   <Text style={[styles.tokenTabText, selectedTokenId === t.symbol && styles.activeTokenTabText]}>{t.symbol}</Text>
                </TouchableOpacity>
              ))}
           </ScrollView>
        </View>

        <FlatList
          data={merchants}
          renderItem={renderMerchantItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => (
            fetchingMore ? <ActivityIndicator size="small" color="#00C076" style={{ margin: 20 }} /> : null
          )}
          ListEmptyComponent={() => (
            !loading ? <View style={styles.emptyContainer}><Text style={styles.emptyText}>Không tìm thấy quảng cáo nào</Text></View> : null
          )}
          refreshing={loading}
          onRefresh={() => fetchP2PAds(1, true)}
        />
      </SafeAreaView>
    </View>
  );
};

const appStyles = {
    flexRow: { flexDirection: 'row' as const, alignItems: 'center' as const }
};

const useStyles = (theme: any) =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: "#050B09",
    },
    safeArea: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    iconBtn: {
       padding: 8,
    },
    tabContainer: {
      flexDirection: "row",
      backgroundColor: "rgba(255,255,255,0.05)",
      borderRadius: 20,
      padding: 4,
    },
    tab: {
      paddingHorizontal: 20,
      paddingVertical: 6,
      borderRadius: 16,
    },
    activeTab: {
      backgroundColor: "rgba(255,255,255,0.1)",
    },
    tabText: {
      color: "#999",
      fontWeight: "600",
    },
    activeTabText: {
      color: "#fff",
    },
    tokenBar: {
       paddingVertical: 12,
       paddingHorizontal: 16,
       borderBottomWidth: 1,
       borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    tokenTab: {
       marginRight: 24,
       paddingBottom: 4,
    },
    activeTokenTab: {
       borderBottomWidth: 2,
       borderBottomColor: '#F0B90B',
    },
    tokenTabText: {
       color: '#999',
       fontWeight: '600',
       fontSize: 16,
    },
    activeTokenTabText: {
       color: '#fff',
    },
    listContent: {
       padding: 16,
    },
    merchantCard: {
       backgroundColor: 'rgba(255,255,255,0.03)',
       borderRadius: 16,
       padding: 16,
       marginBottom: 16,
       borderWidth: 1,
       borderColor: 'rgba(255,255,255,0.05)',
    },
    cardHeader: {
       flexDirection: 'row',
       justifyContent: 'space-between',
       marginBottom: 16,
    },
    merchantInfo: {
       flexDirection: 'row',
       alignItems: 'center',
    },
    avatarBox: {
       width: 40,
       height: 40,
       borderRadius: 20,
       justifyContent: 'center',
       alignItems: 'center',
       marginRight: 12,
    },
    avatarText: {
       color: '#fff',
       fontWeight: 'bold',
       fontSize: 18,
    },
    merchantName: {
       color: '#fff',
       fontWeight: '700',
       fontSize: 15,
    },
    statsText: {
       color: '#666',
       fontSize: 12,
       marginTop: 2,
    },
    priceContainer: {
       alignItems: 'flex-end',
    },
    priceValue: {
       color: '#00C076',
       fontSize: 20,
       fontWeight: 'bold',
    },
    priceCurrency: {
       color: '#666',
       fontSize: 12,
    },
    cardBody: {
       marginBottom: 16,
    },
    limitRow: {
       flexDirection: 'row',
       marginBottom: 4,
    },
    limitLabel: {
       color: '#666',
       fontSize: 13,
       width: 80,
    },
    limitValue: {
       color: '#fff',
       fontSize: 13,
       fontWeight: '500',
    },
    paymentMethods: {
       flexDirection: 'row',
       marginTop: 12,
       flexWrap: 'wrap',
    },
    paymentTag: {
       flexDirection: 'row',
       alignItems: 'center',
       backgroundColor: 'rgba(255,255,255,0.05)',
       paddingHorizontal: 8,
       paddingVertical: 4,
       borderRadius: 4,
       marginRight: 8,
       marginBottom: 8,
    },
    paymentDot: {
       width: 4,
       height: 10,
       borderRadius: 2,
       marginRight: 6,
    },
    paymentText: {
       color: '#999',
       fontSize: 11,
    },
    buyBtn: {
       backgroundColor: '#00C076',
       paddingVertical: 10,
       borderRadius: 8,
       alignItems: 'center',
    },
    sellBtn: {
       backgroundColor: '#FF4D4D',
    },
    buyBtnText: {
       color: '#fff',
       fontWeight: 'bold',
       fontSize: 16,
    },
    emptyContainer: {
       alignItems: 'center',
       marginTop: 50,
    },
    emptyText: {
       color: '#666',
    }
  });

export default P2PMarketScreen;
