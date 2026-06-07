import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from './api/baseApi';
import authReducer from './slices/authSlice';
import bookingReducer from './slices/bookingSlice';
import searchReducer from './slices/searchSlice';
import uiReducer from './slices/uiSlice';

import './api/authApi';
import './api/busApi';
import './api/bookingApi';
import './api/paymentApi';
import './api/ticketApi';
import './api/reviewApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    booking: bookingReducer,
    search: searchReducer,
    ui: uiReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

setupListeners(store.dispatch);

export default store;
