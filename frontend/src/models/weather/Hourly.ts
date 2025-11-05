import type { Currently, } from './Currently';

export type Hourly = Currently & {
    precipitationProbability : number,
    uvIndex?                 : number,
};
