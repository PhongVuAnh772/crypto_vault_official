import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import { useAppSelector } from 'src/core/redux/hooks';
import type { TicketData } from 'src/core/redux/slice/ticket.type';

// Sample fallback ticket data if store is empty
const SAMPLE_TICKETS: TicketData[] = [
  {
    id: 'ticket_sample_1',
    partnerId: 'partner_vntix',
    eventId: 'CryptoVault World Music Festival 2026',
    ticketTypeId: 'VIP_PASS',
    ticketCode: 'VNTIX-8849201',
    seatInfo: 'VIP Row A-12',
    nftTokenId: '7',
    nftTxHash: '0xf04102a8714b028efd98ae8164361c3156611357161d0e87e6102acc849dd70a',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    event: {
      id: 'evt_1',
      name: 'CryptoVault Music Festival 2026',
      venue: 'Sân Vận Động Mỹ Đình, Hà Nội',
      startTime: '2026-11-20T19:00:00Z',
      eventType: 'CONCERT',
    }
  }
];

export const HomeTicketSection: React.FC = () => {
  const navigation = useNavigation<any>();
  const reduxTickets = useAppSelector((state) => state.ticket?.tickets ?? []);
  const ticketsToDisplay = reduxTickets.length > 0 ? reduxTickets : SAMPLE_TICKETS;

  const handleOpenWallet = () => {
    navigation.navigate(HomeStackScreenKey.TicketWallet);
  };

  const handleOpenQR = (ticketId: string) => {
    navigation.navigate(HomeStackScreenKey.TicketQR, { ticketId });
  };

  const handleOpenDetail = (ticketId: string) => {
    navigation.navigate(HomeStackScreenKey.TicketDetail, { ticketId });
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <View style={styles.iconCircle}>
            <Feather name="tag" size={16} color="#A855F7" />
          </View>
          <Text style={styles.titleText}>Vé NFT Của Tôi</Text>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>1-to-1 Minted</Text>
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.7} style={styles.seeAllBtn} onPress={handleOpenWallet}>
          <Text style={styles.seeAllText}>Tất cả ({ticketsToDisplay.length})</Text>
          <Feather name="chevron-right" size={16} color="#9E86FF" />
        </TouchableOpacity>
      </View>

      {/* Ticket List Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {ticketsToDisplay.map((ticket, index) => {
          return (
            <View key={ticket.id || index} style={styles.ticketCard}>
              {/* Top Accent Line */}
              <View style={styles.cardHeader}>
                <View style={styles.eventInfoLeft}>
                  <Text style={styles.eventEmoji}>🎵</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eventName} numberOfLines={1}>
                      {ticket.event?.name || ticket.eventId || 'CryptoVault Event'}
                    </Text>
                    <Text style={styles.venueText} numberOfLines={1}>
                      📍 {ticket.event?.venue || 'Sân Vận Động Mỹ Đình'}
                    </Text>
                  </View>
                </View>
                <View style={styles.nftBadge}>
                  <Text style={styles.nftBadgeText}>
                    NFT #{ticket.nftTokenId || '7'}
                  </Text>
                </View>
              </View>

              {/* Ticket Middle Info */}
              <View style={styles.cardBody}>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>LOẠI VÉ / GHẾ</Text>
                  <Text style={styles.infoValue}>{ticket.seatInfo || 'VIP Row A-12'}</Text>
                </View>
                <View style={styles.infoColRight}>
                  <Text style={styles.infoLabel}>MÃ VÉ (3RD-PARTY)</Text>
                  <Text style={styles.infoCode}>{ticket.ticketCode || 'VNTIX-8849201'}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.cardActions}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.qrBtn}
                  onPress={() => handleOpenQR(ticket.id)}
                >
                  <Feather name="qr-code" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.qrBtnText}>Mã QR 30s</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.detailBtn}
                  onPress={() => handleOpenDetail(ticket.id)}
                >
                  <Feather name="external-link" size={14} color="#A855F7" style={{ marginRight: 4 }} />
                  <Text style={styles.detailBtnText}>Chi Tiết</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  badgeContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  badgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: '#9E86FF',
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    paddingRight: 16,
    gap: 12,
  },
  ticketCard: {
    width: 310,
    backgroundColor: '#1E1B2E',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    padding: 14,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  eventInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  eventEmoji: {
    fontSize: 20,
  },
  eventName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  venueText: {
    color: '#8F9BB3',
    fontSize: 11,
    marginTop: 2,
  },
  nftBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  nftBadgeText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    paddingHorizontal: 4,
  },
  infoCol: {
    flex: 1,
  },
  infoColRight: {
    alignItems: 'flex-end',
  },
  infoLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  infoValue: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  infoCode: {
    color: '#A855F7',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  qrBtn: {
    flex: 1.5,
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
  },
  qrBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  detailBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
  },
  detailBtnText: {
    color: '#A855F7',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default HomeTicketSection;
