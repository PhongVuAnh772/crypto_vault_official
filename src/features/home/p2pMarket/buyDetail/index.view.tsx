import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { RouteProp, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Switch,
  Image,
} from "react-native";
import appColors from "src/core/constants/AppColors";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import { HomeStackParamListType } from "src/navigation/stacks/type/HomeStackParamListType";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";

type P2PBuyDetailRouteProp = RouteProp<HomeStackParamListType, HomeStackScreenKey.P2PBuyDetail>;

const P2PBuyDetailScreen: React.FC<RootNavigationType> = ({ navigation }) => {
  const theme = useAppTheme();
  const styles = useStyles(theme);
  const route = useRoute<P2PBuyDetailRouteProp>();
  const { merchant, token, tradeType } = route.params;

  const [fiatAmount, setFiatAmount] = useState("1000000");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [isByFiat, setIsByFiat] = useState(true);
  const [isEarnEnabled, setIsEarnEnabled] = useState(false);

  const priceNum = parseFloat(merchant.price);

  useEffect(() => {
    if (isByFiat) {
      if (fiatAmount) {
        setCryptoAmount((parseFloat(fiatAmount) / priceNum).toFixed(2));
      } else {
        setCryptoAmount("");
      }
    } else {
      if (cryptoAmount) {
        setFiatAmount((parseFloat(cryptoAmount) * priceNum).toFixed(0));
      } else {
        setFiatAmount("");
      }
    }
  }, [fiatAmount, cryptoAmount, isByFiat, priceNum]);

  const handleMax = () => {
    setFiatAmount(merchant.limitMax.toString());
    setIsByFiat(true);
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
             <Image 
                source={{ uri: "https://cryptologos.cc/logos/tether-usdt-logo.png" }} 
                style={styles.tokenIcon} 
             />
             <Text style={styles.headerTitle}>{tradeType === "BUY" ? "Mua" : "Bán"} {token.symbol}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Price Bar */}
          <View style={styles.priceBar}>
            <Text style={styles.priceLabel}>Giá </Text>
            <Text style={styles.priceValue}>đ{priceNum.toLocaleString()}</Text>
            <MaterialCommunityIcons name="refresh" size={18} color="#999" style={{ marginHorizontal: 4 }} />
            <View style={styles.volatilityTag}>
                <Text style={styles.volatilityText}>Dao động</Text>
            </View>
          </View>

          {/* Input Card */}
          <View style={styles.inputCard}>
            <View style={styles.tabBar}>
              <TouchableOpacity 
                onPress={() => setIsByFiat(true)}
                style={[styles.tabItem, isByFiat && styles.activeTab]}
              >
                <Text style={[styles.tabText, isByFiat && styles.activeTabText]}>Bằng VND</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setIsByFiat(false)}
                style={[styles.tabItem, !isByFiat && styles.activeTab]}
              >
                <Text style={[styles.tabText, !isByFiat && styles.activeTabText]}>Bằng {token.symbol}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
               <TextInput 
                  style={styles.amountInput}
                  value={isByFiat ? fiatAmount : cryptoAmount}
                  onChangeText={isByFiat ? setFiatAmount : setCryptoAmount}
                  keyboardType="numeric"
                  placeholder="0"
               />
               <View style={styles.inputRightActions}>
                  <TouchableOpacity onPress={() => isByFiat ? setFiatAmount("") : setCryptoAmount("")}>
                    <Ionicons name="close-outline" size={24} color="#ccc" />
                  </TouchableOpacity>
                  <Text style={styles.fiatSymbol}>{isByFiat ? "VND" : token.symbol}</Text>
                  <TouchableOpacity onPress={handleMax}>
                    <Text style={styles.maxText}>Tối đa</Text>
                  </TouchableOpacity>
               </View>
            </View>

            <View style={styles.limitRow}>
               <Text style={styles.limitText}>Giới hạn  đ{merchant.limitMin.toLocaleString()} - đ{merchant.limitMax.toLocaleString()}</Text>
            </View>

            <View style={styles.receiveRow}>
               <Text style={styles.receiveLabel}>Bạn nhận được</Text>
               <View style={styles.receiveAmountWrapper}>
                  <Text style={styles.receiveValue}>{isByFiat ? cryptoAmount : fiatAmount}</Text>
                  <Text style={styles.receiveSymbol}> {isByFiat ? token.symbol : "VND"}</Text>
               </View>
            </View>
          </View>

          {/* Payment Method Card */}
          <TouchableOpacity style={styles.paymentCard}>
            <View style={styles.paymentLeft}>
               <View style={styles.paymentIndicator} />
               <Text style={styles.paymentName}>Chuyển khoản ngân hàng</Text>
            </View>
            <View style={styles.paymentRight}>
               <View style={styles.paymentCountBadge}>
                  <Text style={styles.paymentCountText}>2</Text>
               </View>
               <Ionicons name="chevron-forward" size={18} color="#999" />
            </View>
          </TouchableOpacity>

          {/* Earn Subscription */}
          <View style={styles.earnSection}>
            <Text style={styles.earnTitle}>Đăng ký Earn</Text>
            <View style={styles.earnRow}>
               <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.earnLabel}>Kích hoạt Earn tự động </Text>
                  <Text style={styles.earnApr}>3,8% APR</Text>
               </View>
               <Switch 
                  value={isEarnEnabled}
                  onValueChange={setIsEarnEnabled}
                  trackColor={{ false: "#eee", true: "#00C076" }}
                  thumbColor="#fff"
               />
            </View>
          </View>

          {/* Advertiser Info */}
          <View style={styles.advertiserSection}>
            <Text style={styles.sectionHeading}>Yêu cầu của nhà quảng cáo</Text>
            <TouchableOpacity style={styles.advertiserHeader}>
               <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.advertiserName}>{merchant.name}</Text>
                  <MaterialCommunityIcons name="shield-check-outline" size={16} color="#999" style={{ marginLeft: 4 }} />
               </View>
               <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.onlineText}>Trực tuyến</Text>
                  <Ionicons name="chevron-forward" size={16} color="#999" />
               </View>
            </TouchableOpacity>

            <View style={styles.requirementsList}>
               <Text style={styles.reqItem}>1. Bắt buộc thanh toán từ Bank chính chủ, đúng tên</Text>
               <Text style={styles.reqItem}>2. Chuyển khoản nhanh 24/7, đúng số tiền</Text>
               <Text style={styles.reqItem}>3. Nội dung bắt buộc ghi SỐ LỆNH GIAO DỊCH - tuyệt đối không ghi mua bán coin, usdt, binance, p2p...</Text>
               <Text style={styles.reqItem}>4. Không giao dịch với người ở ngoài lãnh thổ Việt Nam</Text>
               <Text style={styles.reqItem}>5. Sẽ yêu cầu xác minh giấy tờ đối với những giao dịch có nghi vấn</Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer Button */}
        <View style={styles.footer}>
           <TouchableOpacity 
              style={styles.placeOrderBtn}
              onPress={() => {
                navigation.navigate(HomeStackScreenKey.P2POrderDetails, {
                  orderId: Math.random().toString(36).substring(7).toUpperCase(),
                  amountFiat: isByFiat ? fiatAmount : ((parseFloat(cryptoAmount) * priceNum).toString()),
                  amountCrypto: isByFiat ? ((parseFloat(fiatAmount) / priceNum).toString()) : cryptoAmount,
                  currency: "VND",
                  tokenSymbol: token.symbol,
                  merchant: merchant,
                  expiryTime: Date.now() + 15 * 60 * 1000,
                });
              }}
           >
              <Text style={styles.placeOrderBtnText}>Đặt lệnh</Text>
           </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const useStyles = (theme: any) =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: "#f5f5f5", // Light background matching screenshot
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
      backgroundColor: "#fff",
    },
    backBtn: {
      padding: 4,
    },
    headerCenter: {
       flexDirection: 'row',
       alignItems: 'center',
    },
    tokenIcon: {
       width: 24,
       height: 24,
       marginRight: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: "#000",
    },
    scrollContent: {
      paddingBottom: 100,
    },
    priceBar: {
       flexDirection: 'row',
       alignItems: 'center',
       justifyContent: 'center',
       paddingVertical: 16,
       backgroundColor: '#fff',
    },
    priceLabel: {
       fontSize: 14,
       color: '#666',
    },
    priceValue: {
       fontSize: 14,
       fontWeight: '700',
       color: '#000',
    },
    volatilityTag: {
       backgroundColor: '#fff8e6',
       paddingHorizontal: 6,
       paddingVertical: 2,
       borderRadius: 4,
       marginLeft: 4,
    },
    volatilityText: {
       fontSize: 12,
       color: '#f0b90b',
       fontWeight: '600',
    },
    inputCard: {
       backgroundColor: '#fff',
       margin: 16,
       padding: 16,
       borderRadius: 12,
       shadowColor: "#000",
       shadowOffset: { width: 0, height: 2 },
       shadowOpacity: 0.05,
       shadowRadius: 10,
       elevation: 2,
    },
    tabBar: {
       flexDirection: 'row',
       marginBottom: 24,
    },
    tabItem: {
       marginRight: 24,
       paddingBottom: 8,
    },
    activeTab: {
       borderBottomWidth: 3,
       borderBottomColor: '#f0b90b',
    },
    tabText: {
       fontSize: 16,
       fontWeight: '600',
       color: '#999',
    },
    activeTabText: {
       color: '#000',
    },
    inputWrapper: {
       flexDirection: 'row',
       alignItems: 'center',
       justifyContent: 'space-between',
       marginBottom: 16,
    },
    amountInput: {
       fontSize: 42,
       fontWeight: '700',
       color: '#000',
       flex: 1,
    },
    inputRightActions: {
       flexDirection: 'row',
       alignItems: 'center',
    },
    fiatSymbol: {
       fontSize: 18,
       fontWeight: '700',
       color: '#000',
       marginHorizontal: 12,
    },
    maxText: {
       fontSize: 16,
       fontWeight: '600',
       color: '#f0b90b',
    },
    limitRow: {
       marginBottom: 20,
    },
    limitText: {
       fontSize: 13,
       color: '#ccc',
    },
    receiveRow: {
       flexDirection: 'row',
       justifyContent: 'space-between',
       alignItems: 'center',
       paddingTop: 16,
       borderTopWidth: 1,
       borderTopColor: '#f5f5f5',
    },
    receiveLabel: {
       fontSize: 15,
       color: '#000',
    },
    receiveAmountWrapper: {
       flexDirection: 'row',
       alignItems: 'baseline',
       borderBottomWidth: 1,
       borderBottomColor: '#ccc',
       borderStyle: 'dashed',
    },
    receiveValue: {
       fontSize: 16,
       fontWeight: '700',
       color: '#000',
    },
    receiveSymbol: {
       fontSize: 13,
       fontWeight: '600',
       color: '#000',
    },
    paymentCard: {
       backgroundColor: '#fff',
       marginHorizontal: 16,
       padding: 16,
       borderRadius: 12,
       flexDirection: 'row',
       justifyContent: 'space-between',
       alignItems: 'center',
    },
    paymentLeft: {
       flexDirection: 'row',
       alignItems: 'center',
    },
    paymentIndicator: {
       width: 4,
       height: 16,
       backgroundColor: '#f0b90b',
       borderRadius: 2,
       marginRight: 10,
    },
    paymentName: {
       fontSize: 15,
       fontWeight: '600',
       color: '#000',
    },
    paymentRight: {
       flexDirection: 'row',
       alignItems: 'center',
    },
    paymentCountBadge: {
       backgroundColor: '#f5f5f5',
       width: 20,
       height: 20,
       borderRadius: 4,
       justifyContent: 'center',
       alignItems: 'center',
       marginRight: 8,
    },
    paymentCountText: {
       fontSize: 12,
       color: '#666',
       fontWeight: '600',
    },
    earnSection: {
       margin: 16,
       marginTop: 24,
    },
    earnTitle: {
       fontSize: 16,
       fontWeight: '700',
       color: '#000',
       marginBottom: 16,
    },
    earnRow: {
       flexDirection: 'row',
       justifyContent: 'space-between',
       alignItems: 'center',
    },
    earnLabel: {
       fontSize: 15,
       color: '#000',
    },
    earnApr: {
       fontSize: 15,
       color: '#00C076',
       fontWeight: '600',
    },
    advertiserSection: {
       margin: 16,
       marginTop: 24,
    },
    sectionHeading: {
       fontSize: 16,
       fontWeight: '700',
       color: '#000',
       marginBottom: 16,
    },
    advertiserHeader: {
       flexDirection: 'row',
       justifyContent: 'space-between',
       alignItems: 'center',
       marginBottom: 16,
    },
    advertiserName: {
       fontSize: 15,
       fontWeight: '700',
       color: '#000',
    },
    onlineDot: {
       width: 8,
       height: 8,
       borderRadius: 4,
       backgroundColor: '#00C076',
       marginRight: 6,
    },
    onlineText: {
       fontSize: 13,
       color: '#999',
       marginRight: 4,
    },
    requirementsList: {
       gap: 12,
    },
    reqItem: {
       fontSize: 13,
       color: '#333',
       lineHeight: 20,
    },
    footer: {
       position: 'absolute',
       bottom: 0,
       left: 0,
       right: 0,
       backgroundColor: '#fff',
       padding: 16,
       paddingBottom: Platform.OS === 'ios' ? 32 : 16,
       borderTopWidth: 1,
       borderTopColor: '#f5f5f5',
    },
    placeOrderBtn: {
       backgroundColor: '#00C076',
       height: 52,
       borderRadius: 12,
       justifyContent: 'center',
       alignItems: 'center',
    },
    placeOrderBtnText: {
       color: '#fff',
       fontSize: 18,
       fontWeight: '700',
    }
  });

export default P2PBuyDetailScreen;
