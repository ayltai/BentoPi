import { useCallback, useEffect, useRef, useState, } from 'react';

import { handleError, } from '../utils';

export const useWebSocket = (url : string) => {
    const [ messages, setMessages, ] = useState<Record<string, any>[]>([]);
    const [ status,   setStatus,   ] = useState<'connecting' | 'connected' | 'disconnected' | 'close' | 'error'>('disconnected');

    const socketRef = useRef<WebSocket | null>(null);

    const connect = useCallback(() => {
        socketRef.current = new WebSocket(url);

        socketRef.current.onopen = () => setStatus('connected');

        socketRef.current.onclose = event => {
            if (event.wasClean) {
                setStatus('close');
            } else {
                setStatus('disconnected');
            }
        };

        socketRef.current.onmessage = event => {
            try {
                const message : Record<string, any> = JSON.parse(event.data);

                setMessages(previous => [
                    ...previous,
                    message,
                ]);
            } catch (error) {
                handleError(error);
            }
        };

        socketRef.current.onerror = () => setStatus('error');
    }, [ url, ]);

    const send = (message : Record<string, any>) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) socketRef.current.send(JSON.stringify(message));
    };

    useEffect(() => {
        connect();

        return () => {
            if (socketRef.current) {
                const socket = socketRef.current;

                socket.onclose = null;
                socket.close();
            }
        };
    }, [ url, connect, ]);

    useEffect(() => {
        if (status === 'disconnected') connect();
    }, [ status, connect, ]);

    return { status, messages, send, };
};
