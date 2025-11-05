import { createApi, fetchBaseQuery, } from '@reduxjs/toolkit/query/react';

import { API_ENDPOINT, API_MAX_RETRIES, } from '../constants';

export const systemService = createApi({
    reducerPath : 'systemService',
    baseQuery   : fetchBaseQuery({
        baseUrl : `${API_ENDPOINT}/api/v1`,
    }),
    endpoints   : build => ({
        getCpuTemperature : build.query<number, void>({
            query        : () => '/system/cpu/temperature',
            extraOptions : {
                maxRetries : API_MAX_RETRIES,
            },
        }),
        getCpuVoltage     : build.query<number, void>({
            query        : () => '/system/cpu/voltage',
            extraOptions : {
                maxRetries : API_MAX_RETRIES,
            },
        }),
        getCpuFrequency   : build.query<number, void>({
            query        : () => '/system/cpu/frequency',
            extraOptions : {
                maxRetries : API_MAX_RETRIES,
            },
        }),
        getMemoryTotal    : build.query<number, void>({
            query        : () => '/system/mem/total',
            extraOptions : {
                maxRetries : API_MAX_RETRIES,
            },
        }),
        getMemoryUsage    : build.query<number, void>({
            query        : () => '/system/mem/usage',
            extraOptions : {
                maxRetries : API_MAX_RETRIES,
            },
        }),
        getDiskTotal      : build.query<number, void>({
            query        : () => '/system/disk/total',
            extraOptions : {
                maxRetries : API_MAX_RETRIES,
            },
        }),
        getDiskUsage      : build.query<number, void>({
            query        : () => '/system/disk/usage',
            extraOptions : {
                maxRetries : API_MAX_RETRIES,
            },
        }),
    }),
});

export const { useGetCpuTemperatureQuery, useGetCpuVoltageQuery, useGetCpuFrequencyQuery, useGetDiskTotalQuery, useGetDiskUsageQuery, useGetMemoryTotalQuery, useGetMemoryUsageQuery, } = systemService;
