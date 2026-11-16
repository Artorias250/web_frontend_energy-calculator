import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserResponse } from '../api/generated/Api';
export interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStarted(state) {
      state.loading = true;
      state.error = null;
    },
    loggedIn(state, action: PayloadAction<UserResponse>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    loggedOut() {
      return initialState;
    },
    authFailed(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
});
export const { authStarted, loggedIn, loggedOut, authFailed, clearAuthError } =
  authSlice.actions;
export default authSlice.reducer;
