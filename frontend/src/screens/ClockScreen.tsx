import { Flex, Layout, Typography, } from 'antd';
import { useEffect, useState, } from 'react';

import { INTERVAL_TIME_UPDATE, } from '../constants';

export const ClockScreen = () => {
    const [ time, setTime, ] = useState<Date>(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), INTERVAL_TIME_UPDATE);

        return () => clearInterval(timer);
    }, []);

    return (
        <Layout>
            <Layout.Content>
                <Flex
                    style={{
                        marginTop    : 104,
                        marginBottom : 104,
                    }}
                    vertical
                    align='center'
                    justify='center'>
                    <Typography.Title
                        style={{
                            margin : 8,
                        }}
                        level={3}>
                        {time.toLocaleString('en-GB', {
                            weekday : 'short',
                            day     : 'numeric',
                            month   : 'short',
                            year    : 'numeric',
                        })}
                    </Typography.Title>
                    <Typography.Title style={{
                        margin : 8,
                    }}>
                        {time.toLocaleString('en-GB', {
                            hour    : 'numeric',
                            minute  : '2-digit',
                            hour12  : true,
                        })}
                    </Typography.Title>
                </Flex>
            </Layout.Content>
        </Layout>
    );
};
