import { baseApi } from './baseApi';

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCheckoutSession: builder.mutation({
      query: (body) => ({
        url: '/payments/create-session',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Payment'],
    }),
    getPaymentByBooking: builder.query({
      query: (bookingId) => `/payments/${bookingId}`,
      providesTags: (_result, _error, bookingId) => [{ type: 'Payment', id: bookingId }],
    }),
  }),
});

export const { useCreateCheckoutSessionMutation, useGetPaymentByBookingQuery } = paymentApi;
