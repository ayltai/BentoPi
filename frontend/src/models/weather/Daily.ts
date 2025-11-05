import { PartialWeather, } from './PartialWeather';

export type Daily = PartialWeather & {
    temperatureMin?           : number,
    temperatureMax?           : number,
    apparentTemperatureMin?   : number,
    apparentTemperatureMax?   : number,
    humidityMin?              : number,
    humidityMax?              : number,
    precipitationProbability? : number,
    precipitationHours?       : number,
    uvIndex?                  : number,
};
