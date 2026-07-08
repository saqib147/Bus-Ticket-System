import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const baseQuery = fetchBaseQuery({
  baseUrl,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const refreshToken = localStorage.getItem('busgo_admin_refresh_token');
    const refreshResult = await baseQuery(
      {
        url: '/auth/refresh-token',
        method: 'POST',
        body: { refreshToken },
      },
      api,
      extraOptions
    );

    if (refreshResult.data?.data?.accessToken) {
      const { setCredentials } = await import('../slices/authSlice.js');
      api.dispatch(
        setCredentials({
          user: api.getState().auth.user,
          accessToken: refreshResult.data.data.accessToken,
          refreshToken: refreshResult.data.data.refreshToken,
        })
      );
      result = await baseQuery(args, api, extraOptions);
    } else {
      const { logout } = await import('../slices/authSlice.js');
      api.dispatch(logout());
    }
  }

  return result;
};
