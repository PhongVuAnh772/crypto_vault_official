import { api } from '../api.service';
import type {
  TicketData,
  QRGenerateResponse,
  ApiResponse,
  VerifyQRResponse,
  ScanHistoryEntry,
  ScanStatsResponse,
  NotificationData,
  OfflineScanEntry,
} from '../../redux/slice/ticket.type';

/**
 * Ticket Service
 * API client for all ticket platform endpoints.
 */

// ============================================================
// Ticket Wallet (User-facing)
// ============================================================

/**
 * Fetch all tickets for a wallet address.
 */
export async function fetchMyTickets(walletAddress: string, status?: string): Promise<TicketData[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);

  // This endpoint is accessed with partner auth from backend,
  // but for mobile wallet, we use a user-specific endpoint
  const response = await api.get<ApiResponse<TicketData[]>>(
    `/api/v1/tickets/wallet/${walletAddress}?${params.toString()}`
  );
  return response.data.data || [];
}

/**
 * Get ticket detail by ID.
 */
export async function getTicketDetail(ticketId: string): Promise<TicketData | null> {
  const response = await api.get<ApiResponse<TicketData>>(`/api/v1/tickets/${ticketId}`);
  return response.data.data || null;
}

/**
 * Transfer a ticket to another wallet address.
 */
export async function transferTicket(
  ticketId: string,
  toAddress: string
): Promise<TicketData> {
  const response = await api.post<ApiResponse<TicketData>>(
    `/api/v1/tickets/${ticketId}/transfer`,
    { toAddress }
  );
  if (!response.data.success) {
    throw new Error(response.data.error || 'Transfer failed');
  }
  return response.data.data!;
}

// ============================================================
// QR Code
// ============================================================

/**
 * Generate a dynamic QR code for a ticket.
 */
export async function generateQR(ticketId: string): Promise<QRGenerateResponse> {
  const response = await api.post<ApiResponse<QRGenerateResponse>>(
    '/api/v1/qr/generate',
    { ticketId }
  );
  if (!response.data.success) {
    throw new Error(response.data.error || 'QR generation failed');
  }
  return response.data.data!;
}

/**
 * Refresh QR nonce (for auto-refresh loop).
 */
export async function refreshNonce(ticketId: string): Promise<QRGenerateResponse> {
  const response = await api.post<ApiResponse<QRGenerateResponse>>(
    '/api/v1/qr/refresh-nonce',
    { ticketId }
  );
  if (!response.data.success) {
    throw new Error(response.data.error || 'Nonce refresh failed');
  }
  return response.data.data!;
}

/**
 * Generate an offline verification token.
 */
export async function generateOfflineToken(ticketId: string): Promise<{ token: string; expiresAt: string }> {
  const response = await api.post<ApiResponse<{ token: string; expiresAt: string }>>(
    '/api/v1/qr/offline-token',
    { ticketId }
  );
  if (!response.data.success) {
    throw new Error(response.data.error || 'Offline token generation failed');
  }
  return response.data.data!;
}

// ============================================================
// Scanner (Staff)
// ============================================================

/**
 * Verify a QR code payload.
 */
export async function verifyQR(
  payload: object,
  deviceInfo?: object,
  location?: object
): Promise<VerifyQRResponse> {
  const response = await api.post<ApiResponse<VerifyQRResponse>>(
    '/api/v1/verify/qr',
    { payload, deviceInfo, location }
  );
  return response.data.data || { status: 'INVALID', message: 'Unknown error' };
}

/**
 * Check in a ticket (mark as used).
 */
export async function checkIn(
  ticketId: string,
  scanMethod: string = 'QR',
  deviceInfo?: object,
  location?: object
): Promise<{ status: string; ticket: TicketData; message: string }> {
  const response = await api.post<ApiResponse<{ status: string; ticket: TicketData; message: string }>>(
    '/api/v1/verify/check-in',
    { ticketId, scanMethod, deviceInfo, location }
  );
  if (!response.data.success) {
    throw new Error(response.data.error || 'Check-in failed');
  }
  return response.data.data!;
}

/**
 * Submit offline verification batch.
 */
export async function submitOfflineBatch(
  scans: OfflineScanEntry[]
): Promise<{ total: number; synced: number; failed: number; results: Array<{ ticketId: string; status: string; success: boolean }> }> {
  const response = await api.post<ApiResponse<{ total: number; synced: number; failed: number; results: Array<{ ticketId: string; status: string; success: boolean }> }>>(
    '/api/v1/verify/offline',
    { scans }
  );
  if (!response.data.success) {
    throw new Error(response.data.error || 'Offline sync failed');
  }
  return response.data.data!;
}

/**
 * Get scan history for current staff member.
 */
export async function getScanHistory(eventId?: string): Promise<ScanHistoryEntry[]> {
  const params = eventId ? `?eventId=${eventId}` : '';
  const response = await api.get<ApiResponse<ScanHistoryEntry[]>>(
    `/api/v1/staff/scan-history${params}`
  );
  return response.data.data || [];
}

/**
 * Get scan statistics.
 */
export async function getScanStats(eventId?: string): Promise<ScanStatsResponse> {
  const params = eventId ? `?eventId=${eventId}` : '';
  const response = await api.get<ApiResponse<ScanStatsResponse>>(
    `/api/v1/staff/stats${params}`
  );
  return response.data.data!;
}

// ============================================================
// Notifications
// ============================================================

/**
 * Get user notifications.
 */
export async function getNotifications(
  options: { limit?: number; offset?: number; unreadOnly?: boolean } = {}
): Promise<{ notifications: NotificationData[]; unreadCount: number }> {
  const params = new URLSearchParams();
  if (options.limit) params.append('limit', String(options.limit));
  if (options.offset) params.append('offset', String(options.offset));
  if (options.unreadOnly) params.append('unreadOnly', 'true');

  const response = await api.get<ApiResponse<{ notifications: NotificationData[]; unreadCount: number }>>(
    `/api/v1/notifications?${params.toString()}`
  );
  return response.data.data || { notifications: [], unreadCount: 0 };
}

/**
 * Mark a notification as read.
 */
export async function markNotificationRead(notificationId: string): Promise<void> {
  await api.put(`/api/v1/notifications/${notificationId}/read`);
}

/**
 * Mark all notifications as read.
 */
export async function markAllNotificationsRead(): Promise<void> {
  await api.put('/api/v1/notifications/read-all');
}

/**
 * Staff login.
 */
export async function staffLogin(
  email: string,
  password: string
): Promise<{ token: string; staff: { id: string; name: string; email: string; role: string; partnerId: string; partnerName: string } }> {
  const response = await api.post<ApiResponse<{ token: string; staff: object }>>(
    '/api/v1/staff/login',
    { email, password }
  );
  if (!response.data.success) {
    throw new Error(response.data.error || 'Login failed');
  }
  return response.data.data as any;
}
