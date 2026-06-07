import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseApi.js';

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Stats',
    'Users',
    'Operators',
    'Bookings',
    'Reports',
    'Buses',
    'Routes',
    'Schedules',
    'Profile',
  ],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['Profile'],
    }),
    getProfile: builder.query({
      query: () => '/users/profile',
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation({
      query: (body) => ({
        url: '/users/profile',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),
    changePassword: builder.mutation({
      query: (body) => ({
        url: '/users/change-password',
        method: 'PATCH',
        body,
      }),
    }),

    getAdminStats: builder.query({
      query: () => '/admin/stats',
      providesTags: ['Stats'],
    }),
    getUsers: builder.query({
      query: (params) => ({
        url: '/admin/users',
        params,
      }),
      providesTags: ['Users'],
    }),
    toggleUserStatus: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}/toggle-status`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Users', 'Stats'],
    }),
    getPendingOperators: builder.query({
      query: () => '/admin/operators/pending',
      providesTags: ['Operators'],
    }),
    approveOperator: builder.mutation({
      query: (id) => ({
        url: `/admin/operators/${id}/approve`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Operators', 'Users', 'Stats'],
    }),
    rejectOperator: builder.mutation({
      query: (id) => ({
        url: `/admin/operators/${id}/reject`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Operators', 'Users', 'Stats'],
    }),
    getAdminBookings: builder.query({
      query: (params) => ({
        url: '/admin/bookings',
        params,
      }),
      providesTags: ['Bookings'],
    }),
    updateAdminBooking: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/bookings/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Bookings', 'Stats'],
    }),
    getAdminRevenueReport: builder.query({
      query: (params) => ({
        url: '/admin/reports/revenue',
        params,
      }),
      providesTags: ['Reports'],
    }),
    getAdminBookingsReport: builder.query({
      query: () => '/admin/reports/bookings',
      providesTags: ['Reports'],
    }),

    getOperatorStats: builder.query({
      query: () => '/operator/stats',
      providesTags: ['Stats'],
    }),
    getOperatorBookings: builder.query({
      query: (params) => ({
        url: '/operator/bookings',
        params,
      }),
      providesTags: ['Bookings'],
    }),
    getOperatorRevenueReport: builder.query({
      query: () => '/operator/reports/revenue',
      providesTags: ['Reports'],
    }),
    getSchedulePassengers: builder.query({
      query: (id) => `/operator/schedules/${id}/passengers`,
    }),

    getMyBuses: builder.query({
      query: () => '/buses/operator/my-buses',
      providesTags: ['Buses'],
    }),
    createBus: builder.mutation({
      query: (formData) => ({
        url: '/buses',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Buses', 'Stats'],
    }),
    updateBus: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/buses/${id}`,
        method: 'PATCH',
        body: formData,
      }),
      invalidatesTags: ['Buses', 'Stats'],
    }),
    deleteBus: builder.mutation({
      query: (id) => ({
        url: `/buses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Buses', 'Stats'],
    }),

    getRoutes: builder.query({
      query: (params = {}) => ({
        url: '/routes',
        params: { manage: 'true', ...params },
      }),
      providesTags: ['Routes'],
    }),
    createRoute: builder.mutation({
      query: (body) => ({
        url: '/routes',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Routes', 'Stats'],
    }),
    updateRoute: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/routes/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Routes', 'Stats'],
    }),
    deleteRoute: builder.mutation({
      query: (id) => ({
        url: `/routes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Routes', 'Stats'],
    }),

    getSchedules: builder.query({
      query: (params) => ({
        url: '/schedules',
        params,
      }),
      providesTags: ['Schedules'],
    }),
    createSchedule: builder.mutation({
      query: (body) => ({
        url: '/schedules',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Schedules', 'Stats'],
    }),
    updateSchedule: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/schedules/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Schedules', 'Stats'],
    }),
    deleteSchedule: builder.mutation({
      query: (id) => ({
        url: `/schedules/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Schedules', 'Stats'],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetAdminStatsQuery,
  useGetUsersQuery,
  useToggleUserStatusMutation,
  useGetPendingOperatorsQuery,
  useApproveOperatorMutation,
  useRejectOperatorMutation,
  useGetAdminBookingsQuery,
  useUpdateAdminBookingMutation,
  useGetAdminRevenueReportQuery,
  useGetAdminBookingsReportQuery,
  useGetOperatorStatsQuery,
  useGetOperatorBookingsQuery,
  useGetOperatorRevenueReportQuery,
  useGetSchedulePassengersQuery,
  useGetMyBusesQuery,
  useCreateBusMutation,
  useUpdateBusMutation,
  useDeleteBusMutation,
  useGetRoutesQuery,
  useCreateRouteMutation,
  useUpdateRouteMutation,
  useDeleteRouteMutation,
  useGetSchedulesQuery,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
} = adminApi;
