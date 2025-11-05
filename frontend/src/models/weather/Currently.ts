import type { PartialWeather, } from './PartialWeather';

export type Currently = PartialWeather & {
    temperature         : number,
    apparentTemperature : number,
    humidity            : number,
    cloudCover          : number,
    isDay               : boolean,
};
