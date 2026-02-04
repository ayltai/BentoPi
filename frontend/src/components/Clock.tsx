import { Typography, } from 'antd';
import { useEffect, useState, } from 'react';

import { INTERVAL_TIME_UPDATE, LOCALE, } from '../constants';

export const Clock = () => {
    const [ time, setTime, ] = useState<Date>(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), INTERVAL_TIME_UPDATE);

        return () => clearInterval(timer);
    }, []);

    return (
        <Typography.Text style={{
            fontSize : '0.85em',
        }}>
            {time.toLocaleString(LOCALE, {
                weekday : 'short',
                day     : 'numeric',
                month   : 'short',
                hour    : 'numeric',
                minute  : '2-digit',
                hour12  : true,
            })}
        </Typography.Text>
    );
};
