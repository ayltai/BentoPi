import { createApi, fetchBaseQuery, } from '@reduxjs/toolkit/query/react';

import { API_MAX_RETRIES, } from '../constants';
import type { Location, Weather, } from '../models';

export const weatherService = createApi({
    reducerPath : 'weatherService',
    baseQuery   : fetchBaseQuery({
        baseUrl : 'http://192.168.68.166:8009/api/v1',
    }),
    endpoints   : build => ({
        getWeather : build.query<Weather, Location>({
            query        : location => `/weather?latitude=${location.latitude}&longitude=${location.longitude}&timezone=${location.timezone}`,
            extraOptions : {
                maxRetries : API_MAX_RETRIES,
            },
        }),
    }),
});

export const { useGetWeatherQuery, } = weatherService;
