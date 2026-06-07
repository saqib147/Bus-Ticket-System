import { baseApi } from './baseApi';

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createBooking: builder.mutation({
      query: (body) => ({
        url: '/bookings',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Booking', 'Seat'],
    }),
    getBookings: builder.query({
      query: () => '/bookings',
      providesTags: ['Booking'],
    }),
    getBookingById: builder.query({
      query: (id) => `/bookings/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Booking', id }],
    }),
    cancelBooking: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/bookings/${id}/cancel`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Booking', 'Seat'],
    }),
    getUserBookings: builder.query({
      query: () => '/users/bookings',
      providesTags: ['Booking'],
    }),
  }),
});

export const {
  useCreateBookingMutation,
  useGetBookingsQuery,
  useGetBookingByIdQuery,
  useCancelBookingMutation,
  useGetUserBookingsQuery,
} = bookingApi;
