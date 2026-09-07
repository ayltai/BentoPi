import { createApi, fetchBaseQuery, } from '@reduxjs/toolkit/query/react';

import { API_MAX_RETRIES, } from '../constants';
import type { Entity, Thermostat, } from '../models';
import { camelCaseToSnakeCase, snakeCaseToCamelCase, } from '../utils/strings';

export const thermostatService = createApi({
    reducerPath : 'espartanThermoService',
    baseQuery   : fetchBaseQuery({
        baseUrl : 'http://192.168.68.166:8123/api',
        headers : {
            'Authorization' : `Bearer ${import.meta.env.VITE_APP_HOME_ASSISTANT_API_TOKEN}`,
            'Content-Type'  : 'application/json',
        },
    }),
    endpoints   : build => ({
        getThermostat        : build.query<Thermostat, void>({
            query             : () => '/states/climate.entrance_climate_actuator_entrance_thermostat',
            transformResponse : (response : any) => snakeCaseToCamelCase(response) as Thermostat,
            extraOptions      : {
                maxRetries : API_MAX_RETRIES,
            },
            providesTags      : [
                // @ts-ignore
                'config',
            ],
        }),
        setTargetTemperature : build.mutation<void, number>({
            query           : temperature => ({
                url    : '/services/climate/set_temperature',
                method : 'POST',
                body   : camelCaseToSnakeCase({
                    entityId : 'climate.entrance_climate_actuator_entrance_thermostat',
                    temperature,
                }),
            }),
            invalidatesTags : [
                // @ts-ignore
                'config',
            ],
        }),
        getTelemetry         : build.query<Entity[], void>({
            query             : () => '/states',
            transformResponse : (response : any) => response.map((item : any) => snakeCaseToCamelCase(item)).filter((item : Entity) => item.attributes.deviceClass === 'temperature' || item.attributes.deviceClass === 'humidity'),
        }),
    }),
});

export const { useGetTelemetryQuery, useGetThermostatQuery, useSetTargetTemperatureMutation, } = thermostatService;
