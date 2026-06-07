import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  scheduleId: null,
  schedule: null,
  selectedSeats: [],
  selectedSeatIds: [],
  lockExpiresAt: null,
  bookingId: null,
  booking: null,
  passengerDetails: {
    name: '',
    email: '',
    phone: '',
  },
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setSchedule: (state, action) => {
      state.scheduleId = action.payload._id;
      state.schedule = action.payload;
    },
    toggleSeat: (state, action) => {
      const { seatNumber, seatId } = action.payload;
      const index = state.selectedSeats.indexOf(seatNumber);

      if (index >= 0) {
        state.selectedSeats.splice(index, 1);
        state.selectedSeatIds = state.selectedSeatIds.filter((id) => id !== seatId);
      } else {
        state.selectedSeats.push(seatNumber);
        state.selectedSeatIds.push(seatId);
      }
    },
    setSelectedSeats: (state, action) => {
      state.selectedSeats = action.payload.seats;
      state.selectedSeatIds = action.payload.seatIds;
    },
    clearSelectedSeats: (state) => {
      state.selectedSeats = [];
      state.selectedSeatIds = [];
    },
    setLockExpiry: (state, action) => {
      state.lockExpiresAt = action.payload;
    },
    setBooking: (state, action) => {
      state.bookingId = action.payload._id;
      state.booking = action.payload;
    },
    setPassengerDetails: (state, action) => {
      state.passengerDetails = { ...state.passengerDetails, ...action.payload };
    },
    resetBooking: () => initialState,
  },
});

export const {
  setSchedule,
  toggleSeat,
  setSelectedSeats,
  clearSelectedSeats,
  setLockExpiry,
  setBooking,
  setPassengerDetails,
  resetBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;
