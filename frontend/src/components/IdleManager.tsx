import { useEffect, useRef, } from 'react';
import { Outlet, useLocation, useNavigate, } from 'react-router';

import { TIMEOUT_IDLE, } from '../constants';

const EVENTS : string[] = [
    'click',
    'dblclick',
    'mousemove',
    'mousedown',
    'touchmove',
    'touchstart',
];

export const IdleManager = () => {
    const navigate       = useNavigate();
    const location       = useLocation();
    const timerRef      = useRef<number>(null);
    const navigateRef   = useRef(navigate);
    const locationRef   = useRef(location);

    useEffect(() => {
        navigateRef.current = navigate;
    }, [ navigate, ]);

    useEffect(() => {
        locationRef.current = location;
    }, [ location, ]);

    useEffect(() => {
        const resetTimer = () => {
            if (timerRef.current) clearTimeout(timerRef.current);

            timerRef.current = setTimeout(() => {
                if (locationRef.current?.pathname !== '/clock') {
                    navigateRef.current?.('/clock');
                }
            }, TIMEOUT_IDLE);
        };

        EVENTS.forEach(event => window.addEventListener(event, resetTimer));

        resetTimer();

        return () => {
            EVENTS.forEach(event => window.removeEventListener(event, resetTimer));

            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    useEffect(() => {
        if (location.pathname === '/clock') {
            const handleResume = () => navigateRef.current?.(-1);

            EVENTS.forEach(event => window.addEventListener(event, handleResume, {
                once : true,
            }));

            return () => EVENTS.forEach(event => window.removeEventListener(event, handleResume));
        }
    }, [ location.pathname, ]);

    return <Outlet />;
};
