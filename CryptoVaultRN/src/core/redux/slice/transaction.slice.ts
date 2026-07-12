import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TransactionApi } from '../../../api/transaction.api';

export interface MobileTransaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'P2P_ESCROW';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  amount: string;
  token_id: string;
  created_at: string;
}

interface TransactionState {
  history: MobileTransaction[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: TransactionState = {
  history: [],
  status: 'idle',
};

// Polling Transaction (Pull to refresh)
export const fetchTransactionHistory = createAsyncThunk('transaction/fetchHistory', async () => {
  const data = await TransactionApi.getTransactions();
  return data.data; // Mảng transaction
});

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    // Gọi TỰ ĐỘNG khi WebSocket bắn thông báo "Giao dịch vừa chuyển sang COMPLETED"
    updateTxStatusRealtime: (state, action: PayloadAction<{ id: string; status: any }>) => {
      const idx = state.history.findIndex(tx => tx.id === action.payload.id);
      if (idx !== -1) {
        state.history[idx].status = action.payload.status;
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTransactionHistory.pending, (state) => {
      state.status = 'loading';
    }).addCase(fetchTransactionHistory.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.history = action.payload || [];
    });
  }
});

export const { updateTxStatusRealtime } = transactionSlice.actions;
export default transactionSlice.reducer;
