import { createApi, fetchBaseQuery, } from '@reduxjs/toolkit/query/react';

import { API_MAX_RETRIES, } from '../constants';
import type { Disruption, } from '../models';

const MODES : string = 'tube,dlr,overground,elizabeth-line,tube,national-rail';

export const transformResponse = (response : Record<string, string>[]) => response.filter(item => item.type !== 'specialService' && (item.description || item.closureText)).map(item => ({
    category    : item.category,
    type        : item.type,
    description : item.description,
    closureText : item.closureText,
}));

export const tflService = createApi({
    reducerPath : 'tflService',
    baseQuery   : fetchBaseQuery({
        baseUrl : 'http://192.168.68.166:8008/api/v1',
    }),
    endpoints   : build => ({
        getDisruptions : build.query<Disruption[], void>({
            query        : () => `/tfl/disruptions/${MODES}`,
            transformResponse,
            extraOptions : {
                maxRetries : API_MAX_RETRIES,
            },
        }),
    }),
});

export const { useGetDisruptionsQuery, } = tflService;
