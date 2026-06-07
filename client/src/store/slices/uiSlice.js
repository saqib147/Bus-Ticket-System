import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: false,
  mobileMenuOpen: false,
  theme: 'light',
  loading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setMobileMenuOpen: (state, action) => {
      state.mobileMenuOpen = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, toggleMobileMenu, setMobileMenuOpen, setLoading } =
  uiSlice.actions;

export default uiSlice.reducer;
