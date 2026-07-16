/**
 * Ticket Type Definitions
 * TypeScript types for the ticket wallet system.
 */

// ============================================================
// Core Entities
// ============================================================

export type TicketStatus = 'ACTIVE' | 'USED' | 'CANCELLED' | 'EXPIRED' | 'TRANSFERRED' | 'REFUNDED';

export type ScanResult = 'VALID' | 'INVALID' | 'ALREADY_USED' | 'EXPIRED' | 'CANCELLED' | 'NOT_FOUND';

export interface TicketData {
  id: string;
  ticket_type_id: string;
  event_id: string;
  partner_id: string;
  // Ownership
  owner_wallet_address: string;
  owner_user_id?: string;
  // Blockchain
  token_id?: number;
  contract_address?: string;
  chain_id?: string;
  mint_tx_hash?: string;
  metadata_uri?: string;
  // Ticket info
  external_ticket_id?: string;
  seat_info?: string;
  gate?: string;
  row_info?: string;
  status: TicketStatus;
  // QR
  qr_nonce?: string;
  qr_nonce_expires_at?: string;
  // Timestamps
  used_at?: string;
  issued_at: string;
  expires_at?: string;
  cancelled_at?: string;
  refunded_at?: string;
  transfer_count: number;
  metadata: Record<string, unknown>;
  // Joined fields from API
  event_name?: string;
  event_description?: string;
  venue?: string;
  venue_address?: string;
  city?: string;
  country?: string;
  start_time?: string;
  end_time?: string;
  poster_url?: string;
  event_status?: string;
  ticket_type_name?: string;
  price?: number;
  currency?: string;
  is_transferable?: boolean;
  is_refundable?: boolean;
  partner_name?: string;
  partner_logo?: string;
}

export interface EventData {
  id: string;
  partner_id: string;
  external_id?: string;
  name: string;
  description?: string;
  event_type: string;
  venue?: string;
  venue_address?: string;
  city?: string;
  country?: string;
  start_time: string;
  end_time?: string;
  status: string;
  max_capacity?: number;
  current_attendance: number;
  poster_url?: string;
  metadata: Record<string, unknown>;
}

export interface TicketTypeData {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  max_supply?: number;
  issued_count: number;
  is_transferable: boolean;
  is_refundable: boolean;
}

// ============================================================
// QR
// ============================================================

export interface QRPayload {
  v: number;
  tid: string;
  eid: string;
  owa: string;
  n: string;
  ts: number;
  sig: string;
}

export interface QRGenerateResponse {
  payload: QRPayload;
  qrString: string;
  expiresAt: string;
  ttlMs: number;
}

// ============================================================
// Scanner
// ============================================================

export interface ScanHistoryEntry {
  id: string;
  ticket_id: string;
  event_id: string;
  staff_id: string;
  scan_result: ScanResult;
  scan_method: string;
  is_check_in: boolean;
  device_info: Record<string, unknown>;
  location: Record<string, unknown>;
  offline_scanned: boolean;
  scanned_at: string;
  // Joined
  seat_info?: string;
  ticket_status?: TicketStatus;
  event_name?: string;
  venue?: string;
}

export interface OfflineScanEntry {
  ticketId: string;
  offlineToken: string;
  scanMethod: string;
  deviceInfo: Record<string, unknown>;
  location: Record<string, unknown>;
  scannedAt: string;
}

// ============================================================
// Notification
// ============================================================

export interface NotificationData {
  id: string;
  user_id: string;
  title: string;
  body?: string;
  type: string;
  priority: string;
  reference_type?: string;
  reference_id?: string;
  action_url?: string;
  image_url?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

// ============================================================
// API Responses
// ============================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface VerifyQRResponse {
  status: ScanResult;
  message: string;
  ticket?: TicketData;
}

export interface ScanStatsResponse {
  overall: {
    total_scans: number;
    valid_scans: number;
    invalid_scans: number;
    duplicate_scans: number;
    check_ins: number;
    offline_scans: number;
    first_scan?: string;
    last_scan?: string;
  };
  today: {
    today_scans: number;
    today_check_ins: number;
  };
}
