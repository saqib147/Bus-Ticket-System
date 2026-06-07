import { baseApi } from './baseApi';

export const busApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchBuses: builder.query({
      query: ({ from, to, date, type }) => ({
        url: '/buses/search',
        params: { from, to, date, ...(type && { type }) },
      }),
      providesTags: ['Bus'],
    }),
    getBusById: builder.query({
      query: (id) => `/buses/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Bus', id }],
    }),
    getRoutes: builder.query({
      query: (params) => ({
        url: '/routes',
        params,
      }),
      providesTags: ['Route'],
    }),
    getScheduleById: builder.query({
      query: (id) => `/schedules/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Schedule', id }],
    }),
    getSchedules: builder.query({
      query: (params) => ({
        url: '/schedules',
        params,
      }),
      providesTags: ['Schedule'],
    }),
    getSeatMap: builder.query({
      query: (scheduleId) => `/seats/${scheduleId}`,
      providesTags: (_result, _error, scheduleId) => [{ type: 'Seat', id: scheduleId }],
    }),
    lockSeats: builder.mutation({
      query: (body) => ({
        url: '/seats/lock',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { scheduleId }) => [{ type: 'Seat', id: scheduleId }],
    }),
    releaseSeats: builder.mutation({
      query: (body) => ({
        url: '/seats/release',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { scheduleId }) => [{ type: 'Seat', id: scheduleId }],
    }),
  }),
});

export const {
  useSearchBusesQuery,
  useLazySearchBusesQuery,
  useGetBusByIdQuery,
  useGetRoutesQuery,
  useGetScheduleByIdQuery,
  useGetSchedulesQuery,
  useGetSeatMapQuery,
  useLockSeatsMutation,
  useReleaseSeatsMutation,
} = busApi;
