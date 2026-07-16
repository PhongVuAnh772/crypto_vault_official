import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import { useTicketDetail } from './ticketDetail.hook';
import { ticketDetailStyles as styles } from './ticketDetail.styles';

/**
 * Ticket Detail Screen
 * Displays full ticket information with QR code access and transfer/refund actions.
 */

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function shortenAddress(addr?: string): string {
  if (!addr) return 'N/A';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function getStatusColors(status: string) {
  switch (status) {
    case 'ACTIVE':
      return { bg: 'rgba(34, 197, 94, 0.15)', text: '#22C55E' };
    case 'USED':
      return { bg: 'rgba(107, 114, 128, 0.15)', text: '#6B7280' };
    case 'CANCELLED':
    case 'REFUNDED':
      return { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444' };
    case 'EXPIRED':
      return { bg: 'rgba(234, 179, 8, 0.15)', text: '#EAB308' };
    default:
      return { bg: 'rgba(107, 114, 128, 0.15)', text: '#6B7280' };
  }
}

const TicketDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { ticketId } = route.params;

  const {
    ticket,
    isLoading,
    error,
    isActive,
    isTransferable,
  } = useTicketDetail(ticketId);

  if (isLoading || !ticket) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const statusColors = getStatusColors(ticket.status);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Poster */}
        <View style={styles.posterContainer}>
          {ticket.poster_url ? (
            <>
              <Image source={{ uri: ticket.poster_url }} style={styles.posterImage} resizeMode="cover" />
              <View style={styles.posterOverlay} />
            </>
          ) : (
            <View style={styles.posterPlaceholder}>
              <Text style={styles.posterEmoji}>🎫</Text>
            </View>
          )}
        </View>

        {/* Main Ticket Card */}
        <View style={styles.ticketCard}>
          <View style={styles.ticketCardMain}>
            <Text style={styles.eventName}>{ticket.event_name || 'Event'}</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📍</Text>
              <Text style={styles.infoText}>{ticket.venue || 'Venue TBD'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📅</Text>
              <Text style={styles.infoText}>{formatDate(ticket.start_time)}</Text>
            </View>

            {ticket.seat_info && (
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>🪑</Text>
                <Text style={styles.infoText}>{ticket.seat_info}</Text>
              </View>
            )}

            {ticket.gate && (
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>🚪</Text>
                <Text style={styles.infoText}>Gate {ticket.gate}</Text>
              </View>
            )}

            {/* Status */}
            <View style={styles.statusContainer}>
              <Text style={styles.ticketTypeLabel}>{ticket.ticket_type_name || 'Standard'}</Text>
              <View style={[styles.statusBadgeLarge, { backgroundColor: statusColors.bg }]}>
                <Text style={[styles.statusTextLarge, { color: statusColors.text }]}>
                  {ticket.status}
                </Text>
              </View>
            </View>
          </View>

          {/* Dashed Separator */}
          <View style={styles.dashedSeparator}>
            <View style={styles.dashedCircleLeft} />
            <View style={styles.dashedLineInner} />
            <View style={styles.dashedCircleRight} />
          </View>

          {/* QR Code Section */}
          {isActive && (
            <View style={styles.qrPreviewSection}>
              <TouchableOpacity
                style={styles.qrPreviewButton}
                onPress={() => navigation.navigate(HomeStackScreenKey.TicketQR, { ticketId: ticket.id })}
              >
                <Text style={{ fontSize: 20 }}>📱</Text>
                <Text style={styles.qrPreviewButtonText}>Show QR Code</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <Text style={styles.detailsTitle}>Ticket Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ticket ID</Text>
            <Text style={styles.detailValue}>{ticket.id.slice(0, 8)}...</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Partner</Text>
            <Text style={styles.detailValue}>{ticket.partner_name || 'N/A'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Owner Wallet</Text>
            <Text style={styles.detailValue}>{shortenAddress(ticket.owner_wallet_address)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Issued</Text>
            <Text style={styles.detailValue}>{formatDate(ticket.issued_at)}</Text>
          </View>

          {ticket.price !== undefined && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Price</Text>
              <Text style={styles.detailValue}>{ticket.price} {ticket.currency}</Text>
            </View>
          )}

          {ticket.contract_address && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Contract</Text>
              <Text style={styles.detailValue}>{shortenAddress(ticket.contract_address)}</Text>
            </View>
          )}

          {ticket.token_id !== undefined && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Token ID</Text>
              <Text style={styles.detailValue}>#{ticket.token_id}</Text>
            </View>
          )}

          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.detailLabel}>Transfers</Text>
            <Text style={styles.detailValue}>{ticket.transfer_count}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      {isActive && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryAction]}
            onPress={() => navigation.navigate(HomeStackScreenKey.TicketQR, { ticketId: ticket.id })}
          >
            <Text style={styles.actionButtonText}>📱 Show QR</Text>
          </TouchableOpacity>

          {isTransferable && (
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryAction]}
              onPress={() => navigation.navigate(HomeStackScreenKey.TicketTransfer, { ticketId: ticket.id })}
            >
              <Text style={[styles.actionButtonText, styles.secondaryActionText]}>↗️ Transfer</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default TicketDetailScreen;
