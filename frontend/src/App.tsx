import { FontAwesomeIcon, } from '@fortawesome/react-fontawesome';
import { faCloudRain, faSnowflake, } from '@fortawesome/free-solid-svg-icons';
import { ConfigProvider, Layout, notification, theme, } from 'antd';
import { useEffect, } from 'react';
import { useTranslation, } from 'react-i18next';
import { createHashRouter, Navigate, Outlet, } from 'react-router';
import { RouterProvider, } from 'react-router/dom';

import { useGetWeatherQuery, } from './apis';
import { IdleManager, TopBar, } from './components';
import { INTERVAL_WEATHER_UPDATE, LOCATION_LATITUDE, LOCATION_LONGITUDE, LOCATION_TIMEZONE, SCREEN_WIDTH, TOP_BAR_HEIGHT, } from './constants';
import { CamerasScreen, ClockScreen, DisruptionsScreen, GamesScreen, HangmanGameScreen, HomeScreen, MemoryGameScreen, NewsScreen, SystemScreen, WeatherScreen, } from './screens';
import { handleError, } from './utils';

const DashboardLayout = () => (
    <Layout style={{
        width    : SCREEN_WIDTH,
        maxWidth : SCREEN_WIDTH,
    }}>
        <Layout.Header>
            <TopBar />
        </Layout.Header>
        <Layout.Content>
            <div style={{
                minHeight : 'calc(100vh - 48px)',
            }}>
                <Outlet />
            </div>
        </Layout.Content>
    </Layout>
);

export const App = () => {
    const { data, error, } = useGetWeatherQuery({
        latitude  : LOCATION_LATITUDE,
        longitude : LOCATION_LONGITUDE,
        timezone  : LOCATION_TIMEZONE,
    }, {
        pollingInterval : INTERVAL_WEATHER_UPDATE,
    });

    const [ api, contextHolder, ] = notification.useNotification();

    const { t, } = useTranslation();

    useEffect(() => {
        api.destroy('weather_alert');

        if (data && data.minutely && data.minutely.some(minute => minute.precipitation > 0)) {
            const minute = data.minutely.find(m => m.precipitation > 0);
            if (minute && minute.time - Date.now() / 1000 > 60) api.warning({
                key          : 'weather_alert',
                message      : t(minute.snow > 0 ? 'alert_snow' : 'alert_rain'),
                description  : t(minute.snow > 0 ? 'incoming_snow' : 'incoming_rain', {
                    count : Math.ceil((minute.time - Date.now() / 1000) / 60),
                }),
                icon         : <FontAwesomeIcon icon={minute.snow > 0 ? faSnowflake : faCloudRain} />,
                duration     : minute.time - Date.now() / 1000,
                placement    : 'bottomRight',
                showProgress : true,
            });
        }
    }, [ data, api, t, ]);

    useEffect(() => {
        if (error) handleError(error);
    }, [ error, ]);

    return (
        <ConfigProvider
            theme={{
                algorithm  : theme.darkAlgorithm,
                token      : {
                    borderRadius   : 8,
                    borderRadiusXS : 4,
                    fontSize       : 16,
                },
                components : {
                    Card   : {
                        bodyPadding : 8,
                    },
                    Layout : {
                        headerHeight : TOP_BAR_HEIGHT,
                    },
                    Tabs   : {
                        verticalItemPadding : '12px 12px',
                    },
                },
            }}>
            {contextHolder}
            <RouterProvider router={createHashRouter([
                {
                    Component : IdleManager,
                    children  : [
                        {
                            path    : '/',
                            index   : true,
                            element : (
                                <Navigate
                                    replace
                                    to='/dashboard/home' />
                            ),
                        }, {
                            path      : '/clock',
                            Component : ClockScreen,
                        }, {
                            Component : DashboardLayout,
                            children  : [
                                {
                                    path      : '/dashboard/home',
                                    Component : HomeScreen,
                                }, {
                                    path      : '/dashboard/weather',
                                    Component : WeatherScreen,
                                }, {
                                    path      : '/dashboard/news',
                                    Component : NewsScreen,
                                }, {
                                    path      : '/dashboard/disruptions',
                                    Component : DisruptionsScreen,
                                }, {
                                    path      : '/dashboard/games',
                                    Component : GamesScreen,
                                }, {
                                    path      : '/dashboard/security',
                                    Component : CamerasScreen,
                                }, {
                                    path      : '/dashboard/system',
                                    Component : SystemScreen,
                                }, {
                                    path      : '/games/memory',
                                    Component : MemoryGameScreen,
                                }, {
                                    path      : '/games/hangman',
                                    Component : HangmanGameScreen,
                                },
                            ],
                        },
                    ],
                },
                {
                    path    : '*',
                    element : <Navigate to='/' />,
                },
            ])} />
        </ConfigProvider>
    );
};
