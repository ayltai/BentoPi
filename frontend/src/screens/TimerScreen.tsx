import { Flex, Typography, } from 'antd';
import { useEffect, useState, } from 'react';

import { Timer, } from '../components';
import { WS_ENDPOINT, } from '../constants';
import { useWebSocket, } from '../hooks';

export const TimerScreen = () => {
    const [ title,     setTitle,     ] = useState<string>('');
    const [ timeLimit, setTimeLimit, ] = useState<number>(60);

    const { messages, } = useWebSocket(`${WS_ENDPOINT}/timer`);

    useEffect(() => {
        if (messages.length > 0) {
            const latestMessage = messages[messages.length - 1];

            if (latestMessage.title) setTimeout(() => setTitle(latestMessage.title), 1);

            if (latestMessage.timeLimit) setTimeout(() => setTimeLimit(latestMessage.timeLimit), 1);
        }
    }, [ messages, ]);

    return (
        <Flex
            vertical
            align='center'
            justify='center'>
            <Typography.Text
                style={{
                    marginTop    : 12,
                    marginBottom : -12,
                    marginLeft   : 16,
                    marginRight  : 16,
                    fontSize     : 18,
                    textAlign    : 'center',
                }}>
                {title}
            </Typography.Text>
            <Timer
                width={216}
                height={216}
                minutes={timeLimit} />
        </Flex>
    );
};
