import { useEffect, useMemo, useState, } from 'react';

import { API_ENDPOINT, } from '../constants';
import { useAppSelector, } from '../hooks';
import { handleError, } from '../utils';
import './Timer.css';

const TIMER_SIZE    : number = 210;
const MARGIN        : number = 5;
const RADIUS        : number = 36;
const OUTER_RADIUS  : number = 72;
const STROKE_WIDTH  : number = 50;
const KNOB_SIZE     : number = 20;
const CRITICAL_TIME : number = 10;

const getColor = (percentage : number) => {
    if (percentage >= 75) return '#087f23';
    if (percentage >= 50) return '#007ac1';
    if (percentage >= 25) return '#ff9800';
    if (percentage >= 15) return '#ba000d';

    return '#f44336';
};

export const Timer = ({
    width  = 320,
    height = 320,
    minutes,
} : {
    width?  : number,
    height? : number,
    minutes : number,
}) => {
    const seconds = minutes * 60;

    const [ secondsLeft, setSecondsLeft, ] = useState<number>(seconds);
    const [ isActive,    setIsActive,    ] = useState<boolean>(false);

    const { track, } = useAppSelector((state) => state.alarm);

    const circumference    : number = 2 * Math.PI * RADIUS;
    const percentage       : number = 100 * secondsLeft / seconds;
    const strokeDashoffset : number = circumference - percentage / 100 * circumference;

    const isBlinking = percentage <= CRITICAL_TIME && secondsLeft > 0;

    const markers = useMemo(() => Array.from({
        length : 60,
    }).map((_, index) => {
        const angle   : number  = (index * 6) * (Math.PI / 180) - Math.PI / 2;
        const isMajor : boolean = index % 5 === 0;
        const innerR  : number  = isMajor ? OUTER_RADIUS - 10 : OUTER_RADIUS - 4;

        const x1 : number = TIMER_SIZE / 2 + innerR * Math.cos(angle);
        const y1 : number = TIMER_SIZE / 2 + innerR * Math.sin(angle);
        const x2 : number = TIMER_SIZE / 2 + OUTER_RADIUS * Math.cos(angle);
        const y2 : number = TIMER_SIZE /2 + OUTER_RADIUS * Math.sin(angle);

        let label = null;

        if (isMajor) {
            let value : number;

            if (minutes % 12 === 0 || seconds > 60) {
                value = Math.round((minutes / 12) * (index / 5));
            } else {
                value = Math.floor((seconds / 12) * (index / 5));
            }

            label = {
                x     : TIMER_SIZE / 2 + (OUTER_RADIUS + 12) * Math.cos(angle),
                y     : TIMER_SIZE / 2 + (OUTER_RADIUS + 12) * Math.sin(angle),
                value : index === 0 ? 0 : value,
            };
        }

        return {
            x1,
            y1,
            x2,
            y2,
            label,
        };
    }), [ minutes, seconds, ]);

    const resetTimer = () => {
        setIsActive(false);
        setSecondsLeft(seconds);
    };

    const handleStart = () => {
        setIsActive(true);

        fetch(`${API_ENDPOINT}/api/v1/music/stop`).catch(handleError);
    };

    const handlePause = () => {
        setIsActive(false);

        fetch(`${API_ENDPOINT}/api/v1/music/stop`).catch(handleError);

        if (secondsLeft === 0) resetTimer();
    };

    useEffect(() => {
        setTimeout(() => {
            setIsActive(false);
            setSecondsLeft(seconds);
        }, 1);
    }, [ minutes, seconds, ]);

    useEffect(() => {
        let interval : number | undefined;

        if (isActive) {
            interval = setInterval(() => {
                setSecondsLeft(previous => {
                    if (previous <= 1) {
                        setIsActive(false);

                        return 0;
                    }

                    return previous - 1;
                });
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [ isActive, ]);

    useEffect(() => {
        if (secondsLeft === 0) fetch(`${API_ENDPOINT}/api/v1/music/play/${track.replace(' ', '-').toLowerCase()}`).catch(handleError);
    }, [ secondsLeft, track, ]);

    return (
        <div
            style={{
                padding   : 15,
                textAlign : 'center',
            }}
            onClick={isActive ? handlePause : handleStart}>
            <svg
                width={width}
                height={height}
                viewBox={`0 0 ${TIMER_SIZE} ${TIMER_SIZE}`}>
                <rect
                    width={TIMER_SIZE - 2 * MARGIN}
                    height={TIMER_SIZE - 2 * MARGIN}
                    x={MARGIN}
                    y={MARGIN}
                    rx={24}
                    strokeWidth={6}
                    stroke='#78909c'
                    fill='#ffffff' />
                {markers.map((marker, index) => (
                    <g key={index}>
                        <line
                            x1={marker.x1}
                            y1={marker.y1}
                            x2={marker.x2}
                            y2={marker.y2}
                            stroke='#333333'
                            strokeWidth={marker.label ? 2 : 1} />
                        {marker.label && (
                            <text
                                x={marker.label.x}
                                y={marker.label.y}
                                fontFamily='sans-serif'
                                fontSize={12}
                                fontWeight='bold'
                                textAnchor='middle'
                                dominantBaseline='middle'>
                                {marker.label.value}
                            </text>
                        )}
                    </g>
                ))}
                <circle
                    style={{
                        transform       : 'rotate(-90deg)',
                        transformOrigin : '50% 50%',
                        transition      : 'stroke-dashoffset 1s linear, stroke 0.3s ease',
                    }}
                    className={isBlinking ? 'blinking' : undefined}
                    r={RADIUS}
                    cx={TIMER_SIZE / 2}
                    cy={TIMER_SIZE / 2}
                    fill='none'
                    stroke={getColor(percentage)}
                    strokeWidth={STROKE_WIDTH}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap='butt' />
                {isActive && (
                    <circle
                        r={KNOB_SIZE}
                        cx={TIMER_SIZE / 2}
                        cy={TIMER_SIZE / 2}
                        fill='#000000' />
                )}
                {!isActive && secondsLeft > 0 && (
                    <g>
                        <circle
                            r={KNOB_SIZE * 2}
                            cx={TIMER_SIZE / 2}
                            cy={TIMER_SIZE / 2}
                            fill='#A1887F' />
                        <rect
                            x={TIMER_SIZE / 2 - 15}
                            y={TIMER_SIZE / 2 - 20}
                            width={10}
                            height={40}
                            fill='#000000' />
                        <rect
                            x={TIMER_SIZE / 2 + 5}
                            y={TIMER_SIZE / 2 - 20}
                            width={10}
                            height={40}
                            fill='#000000' />
                    </g>
                )}
            </svg>
        </div>
    );
};
