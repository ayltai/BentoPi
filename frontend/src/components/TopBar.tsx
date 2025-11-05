import { ArrowLeftOutlined, } from '@ant-design/icons';
import { faDroplet, faTemperatureFull, } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon, } from '@fortawesome/react-fontawesome';
import { Button, Flex, theme, Typography, } from 'antd';
import { useEffect, } from 'react';
import { useTranslation, } from 'react-i18next';
import { useNavigate, useLocation, } from 'react-router';

import { useGetHumidityQuery, useGetTemperatureQuery ,} from '../apis';
import { INTERVAL_HUMIDITY_UPDATE, INTERVAL_TEMPERATURE_UPDATE, SCREEN_WIDTH, TOP_BAR_HEIGHT, } from '../constants';
import { handleError, } from '../utils';
import { Clock, } from './Clock';

const LINKS : Record<string, number> = {
    '/dashboard/weather'     : 0,
    '/dashboard/news'        : 1,
    '/dashboard/disruptions' : 2,
    '/dashboard/security'    : 3,
    '/dashboard/system'      : 4,
};

export const TopBar = () => {
    const { data : temperatureData, error : temperatureError, } = useGetTemperatureQuery(undefined, {
        pollingInterval : INTERVAL_TEMPERATURE_UPDATE,
    });

    const { data : humidityData, error : humidityError, } = useGetHumidityQuery(undefined, {
        pollingInterval : INTERVAL_HUMIDITY_UPDATE,
    });

    useEffect(() => {
        if (temperatureError) handleError(temperatureError);
    }, [ temperatureError, ]);

    useEffect(() => {
        if (humidityError) handleError(humidityError);
    }, [ humidityError, ]);

    const navigate = useNavigate();
    const location = useLocation();
    const token    = theme.useToken();

    const { t, } = useTranslation();

    const handleClick = () => navigate(-1);

    return (
        <Flex style={{
            width           : SCREEN_WIDTH,
            maxWidth        : SCREEN_WIDTH,
            height          : TOP_BAR_HEIGHT,
            top             : 0,
            left            : 0,
            right           : 0,
            padding         : 8,
            lineHeight      : 1,
            zIndex          : 1000,
            position        : 'fixed',
            alignItems      : 'center',
            backgroundColor : token.token.colorBgContainer,
        }}>
            {!location.pathname.endsWith('/dashboard/home') && (
                <Button
                    style={{
                        marginRight : 8,
                    }}
                    type='text'
                    icon={<ArrowLeftOutlined />}
                    onClick={handleClick} />
            )}
            {LINKS[location.pathname] !== undefined && (
                <Typography.Text>
                    {(t('apps', {
                        returnObjects : true,
                    }) as string[])[LINKS[location.pathname]]}
                </Typography.Text>
            )}
            <div style={{
                display       : 'flex',
                flexDirection : 'column',
                flexGrow      : 1,
                alignItems    : 'end',
            }}>
                <div style={{
                    paddingRight : 8,
                    flexGrow     : 1,
                    alignContent : 'center',
                }}>
                    {temperatureData && (
                        <Typography.Text style={{
                            fontSize : '0.85em',
                        }}>
                            <FontAwesomeIcon icon={faTemperatureFull} />
                            {`${temperatureData.toFixed(0)}° `}
                        </Typography.Text>
                    )}
                    {humidityData && (
                        <Typography.Text style={{
                            fontSize : '0.85em',
                        }}>
                            <FontAwesomeIcon icon={faDroplet} />
                            {`${humidityData.toFixed(0)}% `}
                        </Typography.Text>
                    )}
                    <Clock />
                </div>
            </div>
        </Flex>
    );
};
