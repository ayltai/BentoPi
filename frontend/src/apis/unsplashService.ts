import { createApi, fetchBaseQuery, } from '@reduxjs/toolkit/query/react';

import { API_MAX_RETRIES, } from '../constants';

export const unsplashService = createApi({
    reducerPath : 'unsplashService',
    baseQuery   : fetchBaseQuery({
        baseUrl : 'http://192.168.68.166:8006/api',
    }),
    endpoints   : build => ({
        getRandomPhoto : build.query<string, string>({
            query             : query => `/photos/random?orientation=landscape&query=${query}`,
            transformResponse : (response : Record<string, string | string[] | Record<string, any>>) => (response.urls as Record<string, string>).regular,
            extraOptions      : {
                maxRetries : API_MAX_RETRIES,
            },
        }),
    }),
});

export const { useGetRandomPhotoQuery, } = unsplashService;
