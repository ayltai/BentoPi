import { useCallback, useEffect, useRef, useState, } from 'react';

import { handleError, } from '../utils';

export const useWebSocket = (url : string, onMessage? : (message : Record<string, any>) => void) => {
    const [ messages, setMessages, ] = useState<Record<string, any>[]>([]);
    const [ status,   setStatus,   ] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');

    const socketRef    = useRef<WebSocket | null>(null);
    const onMessageRef = useRef(onMessage);

    const connect = useCallback(() => {
        socketRef.current = new WebSocket(url);

        socketRef.current.onopen  = () => setStatus('connected');
        socketRef.current.onclose = () => setStatus('disconnected');
        socketRef.current.onerror = () => setStatus('error');

        socketRef.current.onmessage = event => {
            try {
                const message : Record<string, any> = JSON.parse(event.data);

                onMessageRef.current?.(message);

                setMessages(previous => [
                    ...previous,
                    message,
                ]);
            } catch (error) {
                handleError(error);
            }
        };
    }, [ url, ]);

    const send = (message : Record<string, any>) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) socketRef.current.send(JSON.stringify(message));
    };

    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [ onMessage, ]);

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
        if (status === 'disconnected') {
            const timeout = window.setTimeout(connect, 500);

            return () => window.clearTimeout(timeout);
        }
    }, [ status, connect, ]);

    return { status, messages, send, };
};
