import { useCallback, useEffect, useRef, useState, } from 'react';

import { handleError, } from '../utils';

export const useWebSocket = (url : string, onMessage? : (message : Record<string, unknown>) => void) => {
    const [ messages, setMessages, ] = useState<Record<string, unknown>[]>([]);
    const [ status,   setStatus,   ] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');

    const socketRef    = useRef<WebSocket | null>(null);
    const onMessageRef = useRef(onMessage);
    const attemptRef   = useRef(0);

    const send = useCallback((message : Record<string, unknown>) : boolean => {
        const socket = socketRef.current;
        if (!socket || socket.readyState !== WebSocket.OPEN) return false;

        try {
            socket.send(JSON.stringify(message));

            return true;
        } catch (error) {
            handleError(error);

            return false;
        }
    }, []);

    const connect = useCallback(() => {
        const attempt = ++attemptRef.current;
        let socket : WebSocket;
        try {
            socket = new WebSocket(url);
        } catch (error) {
            handleError(error);
            queueMicrotask(() => {
                if (attemptRef.current === attempt) setStatus('error');
            });

            return;
        }

        socketRef.current = socket;

        socket.onopen = () => {
            if (socketRef.current === socket) setStatus('connected');
        };
        socket.onclose = () => {
            if (socketRef.current !== socket) return;

            socketRef.current = null;
            setStatus('disconnected');
        };
        socket.onerror = () => {
            if (socketRef.current === socket) setStatus('error');
        };

        socket.onmessage = event => {
            if (socketRef.current !== socket) return;

            let parsed : unknown;
            try {
                parsed = JSON.parse(event.data);
            } catch {
                handleError(new Error('Invalid WebSocket message JSON.'));

                return;
            }

            if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
                handleError(new Error('Invalid WebSocket message.'));

                return;
            }

            const message = parsed as Record<string, unknown>;
            try {
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

    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [ onMessage, ]);

    useEffect(() => {
        connect();

        return () => {
            attemptRef.current += 1;
            if (socketRef.current) {
                const socket = socketRef.current;

                socketRef.current = null;
                socket.onopen = null;
                socket.onclose = null;
                socket.onerror = null;
                socket.onmessage = null;
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
