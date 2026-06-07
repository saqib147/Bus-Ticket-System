import { baseApi } from './baseApi';

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createReview: builder.mutation({
      query: (body) => ({
        url: '/reviews',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Review', 'Bus'],
    }),
    getBusReviews: builder.query({
      query: (busId) => `/reviews/bus/${busId}`,
      providesTags: (_result, _error, busId) => [{ type: 'Review', id: busId }],
    }),
  }),
});

export const { useCreateReviewMutation, useGetBusReviewsQuery } = reviewApi;
