import type { CSSProperties, } from 'react';
import { useTranslation, } from 'react-i18next';

import { LOCALE, } from '../constants';
import { RAINBOW_COLORS, } from '../timer/constants';
import './Timer.css';

const BAND_WIDTH = 10 / RAINBOW_COLORS.length;

export const formatRemaining = (durationMs : number, locale : string) : string => {
    const totalSeconds = Math.ceil(Math.max(0, durationMs) / 1000);
    const padded = new Intl.NumberFormat(locale, {
        minimumIntegerDigits : 2,
        useGrouping          : false,
    });
    const numbers = new Intl.NumberFormat(locale, {
        useGrouping : false,
    });
    const seconds = totalSeconds % 60;

    if (totalSeconds < 10 * 60) return `${numbers.format(Math.floor(totalSeconds / 60))}:${padded.format(seconds)}`;
    if (totalSeconds < 60 * 60) return `${padded.format(Math.floor(totalSeconds / 60))}:${padded.format(seconds)}`;

    return `${numbers.format(Math.floor(totalSeconds / 3600))}:${padded.format(Math.floor(totalSeconds % 3600 / 60))}:${padded.format(seconds)}`;
};

export const Timer = ({
    initialDurationMs,
    remainingDurationMs,
    isRunning,
    locale = LOCALE,
} : {
    initialDurationMs   : number,
    remainingDurationMs : number,
    isRunning           : boolean,
    locale?             : string,
}) => {
    const { t, } = useTranslation();
    const progress        = initialDurationMs > 0 ? Math.min(1, Math.max(0, 1 - remainingDurationMs / initialDurationMs)) : 0;
    const remaining       = formatRemaining(remainingDurationMs, locale);
    const lastMinutePulse = isRunning && remainingDurationMs > 0 && remainingDurationMs <= 60_000;
    const durationMinutes = Math.floor(initialDurationMs / 60_000);
    const tickStep        = Math.max(1, Math.ceil(durationMinutes / 12));
    const tickNumbers     = new Intl.NumberFormat(locale);

    const tickValues = Array.from({
        length : Math.floor(durationMinutes / tickStep),
    }, (_, index) => (index + 1) * tickStep);
    const tickLabelSize = `${Math.max(0.3, 1 / Math.max(2, tickNumbers.format(tickValues.at(-1) ?? 0).length))}rem`;

    return (
        <div className='timer-dial'>
            <progress
                className='timer-progress-accessible'
                aria-label={t('label_timer_remaining')}
                aria-valuetext={t('label_timer_progress', {
                    percent : Math.round(progress * 100),
                    remaining,
                })}
                max={100}
                value={progress * 100} />
            <svg
                className='timer-ring'
                aria-hidden='true'
                viewBox='-4 -4 108 108'>
                <g transform='rotate(-90 50 50)'>
                    <circle
                        cx='50'
                        cy='50'
                        r='49'
                        fill='none'
                        stroke='var(--timer-track, #394351)'
                        strokeWidth='10' />
                    {RAINBOW_COLORS.map((color, index) => (
                        <circle
                            key={color}
                            className={lastMinutePulse ? 'timer-arc timer-pulse' : 'timer-arc'}
                            cx='50'
                            cy='50'
                            r={54 - BAND_WIDTH * (index + 0.5)}
                            fill='none'
                            pathLength='100'
                            stroke={color}
                            strokeDasharray='100 100'
                            strokeDashoffset={progress * 100}
                            strokeWidth={BAND_WIDTH} />
                    ))}
                </g>
                {tickValues.map(value => {
                    const angle = value / durationMinutes * 2 * Math.PI;
                    const horizontal = Math.sin(angle);
                    const vertical = -Math.cos(angle);

                    return (
                        <g key={value}>
                            <line
                                className='timer-ring-tick'
                                x1={50 + horizontal * 41}
                                y1={50 + vertical * 41}
                                x2={50 + horizontal * 44}
                                y2={50 + vertical * 44} />
                            <text
                                className='timer-ring-label'
                                style={{
                                    fontSize : tickLabelSize,
                                }}
                                x={50 + horizontal * 34}
                                y={50 + vertical * 34}
                                textAnchor='middle'
                                dominantBaseline='central'>
                                {tickNumbers.format(value)}
                            </text>
                        </g>
                    );
                })}
            </svg>
            <div
                className='timer-dial-center'
                aria-hidden='true'>
                <span
                    className={lastMinutePulse ? 'timer-remaining timer-pulse' : 'timer-remaining'}
                    style={{
                        '--timer-characters' : Math.max(8, remaining.length + 2),
                    } as CSSProperties}>
                    {remaining}
                </span>
            </div>
        </div>
    );
};
