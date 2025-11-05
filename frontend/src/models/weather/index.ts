import type { Currently, } from './Currently';
import type { Daily, } from './Daily';
import type { Hourly, } from './Hourly';
import type { Minutely, } from './Minutely';

type Weather = {
    currently : Currently,
    minutely  : Minutely[],
    hourly    : Hourly[],
    daily     : Daily[],
};

export default Weather;
