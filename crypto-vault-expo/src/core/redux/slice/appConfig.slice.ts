import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TokenConfig {
  id: string;
  symbol: string;
  enabled: boolean;
  priority: number;
}

interface ProfileConfig {
  id: string;
  user_id: string;
  nickname: string;
  avatar_url: string;
  is_verified: boolean;
}

interface AppConfigState {
  features: {
    p2pEnabled: boolean;
    swapEnabled: boolean;
    bridgeEnabled: boolean;
    maintenanceMode: boolean;
  };
  tokens: TokenConfig[];
  rpcUrls: Record<string, string>;
  contacts: ProfileConfig[];
  minVersion: string;
  loading: boolean;
  error: string | null;
}

const initialState: AppConfigState = {
  features: {
    p2pEnabled: true,
    swapEnabled: true,
    bridgeEnabled: true,
    maintenanceMode: false,
  },
  tokens: [],
  rpcUrls: {
    ethereum: "https://mainnet.infura.io/v3/your-api-key",
    bsc: "https://bsc-dataseed.binance.org/",
  },
  contacts: [],
  minVersion: "1.0.0",
  loading: false,
  error: null,
};

const appConfigSlice = createSlice({
  name: "appConfig",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setAppConfig: (state, action: PayloadAction<Partial<AppConfigState>>) => {
      return { ...state, ...action.payload, loading: false };
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setLoading, setAppConfig, setError } = appConfigSlice.actions;
export default appConfigSlice.reducer;
