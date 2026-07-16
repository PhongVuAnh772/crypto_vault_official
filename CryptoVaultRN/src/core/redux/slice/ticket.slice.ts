import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type {
  TicketData,
  QRGenerateResponse,
  ScanHistoryEntry,
  OfflineScanEntry,
  NotificationData,
} from './ticket.type';

// ============================================================
// State
// ============================================================

interface TicketState {
  // Wallet
  tickets: TicketData[];
  activeTicket: TicketData | null;
  ticketsLoading: boolean;
  ticketsError: string | null;

  // QR
  activeQR: QRGenerateResponse | null;
  qrLoading: boolean;

  // Scanner (staff mode)
  scanHistory: ScanHistoryEntry[];
  scanHistoryLoading: boolean;
  lastScanResult: {
    status: string;
    message: string;
    ticket?: TicketData;
  } | null;

  // Offline
  offlineQueue: OfflineScanEntry[];
  offlineSyncing: boolean;

  // Notifications
  notifications: NotificationData[];
  unreadCount: number;
  notificationsLoading: boolean;

  // Filters
  activeFilter: 'ALL' | 'ACTIVE' | 'USED' | 'EXPIRED';
}

const initialState: TicketState = {
  tickets: [],
  activeTicket: null,
  ticketsLoading: false,
  ticketsError: null,

  activeQR: null,
  qrLoading: false,

  scanHistory: [],
  scanHistoryLoading: false,
  lastScanResult: null,

  offlineQueue: [],
  offlineSyncing: false,

  notifications: [],
  unreadCount: 0,
  notificationsLoading: false,

  activeFilter: 'ALL',
};

// ============================================================
// Slice
// ============================================================

const ticketSlice = createSlice({
  name: 'ticket',
  initialState,
  reducers: {
    // Tickets
    setTickets: (state, action: PayloadAction<TicketData[]>) => {
      state.tickets = action.payload;
      state.ticketsLoading = false;
      state.ticketsError = null;
    },
    setTicketsLoading: (state, action: PayloadAction<boolean>) => {
      state.ticketsLoading = action.payload;
    },
    setTicketsError: (state, action: PayloadAction<string | null>) => {
      state.ticketsError = action.payload;
      state.ticketsLoading = false;
    },
    setActiveTicket: (state, action: PayloadAction<TicketData | null>) => {
      state.activeTicket = action.payload;
    },
    updateTicketStatus: (state, action: PayloadAction<{ id: string; status: TicketData['status'] }>) => {
      const { id, status } = action.payload;
      const ticket = state.tickets.find(t => t.id === id);
      if (ticket) {
        ticket.status = status;
      }
      if (state.activeTicket?.id === id) {
        state.activeTicket.status = status;
      }
    },

    // QR
    setActiveQR: (state, action: PayloadAction<QRGenerateResponse | null>) => {
      state.activeQR = action.payload;
      state.qrLoading = false;
    },
    setQRLoading: (state, action: PayloadAction<boolean>) => {
      state.qrLoading = action.payload;
    },
    clearQR: (state) => {
      state.activeQR = null;
    },

    // Scanner
    setLastScanResult: (state, action: PayloadAction<TicketState['lastScanResult']>) => {
      state.lastScanResult = action.payload;
    },
    clearScanResult: (state) => {
      state.lastScanResult = null;
    },
    setScanHistory: (state, action: PayloadAction<ScanHistoryEntry[]>) => {
      state.scanHistory = action.payload;
      state.scanHistoryLoading = false;
    },
    setScanHistoryLoading: (state, action: PayloadAction<boolean>) => {
      state.scanHistoryLoading = action.payload;
    },

    // Offline Queue
    addToOfflineQueue: (state, action: PayloadAction<OfflineScanEntry>) => {
      state.offlineQueue.push(action.payload);
    },
    clearOfflineQueue: (state) => {
      state.offlineQueue = [];
    },
    setOfflineSyncing: (state, action: PayloadAction<boolean>) => {
      state.offlineSyncing = action.payload;
    },
    removeFromOfflineQueue: (state, action: PayloadAction<string>) => {
      state.offlineQueue = state.offlineQueue.filter(s => s.ticketId !== action.payload);
    },

    // Notifications
    setNotifications: (state, action: PayloadAction<{ notifications: NotificationData[]; unreadCount: number }>) => {
      state.notifications = action.payload.notifications;
      state.unreadCount = action.payload.unreadCount;
      state.notificationsLoading = false;
    },
    setNotificationsLoading: (state, action: PayloadAction<boolean>) => {
      state.notificationsLoading = action.payload;
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notif = state.notifications.find(n => n.id === action.payload);
      if (notif && !notif.is_read) {
        notif.is_read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllNotificationsRead: (state) => {
      state.notifications.forEach(n => { n.is_read = true; });
      state.unreadCount = 0;
    },

    // Filter
    setActiveFilter: (state, action: PayloadAction<TicketState['activeFilter']>) => {
      state.activeFilter = action.payload;
    },

    // Reset
    resetTicketState: () => initialState,
  },
});

export const {
  setTickets,
  setTicketsLoading,
  setTicketsError,
  setActiveTicket,
  updateTicketStatus,
  setActiveQR,
  setQRLoading,
  clearQR,
  setLastScanResult,
  clearScanResult,
  setScanHistory,
  setScanHistoryLoading,
  addToOfflineQueue,
  clearOfflineQueue,
  setOfflineSyncing,
  removeFromOfflineQueue,
  setNotifications,
  setNotificationsLoading,
  markNotificationRead,
  markAllNotificationsRead,
  setActiveFilter,
  resetTicketState,
} = ticketSlice.actions;

export default ticketSlice.reducer;
