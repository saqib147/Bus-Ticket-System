import { createSlice } from '@reduxjs/toolkit';

const storedUser = localStorage.getItem('busgo_admin_user');
const storedToken = localStorage.getItem('busgo_admin_token');

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  accessToken: storedToken || null,
  isAuthenticated: !!storedToken,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      localStorage.setItem('busgo_admin_user', JSON.stringify(user));
      localStorage.setItem('busgo_admin_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('busgo_admin_refresh_token', refreshToken);
      }
    },
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('busgo_admin_user', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('busgo_admin_user');
      localStorage.removeItem('busgo_admin_token');
      localStorage.removeItem('busgo_admin_refresh_token');
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, setUser, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectUserRole = (state) => state.auth.user?.role;
