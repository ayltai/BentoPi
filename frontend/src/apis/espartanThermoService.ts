import { createApi, fetchBaseQuery, } from '@reduxjs/toolkit/query/react';

import { API_MAX_RETRIES, } from '../constants';
import type { Configuration, Device, Telemetry, } from '../models';
import { camelCaseToSnakeCase, snakeCaseToCamelCase, } from '../utils/strings';

export const espartanThermoService = createApi({
    reducerPath : 'espartanThermoService',
    baseQuery   : fetchBaseQuery({
        baseUrl : 'http://192.168.68.166:8011/api/v1',
    }),
    endpoints   : build => ({
        getConfigurations : build.query<Configuration, void>({
            query             : () => '/settings/1',
            transformResponse : (response : any) => snakeCaseToCamelCase(response) as Configuration,
            extraOptions      : {
                maxRetries : API_MAX_RETRIES,
            },
            providesTags      : [
                // @ts-ignore
                'config',
            ],
        }),
        setConfigurations : build.mutation<void, Configuration>({
            query           : configurations => ({
                url    : '/settings/1',
                method : 'PUT',
                body   : camelCaseToSnakeCase({
                    ...configurations,
                }),
            }),
            invalidatesTags : [
                // @ts-ignore
                'config',
            ],
        }),
        getCurrentState   : build.query<number, string>({
            query        : deviceId => `/relays/current/${deviceId}`,
            extraOptions : {
                maxRetries : API_MAX_RETRIES,
            },
        }),
        getDevices        : build.query<Device[], void>({
            query             : () => '/devices',
            transformResponse : (response : any) => response.map((item : any) => snakeCaseToCamelCase(item)),
            extraOptions      : {
                maxRetries : API_MAX_RETRIES,
            },
        }),
        getTelemetry      : build.query<Telemetry[], number>({
            query             : offset => `/telemetry/recent?offset=${offset}`,
            transformResponse : (response : any) => response.map((item : any) => snakeCaseToCamelCase(item)),
            extraOptions      : {
                maxRetries : API_MAX_RETRIES,
            },
        }),
    }),
});

export const { useGetConfigurationsQuery, useGetCurrentStateQuery, useGetDevicesQuery, useGetTelemetryQuery, useSetConfigurationsMutation, } = espartanThermoService;
