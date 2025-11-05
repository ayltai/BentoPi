import { FontAwesomeIcon, } from '@fortawesome/react-fontawesome';
import { faDroplet, faWind, } from '@fortawesome/free-solid-svg-icons';
import { Card, Col, Empty, Row, Skeleton, theme, Typography, } from 'antd';
import { useEffect, } from 'react';
import { useTranslation, } from 'react-i18next';

import { useGetRandomPhotoQuery, useGetWeatherQuery, } from '../apis';
import { INTERVAL_WEATHER_UPDATE, LOCATION_LATITUDE, LOCATION_LONGITUDE, LOCATION_TIMEZONE, NIGHT_WEATHER_ICONS, WEATHER_ICONS, } from '../constants';
import { handleError, } from '../utils';

const TRANSPARENCY : number = 0.65;

export const WeatherScreen = () => {
    const { data : weatherData, error : weatherError, } = useGetWeatherQuery({
        latitude  : LOCATION_LATITUDE,
        longitude : LOCATION_LONGITUDE,
        timezone  : LOCATION_TIMEZONE,
    }, {
        pollingInterval : INTERVAL_WEATHER_UPDATE,
    });

    const { t, } = useTranslation();

    const { data : photoData, error : photoError, isLoading, isUninitialized, } = useGetRandomPhotoQuery(weatherData?.currently?.weatherCode === 1 ? 'Clear sky' : t(`weather_code_${weatherData?.currently?.weatherCode}`), {
        skip : !weatherData?.currently?.weatherCode,
    });

    const token = theme.useToken();

    useEffect(() => {
        if (weatherError) handleError(weatherError);
    }, [ weatherError, ]);

    useEffect(() => {
        if (photoError) handleError(photoError);
    }, [ photoError, ]);

    return (
        <div style={{
            height             : '100%',
            minHeight          : 'calc(100vh - 48px)',
            backgroundImage    : photoData ? `url(${photoData})` : undefined,
            backgroundPosition : 'center',
            backgroundRepeat   : 'no-repeat',
            backgroundSize     : 'cover',
            overflow           : 'auto',
        }}>
            <Row
                style={{
                    padding : 8,
                }}
                gutter={[
                    8,
                    8,
                ]}>
                <Col span={12}>
                    <Card style={{
                        border          : 'none',
                        backgroundColor : `rgba(0, 0, 0, ${TRANSPARENCY})`,
                    }}>
                        {!weatherData && (isLoading || isUninitialized) && (
                            <Skeleton active paragraph={{
                                rows : 4,
                            }} />
                        )}
                        {weatherData && weatherData.currently && weatherData.daily && !isLoading && !isUninitialized && (
                            <>
                                <Row>
                                    <Col span={24}>
                                        <Typography.Text style={{
                                            textShadow : '1px 2px 4px black',
                                        }}>
                                            {t(`weather_code_${weatherData.currently.weatherCode}`)}
                                        </Typography.Text>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col
                                        style={{
                                            alignContent : 'center',
                                        }}
                                        span={8}>
                                        {weatherData.currently.weatherCode && (
                                            <FontAwesomeIcon
                                                style={{
                                                    filter : 'drop-shadow(1px 2px 4px black)',
                                                }}
                                                size='3x'
                                                icon={weatherData.currently.isDay ? WEATHER_ICONS[weatherData.currently.weatherCode] : NIGHT_WEATHER_ICONS[weatherData.currently.weatherCode]} />
                                        )}
                                    </Col>
                                    <Col
                                        style={{
                                            alignContent : 'center',
                                            textAlign    : 'center',
                                        }}
                                        span={12}>
                                        <Typography.Title style={{
                                            margin     : 0,
                                            textShadow : '1px 2px 4px black',
                                        }}>
                                            {`${weatherData.currently.temperature.toFixed(0)}°`}
                                        </Typography.Title>
                                    </Col>
                                    <Col
                                        style={{
                                            alignContent : 'center',
                                            textAlign    : 'end',
                                        }}
                                        span={4}>
                                        <Row>
                                            <Col span={24}>
                                                <Typography.Text style={{
                                                    textShadow : '1px 2px 4px black',
                                                }}>
                                                    {`${weatherData.daily[0].temperatureMax?.toFixed(0)}°`}
                                                </Typography.Text>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col span={24}>
                                                <Typography.Text style={{
                                                    textShadow : '1px 2px 4px black',
                                                }}>
                                                    {`${weatherData.daily[0].temperatureMin?.toFixed(0)}°`}
                                                </Typography.Text>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={12}>
                                        <FontAwesomeIcon
                                            style={{
                                                filter : 'drop-shadow(1px 2px 4px black)',
                                            }}
                                            icon={faDroplet} />
                                        <Typography.Text style={{
                                            textShadow : '1px 2px 4px black',
                                        }}>
                                            {` ${weatherData.currently.humidity.toFixed(0)}%`}
                                        </Typography.Text>
                                    </Col>
                                    <Col
                                        style={{
                                            textAlign : 'end',
                                        }}
                                        span={12}>
                                        <FontAwesomeIcon
                                            style={{
                                                filter : 'drop-shadow(1px 2px 4px black)',
                                            }}
                                            icon={faWind} />
                                        <Typography.Text style={{
                                            textShadow : '1px 2px 4px black',
                                        }}>
                                            {` ${weatherData.currently.windSpeed ? weatherData.currently.windSpeed.toFixed(0) : '-'} ${t('unit_wind_speed')}`}
                                        </Typography.Text>
                                    </Col>
                                </Row>
                            </>
                        )}
                        {(!weatherData || !weatherData.currently || !weatherData.daily) &&!isLoading && !isUninitialized && (
                            <Empty
                                description={t('empty_weather_data')}
                                image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )}
                    </Card>
                </Col>
                <Col span={12}>
                    <Card style={{
                        paddingTop      : 2.5,
                        border          : 'none',
                        backgroundColor : `rgba(0, 0, 0, ${TRANSPARENCY})`,
                    }}>
                        <>
                            {!weatherData && (isLoading || isUninitialized) && (
                                <Skeleton active paragraph={{
                                    rows : 4,
                                }} />
                            )}
                            {weatherData && weatherData.hourly && weatherData.hourly.slice(1, 5).map(hour => (
                                <Row key={hour.time}>
                                    <Col
                                        style={{
                                            paddingRight : 8,
                                            textAlign    : 'end',
                                        }}
                                        span={7}>
                                        <Typography.Text style={{
                                            fontSize   : '0.85em',
                                            textShadow : '1px 2px 4px black',
                                        }}>
                                            {new Date(hour.time * 1000).toLocaleTimeString([], {
                                                hour   : 'numeric',
                                                hour12 : true,
                                            })}
                                        </Typography.Text>
                                    </Col>
                                    <Col span={3}>
                                        {hour.weatherCode && (
                                            <FontAwesomeIcon
                                                style={{
                                                    filter : 'drop-shadow(1px 2px 4px black)',
                                                }}
                                                icon={hour.isDay ? WEATHER_ICONS[hour.weatherCode] : NIGHT_WEATHER_ICONS[hour.weatherCode]} />
                                        )}
                                    </Col>
                                    <Col
                                        style={{
                                            textAlign : 'end',
                                        }}
                                        span={3}>
                                        <Typography.Text style={{
                                            fontSize   : '0.85em',
                                            textShadow : '1px 2px 4px black',
                                        }}>
                                            {`${hour.temperature.toFixed(0)}°`}
                                        </Typography.Text>
                                    </Col>
                                    <Col
                                        style={{
                                            textAlign : 'end',
                                        }}
                                        span={6}>
                                        <Typography.Text style={{
                                            fontSize   : '0.85em',
                                            textShadow : '1px 2px 4px black',
                                        }}>
                                            {`${hour.precipitation.toFixed(1)}${t('unit_precipitation')}`}
                                        </Typography.Text>
                                    </Col>
                                    <Col
                                        style={{
                                            textAlign : 'end',
                                        }}
                                        span={5}>
                                        <Typography.Text style={{
                                            fontSize   : '0.85em',
                                            textShadow : '1px 2px 4px black',
                                        }}>
                                            {`${hour.precipitationProbability}%`}
                                        </Typography.Text>
                                    </Col>
                                </Row>
                            ))}
                            {(!weatherData || !weatherData.hourly) && !isLoading && !isUninitialized && (
                                <Empty
                                    description={t('empty_news_feed')}
                                    image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            )}
                        </>
                    </Card>
                </Col>
            </Row>
            <Row style={{
                paddingLeft   : 8,
                paddingRight  : 8,
                paddingBottom : 8,
            }}>
                <Col span={24}>
                    <Card style={{
                        border          : 'none',
                        backgroundColor : `rgba(0, 0, 0, ${TRANSPARENCY})`,
                    }}>
                        <Row>
                            {!weatherData && (isLoading || isUninitialized) && (
                                <Skeleton active paragraph={{
                                    rows : 4,
                                }} />
                            )}
                            {weatherData && weatherData.daily && !isLoading && !isUninitialized && weatherData.daily.slice(1, 7).map((day, index) => (
                                <Col
                                    key={day.time}
                                    style={{
                                        borderLeft   : index === 0 ? 'none' : `1px solid ${token.token.colorBorderSecondary}`,
                                    }}
                                    span={4}>
                                    <Row style={{
                                        justifyContent : 'center',
                                    }}>
                                        <Typography.Text style={{
                                            textShadow : '1px 2px 4px black',
                                        }}>
                                            {new Date(day.time * 1000).toLocaleDateString('en-GB', {
                                                weekday : 'short',
                                                day     : 'numeric',
                                            })}
                                        </Typography.Text>
                                    </Row>
                                    <Row style={{
                                        padding        : 2,
                                        justifyContent : 'center',
                                    }}>
                                        {day.weatherCode && (
                                            <FontAwesomeIcon
                                                style={{
                                                    filter : 'drop-shadow(1px 2px 4px black)',
                                                }}
                                                size='xl'
                                                icon={WEATHER_ICONS[day.weatherCode]} />
                                        )}
                                    </Row>
                                    <Row style={{
                                        justifyContent : 'center',
                                    }}>
                                        <Typography.Text style={{
                                            textShadow : '1px 2px 4px black',
                                        }}>
                                            {`${day.temperatureMin ? day.temperatureMin.toFixed(0) : '-'}° / ${day.temperatureMax ? day.temperatureMax.toFixed(0) : '-'}°`}
                                        </Typography.Text>
                                    </Row>
                                    <Row style={{
                                        justifyContent : 'center',
                                    }}>
                                        <Typography.Text style={{
                                            fontSize   : '0.85em',
                                            textShadow : '1px 2px 4px black',
                                        }}>
                                            {`${day.precipitation.toFixed(1)} ${t('unit_precipitation')}`}
                                        </Typography.Text>
                                    </Row>
                                    <Row style={{
                                        justifyContent : 'center',
                                    }}>
                                        <Typography.Text style={{
                                            fontSize   : '0.85em',
                                            textShadow : '1px 2px 4px black',
                                        }}>
                                            {`${day.precipitationProbability}%`}
                                        </Typography.Text>
                                    </Row>
                                </Col>
                            ))}
                            {!weatherData && !isLoading && !isUninitialized && (
                                <Empty
                                    description={t('empty_news_feed')}
                                    image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            )}
                        </Row>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};
