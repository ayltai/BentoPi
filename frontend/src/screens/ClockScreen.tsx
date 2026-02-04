import { FontAwesomeIcon, } from '@fortawesome/react-fontawesome';
import { Flex, Layout, Typography, } from 'antd';
import { useEffect, useState, } from 'react';

import { useGetWeatherQuery, } from '../apis';
import { INTERVAL_TIME_UPDATE, INTERVAL_WEATHER_UPDATE, LOCALE, LOCATION_LATITUDE, LOCATION_LONGITUDE, LOCATION_TIMEZONE, NIGHT_WEATHER_ICONS, TIMEOUT_SCREENSAVER, WEATHER_ICONS, } from '../constants';
import { handleError, } from '../utils';


export const ClockScreen = () => {
    const [ time,    setTime,    ] = useState<Date>(new Date());
    const [ opacity, setOpacity, ] = useState<number>(0);

    const { data : weatherData, error : weatherError, } = useGetWeatherQuery({
        latitude  : LOCATION_LATITUDE,
        longitude : LOCATION_LONGITUDE,
        timezone  : LOCATION_TIMEZONE,
    }, {
        pollingInterval : INTERVAL_WEATHER_UPDATE,
    });

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), INTERVAL_TIME_UPDATE);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fadeCycle = () => {
            setOpacity(1);

            setTimeout(() => {
                setOpacity(0);
            }, 1000);
        };

        const timeout = setTimeout(fadeCycle, TIMEOUT_SCREENSAVER);

        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (weatherError) handleError(weatherError);
    }, [ weatherError, ]);

    return (
        <Layout style={{
            backgroundColor : 'black',
        }}>
            <Layout.Content>
                <Flex
                    style={{
                        marginTop       : 40,
                        marginBottom    : 48,
                        backgroundColor : 'black',
                    }}
                    vertical
                    align='center'
                    justify='center'>
                    <Flex
                        style={{
                            margin : 16,
                        }}
                        align='center'
                        justify='center'
                        gap={16}>
                        {weatherData?.currently.weatherCode && (
                            <FontAwesomeIcon
                                size='2x'
                                icon={weatherData.currently.isDay ? WEATHER_ICONS[weatherData.currently.weatherCode] : NIGHT_WEATHER_ICONS[weatherData.currently.weatherCode]} />
                        )}
                        {weatherData && (
                            <Typography.Title
                                style={{
                                    margin : 0,
                                }}
                                level={2}>
                                {`${weatherData.currently.temperature.toFixed(0)}°`}
                            </Typography.Title>
                        )}
                    </Flex>
                    <Typography.Title
                        style={{
                            margin : 8,
                        }}
                        level={1}>
                        {time.toLocaleString(LOCALE, {
                            weekday : 'short',
                            day     : 'numeric',
                            month   : 'short',
                            year    : 'numeric',
                        })}
                    </Typography.Title>
                    <Typography.Title style={{
                        margin   : 8,
                        fontSize : '5em',
                    }}>
                        {time.toLocaleString(LOCALE, {
                            hour    : 'numeric',
                            minute  : '2-digit',
                            hour12  : true,
                        })}
                    </Typography.Title>
                </Flex>
                <div style={{
                    width           : '100vw',
                    height          : '100vh',
                    top             : 0,
                    left            : 0,
                    position        : 'fixed',
                    backgroundColor : 'black',
                    transition      : 'opacity 1s ease-in-out',
                    zIndex          : 9999,
                    opacity,
                }} />
            </Layout.Content>
        </Layout>
    );
};
