import type { Entity, } from './Entity';

export type Thermostat = Entity & {
    attributes : {
        minTemp            : number,
        maxTemp            : number,
        currentTemperature : number,
        temperature        : number,
    },
};
