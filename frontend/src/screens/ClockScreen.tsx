import { Flex, Layout, Typography, } from 'antd';
import { useEffect, useState, } from 'react';

import { INTERVAL_TIME_UPDATE, TIMEOUT_SCREENSAVER, } from '../constants';

export const ClockScreen = () => {
    const [ time,    setTime,    ] = useState<Date>(new Date());
    const [ opacity, setOpacity, ] = useState<number>(0);

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

    return (
        <Layout style={{
            backgroundColor : 'black',
        }}>
            <Layout.Content>
                <Flex
                    style={{
                        marginTop       : 72,
                        marginBottom    : 80,
                        backgroundColor : 'black',
                    }}
                    vertical
                    align='center'
                    justify='center'>
                    <Typography.Title
                        style={{
                            margin   : 8,
                            fontSize : '2.75em',
                        }}>
                        {time.toLocaleString('en-GB', {
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
                        {time.toLocaleString('en-GB', {
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
