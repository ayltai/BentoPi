import { createApi, fetchBaseQuery, } from '@reduxjs/toolkit/query/react';

import { API_MAX_RETRIES, } from '../constants';
import type { News, } from '../models';

export const newsService = createApi({
    reducerPath : 'newsService',
    baseQuery   : fetchBaseQuery({
        baseUrl : 'http://192.168.68.166:8007/api/v1',
    }),
    endpoints   : build => ({
        getNews : build.query<News[], void>({
            query        : () => '/news',
            extraOptions : {
                maxRetries : API_MAX_RETRIES,
            },
        }),
    }),
});

export const { useGetNewsQuery, } = newsService;
