import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Linking,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSelector } from "react-redux";
import { ScreenWrapper } from "src/components";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import { getIsTestnet } from "src/core/redux/slice/app.slice";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";

const DepositOptionsScreen: React.FC<RootNavigationType> = ({ navigation }) => {
  const theme = useAppTheme();
  const styles = useStyles(theme);
  const isTestnet = useSelector(getIsTestnet);
  const options = [
    {
      id: "wallet-connect",
      title: "Wallet Connect",
      desc: "Connect to decentralized applications (dApps) securely",
      icon: "link",
      color: "#007AFF",
      onPress: () => navigation.navigate(HomeStackScreenKey.ScanScreen),
      badges: ["WEB3", "DAPPS"]
    },
    ...(isTestnet ? [{
      id: "ton-faucet",
      title: "Get Testnet TON",
      desc: "Get free TON Testnet tokens from the official Telegram bot faucet",
      icon: "send",
      color: "#0088CC",
      onPress: () => Linking.openURL("https://t.me/testgiver_ton_bot"),
      badges: ["FAUCET", "FREE"]
    }] : []),
    {
      id: "buy",
      title: "Buy Crypto",
      desc: "Purchase with Visa/Mastercard or Bank Transfer via MoonPay/Transak",
      icon: "credit-card",
      color: "#FF2D55",
      onPress: () => {
        // Here you would typically open a WebView or initiate an On-ramp flow
        console.log("Opening Buy flow...");
      },
      badges: ["VISA", "MASTERCARD"]
    },
    {
      id: "p2p",
      title: "P2P Trading",
      desc: "Buy instantly from other verified users; Fast & Secure",
      icon: "users",
      color: "#34C759",
      onPress: () => navigation.navigate(HomeStackScreenKey.P2PMarket),
      badges: ["P2P MARKET"]
    }
  ];

  return (
    <ScreenWrapper
      headerTitle="Add Money"
      enableHeader
      backgroundColor="#F2F2F7"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.subTitle}>Choose how you want to fund your account</Text>
        
        {options.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
              <Feather name={item.icon as any} size={28} color="#fff" />
            </View>
            
            <View style={styles.textContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{item.title}</Text>
                <Feather name="chevron-right" size={20} color="#C7C7CC" />
              </View>
              <Text style={styles.desc}>{item.desc}</Text>
              
              <View style={styles.badgeRow}>
                {item.badges.map((badge) => (
                  <View key={badge} style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
                  </View>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.infoBox}>
          <Feather name="shield" size={20} color="#8E8E93" />
          <Text style={styles.infoText}>
            All transactions are secure and encrypted. Digital assets carry risk.
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const useStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      padding: 20,
    },
    subTitle: {
      fontSize: 16,
      color: "#8E8E93",
      marginBottom: 24,
      fontWeight: "500",
    },
    card: {
      backgroundColor: "#fff",
      borderRadius: 24,
      padding: 20,
      flexDirection: "row",
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    textContainer: {
      flex: 1,
    },
    titleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: "#1C1C1E",
    },
    desc: {
      fontSize: 14,
      color: "#8E8E93",
      lineHeight: 20,
      marginBottom: 12,
    },
    badgeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    badge: {
      backgroundColor: "#F2F2F7",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      marginRight: 8,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: "700",
      color: "#8E8E93",
    },
    infoBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(142, 142, 147, 0.1)",
      padding: 16,
      borderRadius: 16,
      marginTop: 20,
    },
    infoText: {
      fontSize: 12,
      color: "#8E8E93",
      marginLeft: 12,
      flex: 1,
      lineHeight: 18,
    },
  });

export default DepositOptionsScreen;
