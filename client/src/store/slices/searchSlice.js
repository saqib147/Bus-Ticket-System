import { createSlice } from '@reduxjs/toolkit';

const defaultFilters = {
  sortBy: 'departure',
  priceRange: [0, 10000],
  amenities: [],
};

// Only restore the search fields (from/to/date/type), never the filter/sort
// state — stale price ranges from a previous session cause results to be
// silently filtered out on the client side.
const savedSearch = (() => {
  try {
    const raw = localStorage.getItem('lastSearch');
    if (!raw) return null;
    const { from, to, date, type } = JSON.parse(raw);
    return { from, to, date, type };
  } catch {
    return null;
  }
})();

const initialState = {
  from: savedSearch?.from ?? '',
  to: savedSearch?.to ?? '',
  date: savedSearch?.date ?? new Date().toISOString().split('T')[0],
  type: savedSearch?.type ?? '',
  ...defaultFilters,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchParams: (state, action) => {
      // Only persist the search fields, reset filters to defaults on each new search
      const { from, to, date, type } = action.payload;
      state.from = from ?? state.from;
      state.to = to ?? state.to;
      state.date = date ?? state.date;
      state.type = type ?? state.type;
      // Reset client-side filters so stale values never hide fresh results
      state.sortBy = defaultFilters.sortBy;
      state.priceRange = defaultFilters.priceRange;
      state.amenities = defaultFilters.amenities;
      localStorage.setItem('lastSearch', JSON.stringify({ from: state.from, to: state.to, date: state.date, type: state.type }));
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setPriceRange: (state, action) => {
      state.priceRange = action.payload;
    },
    setTypeFilter: (state, action) => {
      state.type = action.payload;
    },
    setAmenities: (state, action) => {
      state.amenities = action.payload;
    },
    resetSearch: () => initialState,
  },
});

export const { setSearchParams, setSortBy, setPriceRange, setTypeFilter, setAmenities, resetSearch } =
  searchSlice.actions;

export default searchSlice.reducer;
