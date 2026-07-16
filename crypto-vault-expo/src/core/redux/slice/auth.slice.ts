import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type AuthUser = any;
type AuthSession = any;

interface AuthState {
  user: AuthUser;
  session: AuthSession;
  isLoading: boolean;
  isLoggedIn: boolean;
}

const initialState: AuthState = {
  user: null,
  session: null,
  isLoading: false,
  isLoggedIn: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<AuthSession>) => {
      state.session = action.payload;
      state.user = action.payload?.user ?? null;
      state.isLoggedIn = !!action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.session = null;
      state.isLoggedIn = false;
    },
  },
});

export const { setSession, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;
