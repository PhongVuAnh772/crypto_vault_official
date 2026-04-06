import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  Alert,
  Clipboard,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import { HomeStackParamListType } from "src/navigation/stacks/type/HomeStackParamListType";
import { RouteProp, useRoute } from "@react-navigation/native";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";

type P2POrderDetailsRouteProp = RouteProp<HomeStackParamListType, HomeStackScreenKey.P2POrderDetails>;

const P2POrderDetailsScreen: React.FC<RootNavigationType> = ({ navigation }) => {
  const theme = useAppTheme();
  const styles = useStyles(theme);
  const route = useRoute<P2POrderDetailsRouteProp>();
  const { orderId, amountFiat, amountCrypto, currency, tokenSymbol, merchant, expiryTime } = route.params;

  const [timeLeft, setTimeLeft] = useState("");
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = expiryTime - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        clearInterval(timer);
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryTime]);

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert("Success", `${label} copied to clipboard`);
  };

  const handlePaid = () => {
    Alert.alert(
      "Confirm Payment",
      "Have you already made the payment to the merchant? CryptoVault will verify this soon.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes, I have paid", 
          onPress: () => {
            Alert.alert("Success", "Merchant has been notified. Crypto will be released after confirmation.", [
                { text: "OK", onPress: () => navigation.navigate(HomeStackScreenKey.BottomTab as any) }
            ]);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <TouchableOpacity onPress={() => Alert.alert("Support", "Connecting to 24/7 support...")}>
            <Feather name="headphones" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Status and Timer */}
          <View style={styles.statusSection}>
            <View>
              <Text style={styles.statusTitle}>Pending Payment</Text>
              <Text style={styles.statusDesc}>Please pay the merchant within {timeLeft}</Text>
            </View>
            <View style={styles.timerCircle}>
               <MaterialIcons name="timer" size={20} color="#00C076" />
               <Text style={styles.timerText}>{timeLeft}</Text>
            </View>
          </View>

          {/* Amount Summary */}
          <View style={styles.amountCard}>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>You are buying</Text>
              <Text style={styles.amountValue}>{amountCrypto} {tokenSymbol}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.amountRow}>
              <Text style={styles.fiatLabel}>Payment Amount</Text>
              <Text style={styles.fiatValue}>${parseFloat(amountFiat).toLocaleString()} {currency}</Text>
            </View>
          </View>

          {/* Merchant Bank Info */}
          <View style={styles.paymentSection}>
            <View style={styles.sectionHeader}>
               <Text style={styles.sectionTitle}>Merchant's Payment Info</Text>
               <TouchableOpacity onPress={() => setShowPaymentInfo(!showPaymentInfo)}>
                  <Text style={styles.toggleText}>{showPaymentInfo ? "Hide" : "Show"}</Text>
               </TouchableOpacity>
            </View>

            <View style={styles.paymentCard}>
               <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Name</Text>
                  <TouchableOpacity onPress={() => copyToClipboard(merchant.accountName || merchant.name, "Name")}>
                     <Text style={styles.infoValue}>{merchant.accountName || merchant.name} <Feather name="copy" size={14} color="#00C076" /></Text>
                  </TouchableOpacity>
               </View>
               
               <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Bank Name</Text>
                  <Text style={styles.infoValue}>{merchant.bankName || "Chase Bank"}</Text>
               </View>

               <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Bank Account</Text>
                  <TouchableOpacity onPress={() => copyToClipboard(merchant.accountNumber || "1234567890", "Account Number")}>
                     <Text style={styles.infoValue}>{merchant.accountNumber || "1234567890"} <Feather name="copy" size={14} color="#00C076" /></Text>
                  </TouchableOpacity>
               </View>
            </View>
          </View>

          {/* Transfer Instructions */}
          <View style={styles.instructionSection}>
             <Text style={styles.instructionTitle}>Payment Instructions</Text>
             
             <View style={styles.warningCard}>
                <MaterialIcons name="warning" size={20} color="#FFD700" />
                <Text style={styles.warningText}>
                  DO NOT include any crypto-related words (e.g. BTC, Crypto, USDT) in the transfer note to avoid bank account freeze.
                </Text>
             </View>

             <View style={styles.stepRow}>
                <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
                <Text style={styles.stepText}>Open your bank app and transfer <Text style={styles.highlight}>${parseFloat(amountFiat).toLocaleString()}</Text> to the account above.</Text>
             </View>
             <View style={styles.stepRow}>
                <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
                <Text style={styles.stepText}>Ensure the account name matches the merchant's name on CryptoVault.</Text>
             </View>
             <View style={styles.stepRow}>
                <View style={styles.stepNum}><Text style={styles.stepNumText}>3</Text></View>
                <Text style={styles.stepText}>After transfer, tap the "Transferred, notify seller" button below.</Text>
             </View>
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
           <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.paidButton} onPress={handlePaid}>
              <Text style={styles.paidButtonText}>Transferred, notify seller</Text>
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
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255,255,255,0.05)",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: "#fff",
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 100,
    },
    statusSection: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
    },
    statusTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: "#fff",
    },
    statusDesc: {
      fontSize: 14,
      color: "#8E8E93",
      marginTop: 4,
    },
    timerCircle: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(0,192,118,0.1)",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    timerText: {
      color: "#00C076",
      fontWeight: "700",
      marginLeft: 6,
      fontSize: 16,
    },
    amountCard: {
      backgroundColor: "rgba(255,255,255,0.05)",
      borderRadius: 16,
      padding: 20,
      marginBottom: 32,
    },
    amountRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    amountLabel: {
      color: "#8E8E93",
      fontSize: 14,
    },
    amountValue: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "700",
    },
    divider: {
      height: 1,
      backgroundColor: "rgba(255,255,255,0.05)",
      marginVertical: 16,
    },
    fiatLabel: {
      color: "#8E8E93",
      fontSize: 16,
      fontWeight: "600",
    },
    fiatValue: {
      color: "#00C076",
      fontSize: 22,
      fontWeight: "700",
    },
    paymentSection: {
      marginBottom: 32,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: "#fff",
    },
    warningCard: {
      flexDirection: "row",
      backgroundColor: "rgba(255, 215, 0, 0.05)",
      padding: 12,
      borderRadius: 12,
      marginBottom: 20,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "rgba(255, 215, 0, 0.15)",
    },
    warningText: {
      color: "#FFD700",
      fontSize: 12,
      flex: 1,
      marginLeft: 10,
      lineHeight: 18,
    },
    toggleText: {
      color: "#00C076",
      fontWeight: "600",
    },
    paymentCard: {
      backgroundColor: "rgba(255,192,0,0.05)", // Slight yellowish for banking info
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: "rgba(255,192,0,0.1)",
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    infoLabel: {
      color: "#8E8E93",
      fontSize: 14,
    },
    infoValue: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "600",
    },
    instructionSection: {
      marginBottom: 32,
    },
    instructionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: "#fff",
      marginBottom: 16,
    },
    stepRow: {
      flexDirection: "row",
      marginBottom: 16,
    },
    stepNum: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: "rgba(0,192,118,0.1)",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    stepNumText: {
      color: "#00C076",
      fontWeight: "700",
      fontSize: 12,
    },
    stepText: {
      color: "#8E8E93",
      fontSize: 14,
      flex: 1,
      lineHeight: 20,
    },
    highlight: {
      color: "#fff",
      fontWeight: "600",
    },
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: "row",
      padding: 16,
      backgroundColor: "#050B09",
      borderTopWidth: 1,
      borderTopColor: "rgba(255,255,255,0.05)",
    },
    cancelButton: {
      flex: 1,
      height: 52,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    cancelButtonText: {
      color: "#FF4D4D",
      fontSize: 16,
      fontWeight: "600",
    },
    paidButton: {
      flex: 2,
      backgroundColor: "#00C076",
      height: 52,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    paidButtonText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "700",
    }
  });

export default P2POrderDetailsScreen;
