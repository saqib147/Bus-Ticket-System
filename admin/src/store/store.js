import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import { adminApi } from './api/adminApi.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(adminApi.middleware),
});

export default store;
