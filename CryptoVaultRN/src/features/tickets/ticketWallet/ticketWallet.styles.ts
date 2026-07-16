import { StyleSheet } from 'react-native';

export const ticketWalletStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8B95A8',
    marginTop: 4,
  },

  // Stats Bar
  statsBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#151A2D',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: '#8B95A8',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Filter Chips
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#151A2D',
    borderWidth: 1,
    borderColor: '#1E2436',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B95A8',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },

  // Upcoming Section
  upcomingSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  upcomingCard: {
    backgroundColor: '#151A2D',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 280,
    borderWidth: 1,
    borderColor: '#1E2436',
  },
  upcomingEventName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  upcomingVenue: {
    fontSize: 13,
    color: '#8B95A8',
    marginBottom: 8,
  },
  upcomingTime: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },

  // Ticket List
  ticketList: {
    paddingHorizontal: 20,
  },
  ticketCard: {
    backgroundColor: '#151A2D',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E2436',
  },
  ticketCardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  ticketPoster: {
    width: 60,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#1E2436',
  },
  ticketInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  ticketEventName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  ticketVenue: {
    fontSize: 12,
    color: '#8B95A8',
    marginBottom: 4,
  },
  ticketDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  ticketSeat: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 4,
  },

  // Status Badge
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  statusActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  statusUsed: {
    backgroundColor: 'rgba(107, 114, 128, 0.15)',
  },
  statusCancelled: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusTextActive: {
    color: '#22C55E',
  },
  statusTextUsed: {
    color: '#6B7280',
  },
  statusTextCancelled: {
    color: '#EF4444',
  },

  // Dashed line separator
  dashedLine: {
    height: 1,
    marginHorizontal: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#1E2436',
  },

  // Bottom action strip
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  ticketType: {
    fontSize: 12,
    color: '#8B95A8',
  },
  ticketPartner: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8B95A8',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
