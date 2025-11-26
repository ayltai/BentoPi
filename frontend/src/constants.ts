import { faCloud, faCloudBolt, faCloudMoon, faCloudRain, faCloudShowersHeavy, faCloudSun, faMoon, faSmog, faSnowflake, faSun, type IconDefinition, } from '@fortawesome/free-solid-svg-icons';

export const SCREEN_WIDTH   : number = 480;
export const SCREEN_HEIGHT  : number = 320;
export const TOP_BAR_HEIGHT : number = 48;

export const API_ENDPOINT : string = `http://${window.location.hostname}:8000`;

export const API_MAX_RETRIES : number = 5;

export const LOCATION_LATITUDE  : number = 51.365479;
export const LOCATION_LONGITUDE : number = 0.211968;
export const LOCATION_TIMEZONE  : string = 'Europe/London';

export const INTERVAL_TIME_UPDATE        : number = 15000;
export const INTERVAL_TEMPERATURE_UPDATE : number = 15000;
export const INTERVAL_HUMIDITY_UPDATE    : number = 300000;
export const INTERVAL_WEATHER_UPDATE     : number = 900000;
export const INTERVAL_NEWS_UPDATE        : number = 900000;
export const INTERVAL_DISRUPTIONS_UPDATE : number = 300000;
export const INTERVAL_SYSTEM_UPDATE      : number = 5000;
export const INTERVAL_HEATING_UPDATE     : number = 600000;

export const HEATING_TEMPERATURE_MIN : number = 5;
export const HEATING_TEMPERATURE_MAX : number = 30;

export const TIMEOUT_IDLE        : number = 120000;
export const TIMEOUT_SCREENSAVER : number = 1800000;

export const WEATHER_ICONS : Record<number, IconDefinition> = {
    0  : faSun,
    1  : faCloudSun,
    2  : faCloudSun,
    3  : faCloud,
    45 : faSmog,
    48 : faSmog,
    51 : faCloudRain,
    53 : faCloudRain,
    55 : faCloudRain,
    56 : faCloudRain,
    57 : faCloudRain,
    61 : faCloudShowersHeavy,
    63 : faCloudShowersHeavy,
    65 : faCloudShowersHeavy,
    66 : faCloudShowersHeavy,
    67 : faCloudShowersHeavy,
    71 : faSnowflake,
    73 : faSnowflake,
    75 : faSnowflake,
    77 : faSnowflake,
    80 : faCloudShowersHeavy,
    81 : faCloudShowersHeavy,
    82 : faCloudShowersHeavy,
    85 : faSnowflake,
    86 : faSnowflake,
    95 : faCloudBolt,
    96 : faCloudBolt,
    99 : faCloudBolt,
};

export const NIGHT_WEATHER_ICONS : Record<number, IconDefinition> = {
    0  : faMoon,
    1  : faCloudMoon,
    2  : faCloudMoon,
    3  : faCloud,
    45 : faSmog,
    48 : faSmog,
    51 : faCloudRain,
    53 : faCloudRain,
    55 : faCloudRain,
    56 : faCloudRain,
    57 : faCloudRain,
    61 : faCloudShowersHeavy,
    63 : faCloudShowersHeavy,
    65 : faCloudShowersHeavy,
    66 : faCloudShowersHeavy,
    67 : faCloudShowersHeavy,
    71 : faSnowflake,
    73 : faSnowflake,
    75 : faSnowflake,
    77 : faSnowflake,
    80 : faCloudShowersHeavy,
    81 : faCloudShowersHeavy,
    82 : faCloudShowersHeavy,
    85 : faSnowflake,
    86 : faSnowflake,
    95 : faCloudBolt,
    96 : faCloudBolt,
    99 : faCloudBolt,
};
