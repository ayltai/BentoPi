import { createApi, fetchBaseQuery, } from '@reduxjs/toolkit/query/react';

import { API_ENDPOINT, API_MAX_RETRIES, } from '../constants';

export const sensorService = createApi({
    reducerPath : 'sensorService',
    baseQuery   : fetchBaseQuery({
        baseUrl : `${API_ENDPOINT}/api/v1`,
    }),
    endpoints   : build => ({
        getTemperature : build.query<number, void>({
            query        : () => '/sensors/temperature',
            extraOptions : {
                maxRetries : API_MAX_RETRIES,
            },
        }),
        getHumidity    : build.query<number, void>({
            query        : () => '/sensors/humidity',
            extraOptions : {
                maxRetries : API_MAX_RETRIES,
            },
        }),
    }),
});

export const { useGetTemperatureQuery, useGetHumidityQuery, } = sensorService;
