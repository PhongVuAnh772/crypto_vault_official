// @ts-nocheck
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenWrapper } from 'src/components';
import { useAppTheme } from "src/core/hooks/useAppTheme";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MoreActionScreen: React.FC<RootNavigationType> = ({ navigation }) => {
  const theme = useAppTheme();
  const styles = useStyles(theme);
  const insets = useSafeAreaInsets();

  const sections = [
    {
      title: "Exchange & Market",
      items: [
        { id: 'swap', title: 'Swap', icon: 'repeat', color: '#5856D6', key: HomeStackScreenKey.Swap, type: 'feather' },
        { id: 'p2p', title: 'P2P Market', icon: 'users', color: '#34C759', key: HomeStackScreenKey.P2PMarket, type: 'feather' },
        { id: 'trading', title: 'Trading', icon: 'trending-up', color: '#FF9500', key: HomeStackScreenKey.Trading, type: 'feather' },
        { id: 'ai', title: 'AI Assistant', icon: 'cpu', color: '#FF2D55', key: HomeStackScreenKey.AIDetailScreen, type: 'feather' },
      ]
    },
    {
      title: "Asset Management",
      items: [
        { id: 'tokens', title: 'Manage Tokens', icon: 'layers', color: '#007AFF', key: HomeStackScreenKey.ManageCrypto, type: 'feather' },
        { id: 'protocols', title: 'Protocols', icon: 'share-2', color: '#AF52DE', key: HomeStackScreenKey.AddProtocol, type: 'feather' },
        { id: 'wallet_connect', title: 'WalletConnect', icon: 'qrcode-scan', color: '#5AC8FA', key: HomeStackScreenKey.ScanScreen, type: 'material' },
        { id: 'backup', title: 'Backup', icon: 'shield', color: '#FFCC00', key: HomeStackScreenKey.RecoveryPhrase, type: 'feather' },
      ]
    },
    {
      title: "Security & App",
      items: [
        { id: 'security', title: 'Security', icon: 'lock', color: '#8E8E93', key: HomeStackScreenKey.ChangePincode, type: 'feather' },
        { id: 'currency', title: 'Currency', icon: 'dollar-sign', color: '#4CD964', key: HomeStackScreenKey.Currency, type: 'feather' },
        { id: 'language', title: 'Language', icon: 'globe', color: '#007AFF', key: HomeStackScreenKey.ChangeLanguage, type: 'feather' },
        { id: 'support', title: 'Support', icon: 'help-circle', color: '#5856D6', key: HomeStackScreenKey.FAQ, type: 'feather' },
      ]
    }
  ];

  const renderIcon = (item: any) => {
    if (item.type === 'material') {
      return <MaterialCommunityIcons name={item.icon} size={28} color={item.color} />;
    }
    return <Feather name={item.icon} size={26} color={item.color} />;
  };

  return (
    <ScreenWrapper
      headerTitle="Menu"
      enableHeader
      headerTitleStyle={{ color: '#FFFFFF', fontWeight: '800' }}
      headerStyle={{ backgroundColor: 'transparent' }}
      backgroundColor="#000000"
      backButtonColor="#FFFFFF"
      paddingTop={true}
      paddingBottom={false}
    >
      <LinearGradient
        colors={['#000000', '#121212', '#000000']}
        style={[StyleSheet.absoluteFill, { zIndex: -1 }]}
      />
      
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
      >
        <View style={styles.promoContainer}>
          <LinearGradient
            colors={['#7C3AED', '#4F46E5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.promoCard}
          >
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>Invite Friends</Text>
              <Text style={styles.promoDesc}>Earn €60 for each referral</Text>
            </View>
            <TouchableOpacity style={styles.promoBtn}>
              <Text style={styles.promoBtnText}>Invite</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {sections.map((section, sIdx) => (
          <View key={sIdx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.grid}>
              {section.items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  style={styles.gridItem}
                  onPress={() => navigation.navigate(item.key as any)}
                >
                  <View style={[styles.iconInner, { backgroundColor: `${item.color}15` }]}>
                    {renderIcon(item)}
                  </View>
                  <Text style={styles.itemLabel}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
};

const useStyles = (theme: any) =>
  StyleSheet.create({
    scrollContent: {
      paddingTop: 10,
    },
    promoContainer: {
      paddingHorizontal: 16,
      marginBottom: 32,
    },
    promoCard: {
      borderRadius: 24,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    promoTitle: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '800',
    },
    promoDesc: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: 13,
      marginTop: 2,
    },
    promoContent: {
      flex: 1,
    },
    promoBtn: {
      backgroundColor: '#fff',
      paddingHorizontal: 18,
      paddingVertical: 8,
      borderRadius: 12,
    },
    promoBtnText: {
      color: '#4F46E5',
      fontWeight: '700',
      fontSize: 13,
    },
    section: {
      paddingHorizontal: 16,
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: '#FFFFFF',
      marginBottom: 16,
      letterSpacing: -0.2,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      borderRadius: 32,
      padding: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    gridItem: {
      width: '25%',
      alignItems: 'center',
      paddingVertical: 14,
    },
    iconGlass: {
      width: 56,
      height: 56,
      borderRadius: 20,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    iconInner: {
      width: 42,
      height: 42,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    itemLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: 'rgba(255, 255, 255, 0.7)',
      textAlign: 'center',
      marginTop: 10,
    },
  });

export default MoreActionScreen;

