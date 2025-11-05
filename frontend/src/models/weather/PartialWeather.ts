import type { Minutely, } from './Minutely';

export type PartialWeather = Minutely & {
    weatherCode? : number,
    showers?     : number,
    windSpeed?   : number,
};
