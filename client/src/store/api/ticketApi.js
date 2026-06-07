import { baseApi } from './baseApi';

export const ticketApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTicketByBooking: builder.query({
      query: (bookingId) => `/tickets/${bookingId}`,
      providesTags: (_result, _error, bookingId) => [{ type: 'Ticket', id: bookingId }],
    }),
    downloadTicketPdf: builder.query({
      query: (bookingId) => ({
        url: `/tickets/${bookingId}/pdf`,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const { useGetTicketByBookingQuery, useLazyDownloadTicketPdfQuery } = ticketApi;
