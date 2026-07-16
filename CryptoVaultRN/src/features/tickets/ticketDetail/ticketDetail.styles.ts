import { StyleSheet } from 'react-native';

export const ticketDetailStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Poster Section
  posterContainer: {
    height: 220,
    backgroundColor: '#151A2D',
    overflow: 'hidden',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  posterOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 14, 26, 0.4)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  posterPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#151A2D',
  },
  posterEmoji: {
    fontSize: 64,
  },

  // Ticket Card
  ticketCard: {
    marginHorizontal: 20,
    marginTop: -40,
    backgroundColor: '#151A2D',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E2436',
    overflow: 'hidden',
  },
  ticketCardMain: {
    padding: 20,
  },
  eventName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.3,
  },

  // Info rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 10,
    width: 24,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#8B95A8',
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 8,
    width: 70,
  },
  infoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  // Status
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E2436',
  },
  statusBadgeLarge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusTextLarge: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ticketTypeLabel: {
    fontSize: 14,
    color: '#8B95A8',
    fontWeight: '500',
  },

  // Dashed Separator
  dashedSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    height: 20,
  },
  dashedCircleLeft: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0A0E1A',
    position: 'absolute',
    left: -26,
  },
  dashedCircleRight: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0A0E1A',
    position: 'absolute',
    right: -26,
  },
  dashedLineInner: {
    flex: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#1E2436',
    height: 0,
  },

  // QR Preview
  qrPreviewSection: {
    padding: 20,
    alignItems: 'center',
  },
  qrPreviewButton: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qrPreviewButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Details Section
  detailsSection: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: '#151A2D',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E2436',
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2436',
  },
  detailLabel: {
    fontSize: 13,
    color: '#8B95A8',
  },
  detailValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
    maxWidth: '55%',
    textAlign: 'right',
  },

  // Action Buttons
  actionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 34,
    backgroundColor: '#0A0E1A',
    borderTopWidth: 1,
    borderTopColor: '#1E2436',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryAction: {
    backgroundColor: '#2563EB',
  },
  secondaryAction: {
    backgroundColor: '#151A2D',
    borderWidth: 1,
    borderColor: '#1E2436',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryActionText: {
    color: '#8B95A8',
  },
  disabledAction: {
    opacity: 0.4,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0E1A',
  },
});
