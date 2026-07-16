import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import { useTicketWallet } from './ticketWallet.hook';
import { ticketWalletStyles as styles } from './ticketWallet.styles';
import type { TicketData } from 'src/core/redux/slice/ticket.type';

/**
 * Ticket Wallet Screen
 * Displays all tickets owned by the user with filtering, upcoming section,
 * and navigation to ticket details.
 */

const FILTERS = [
  { key: 'ALL' as const, label: 'All' },
  { key: 'ACTIVE' as const, label: 'Active' },
  { key: 'USED' as const, label: 'Used' },
  { key: 'EXPIRED' as const, label: 'Past' },
];

function getStatusStyle(status: string) {
  switch (status) {
    case 'ACTIVE':
      return { badge: styles.statusActive, text: styles.statusTextActive };
    case 'USED':
      return { badge: styles.statusUsed, text: styles.statusTextUsed };
    default:
      return { badge: styles.statusCancelled, text: styles.statusTextCancelled };
  }
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getEventEmoji(eventType?: string): string {
  switch (eventType?.toUpperCase()) {
    case 'MOVIE': return '🎬';
    case 'CONCERT': return '🎵';
    case 'FLIGHT': return '✈️';
    case 'HOTEL_BOOKING': return '🏨';
    case 'MATCH': return '⚽';
    default: return '🎫';
  }
}

const TicketWalletScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {
    tickets,
    upcomingTickets,
    isLoading,
    error,
    activeFilter,
    counts,
    changeFilter,
    refresh,
  } = useTicketWallet();

  const handleTicketPress = useCallback((ticket: TicketData) => {
    navigation.navigate(HomeStackScreenKey.TicketDetail, { ticketId: ticket.id });
  }, [navigation]);

  const renderUpcomingItem = useCallback(({ item }: { item: TicketData }) => (
    <TouchableOpacity
      style={styles.upcomingCard}
      onPress={() => handleTicketPress(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.upcomingEventName} numberOfLines={1}>
        {getEventEmoji(item.metadata?.event_type as string)} {item.event_name}
      </Text>
      <Text style={styles.upcomingVenue} numberOfLines={1}>
        📍 {item.venue || 'Venue TBD'}
      </Text>
      <Text style={styles.upcomingTime}>
        🕐 {formatDate(item.start_time)}
      </Text>
    </TouchableOpacity>
  ), [handleTicketPress]);

  const renderTicketItem = useCallback(({ item }: { item: TicketData }) => {
    const statusStyle = getStatusStyle(item.status);

    return (
      <TouchableOpacity
        style={styles.ticketCard}
        onPress={() => handleTicketPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.ticketCardContent}>
          {item.poster_url ? (
            <Image source={{ uri: item.poster_url }} style={styles.ticketPoster} />
          ) : (
            <View style={[styles.ticketPoster, { justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ fontSize: 24 }}>{getEventEmoji(item.metadata?.event_type as string)}</Text>
            </View>
          )}

          <View style={styles.ticketInfo}>
            <Text style={styles.ticketEventName} numberOfLines={1}>
              {item.event_name || 'Event'}
            </Text>
            <Text style={styles.ticketVenue} numberOfLines={1}>
              {item.venue || 'Venue TBD'}
            </Text>
            <Text style={styles.ticketDate}>
              {formatDate(item.start_time)}
            </Text>
            {item.seat_info && (
              <Text style={styles.ticketSeat}>🪑 {item.seat_info}</Text>
            )}
          </View>

          <View style={[styles.statusBadge, statusStyle.badge]}>
            <Text style={[styles.statusText, statusStyle.text]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.dashedLine} />

        <View style={styles.ticketFooter}>
          <Text style={styles.ticketType}>{item.ticket_type_name || 'Standard'}</Text>
          <Text style={styles.ticketPartner}>{item.partner_name}</Text>
        </View>
      </TouchableOpacity>
    );
  }, [handleTicketPress]);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🎫</Text>
      <Text style={styles.emptyTitle}>No tickets yet</Text>
      <Text style={styles.emptySubtitle}>
        Your digital tickets will appear here when event organizers issue them to your wallet.
      </Text>
    </View>
  );

  if (isLoading && tickets.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tickets}
        renderItem={renderTicketItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.ticketList}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor="#2563EB"
            colors={['#2563EB']}
          />
        }
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Tickets</Text>
              <Text style={styles.headerSubtitle}>Your digital ticket wallet</Text>
            </View>

            {/* Stats Bar */}
            <View style={styles.statsBar}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{counts.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#22C55E' }]}>{counts.active}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{counts.used}</Text>
                <Text style={styles.statLabel}>Used</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{counts.expired}</Text>
                <Text style={styles.statLabel}>Past</Text>
              </View>
            </View>

            {/* Filter Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
              {FILTERS.map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterChip,
                    activeFilter === filter.key && styles.filterChipActive,
                  ]}
                  onPress={() => changeFilter(filter.key)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      activeFilter === filter.key && styles.filterChipTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Upcoming Section */}
            {upcomingTickets.length > 0 && (
              <View style={styles.upcomingSection}>
                <Text style={styles.sectionTitle}>🔥 Upcoming</Text>
                <FlatList
                  data={upcomingTickets.slice(0, 5)}
                  renderItem={renderUpcomingItem}
                  keyExtractor={(item) => `upcoming-${item.id}`}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            )}

            {/* All Tickets Title */}
            <Text style={[styles.sectionTitle, { paddingHorizontal: 0, marginBottom: 12 }]}>
              {activeFilter === 'ALL' ? 'All Tickets' : `${activeFilter} Tickets`}
            </Text>
          </>
        }
      />
    </View>
  );
};

export default TicketWalletScreen;
