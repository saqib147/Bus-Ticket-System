import { createSlice } from '@reduxjs/toolkit';
import { authApi } from '../api/authApi';

const storedUser = localStorage.getItem('user');
const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  accessToken: localStorage.getItem('accessToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
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
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
    updateUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, { payload }) => {
        const user = payload.data.user;
        if (user.role === 'admin' || user.role === 'operator') {
          return;
        }
        state.user = user;
        state.accessToken = payload.data.accessToken;
        state.isAuthenticated = true;
        localStorage.setItem('accessToken', payload.data.accessToken);
        if (payload.data.refreshToken) {
          localStorage.setItem('refreshToken', payload.data.refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(user));
      })
      .addMatcher(authApi.endpoints.register.matchFulfilled, (state, { payload }) => {
        state.user = payload.data.user;
        state.accessToken = payload.data.accessToken;
        state.isAuthenticated = true;
        localStorage.setItem('accessToken', payload.data.accessToken);
        if (payload.data.refreshToken) {
          localStorage.setItem('refreshToken', payload.data.refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(payload.data.user));
      })
      .addMatcher(authApi.endpoints.getMe.matchFulfilled, (state, { payload }) => {
        state.user = payload.data.user;
        state.isAuthenticated = true;
        localStorage.setItem('user', JSON.stringify(payload.data.user));
      })
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      });
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
