import { configureStore, } from '@reduxjs/toolkit';

import { thermostatService, } from './thermostatService';

describe('thermostatService', () => {
    it('retains the boiler state and climate sensors from the Home Assistant response', async () => {
        const response = [
            {
                entity_id  : 'sensor.living_area_climate_living_area_temperature',
                state      : '19',
                attributes : {
                    device_class : 'temperature',
                },
            }, {
                entity_id  : 'sensor.living_area_climate_living_area_humidity',
                state      : '40',
                attributes : {
                    device_class : 'humidity',
                },
            }, {
                entity_id  : 'input_boolean.desired_boiler_switch_state',
                state      : 'on',
                attributes : {},
            }, {
                entity_id  : 'binary_sensor.door',
                state      : 'on',
                attributes : {
                    device_class : 'door',
                },
            },
        ];
        vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(response), {
            headers : {
                'Content-Type' : 'application/json',
            },
        })));
        const store = configureStore({
            reducer    : {
                [thermostatService.reducerPath] : thermostatService.reducer,
            },
            middleware : getDefaultMiddleware => getDefaultMiddleware().concat(thermostatService.middleware),
        });
        const request = store.dispatch(thermostatService.endpoints.getTelemetry.initiate());

        try {
            expect(await request.unwrap()).toEqual([
                {
                    entityId   : response[0].entity_id,
                    state      : '19',
                    attributes : {
                        deviceClass : 'temperature',
                    },
                }, {
                    entityId   : response[1].entity_id,
                    state      : '40',
                    attributes : {
                        deviceClass : 'humidity',
                    },
                }, {
                    entityId   : 'input_boolean.desired_boiler_switch_state',
                    state      : 'on',
                    attributes : {},
                },
            ]);
        } finally {
            request.unsubscribe();
            store.dispatch(thermostatService.util.resetApiState());
            vi.unstubAllGlobals();
        }
    });
});
