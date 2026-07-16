import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../../api/client';

export interface WalletBalance {
  token_id: string;
  symbol?: string;
  available_balance: number;
  locked_balance: number;
}

interface LedgerState {
  balances: WalletBalance[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: LedgerState = {
  balances: [],
  status: 'idle',
  error: null,
};

// Polling định kỳ tự động từ HTTP (Nếu WebSocket lỗi)
export const fetchBalances = createAsyncThunk('ledger/fetchBalances', async () => {
  // Thay đổi UUID logic / lấy token ở Backend 
  const response = await apiClient.get('/api/v1/balances');
  return response.data; // { success: true, data: [{ token_id, available_balance, locked_balance }] }
});

const ledgerSlice = createSlice({
  name: 'ledger',
  initialState,
  reducers: {
    // Chỉ cập nhật nhanh dựa trên Push Event từ WebSockets Server
    updateBalanceRealtime: (state, action: PayloadAction<WalletBalance>) => {
      const { token_id, available_balance, locked_balance } = action.payload;
      const index = state.balances.findIndex(b => b.token_id === token_id);
      if (index !== -1) {
        state.balances[index].available_balance = available_balance;
        state.balances[index].locked_balance = locked_balance;
      } else {
        state.balances.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBalances.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBalances.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.balances = action.payload.data;
      })
      .addCase(fetchBalances.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Lỗi lấy số dư Kế Toán';
      });
  },
});

export const { updateBalanceRealtime } = ledgerSlice.actions;
export default ledgerSlice.reducer;
