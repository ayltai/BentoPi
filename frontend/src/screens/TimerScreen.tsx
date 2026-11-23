import { Alert, Button, Typography, } from 'antd';
import { useEffect, useState, useSyncExternalStore, } from 'react';
import { useTranslation, } from 'react-i18next';

import { Timer, } from '../components';
import { LOCALE, } from '../constants';
import { useAppSelector, } from '../hooks';
import { COUNTDOWN_ADJUSTMENTS, DEFAULT_COUNTDOWN_MINUTES, MIN_COUNTDOWN_MINUTES, } from '../timer/constants';
import { createTimerController, } from '../timer/timerController';
import './TimerScreen.css';

export const TimerScreen = () => {
    const { track, } = useAppSelector(root => root.alarm);

    const [ durationMinutes, setDurationMinutes, ] = useState(DEFAULT_COUNTDOWN_MINUTES);

    const [ controller, ] = useState(() => createTimerController(track));

    const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot);

    const { t, i18n, } = useTranslation();

    useEffect(() => controller.connect(), [ controller, ]);

    useEffect(() => {
        controller.setAlarmTrack(track);
    }, [ controller, track, ]);

    const reset = () : void => {
        controller.reset();
        setDurationMinutes(DEFAULT_COUNTDOWN_MINUTES);
    };

    const isSettingUp         = !state.timer && !state.timeUp;
    const initialDurationMs   = isSettingUp ? durationMinutes * 60_000 : state.initialDurationMs;
    const remainingDurationMs = isSettingUp ? initialDurationMs : state.remainingMs;
    const heading             = t(isSettingUp ? 'label_timer_setup' : 'label_timer_countdown');

    return (
        <section
            className='timer-screen'
            aria-label={t('label_timer_countdown')}>
            <div className='timer-heading'>
                <Typography.Text
                    strong
                    title={heading}>
                    {heading}
                </Typography.Text>
            </div>
            {state.storageError && (
                <Alert
                    className='timer-error'
                    type='error'
                    showIcon
                    message={t('error_timer_storage')} />
            )}
            {state.audioError && (
                <Alert
                    className='timer-error'
                    type='error'
                    showIcon
                    message={t('error_timer_audio')} />
            )}
            <div className='timer-content'>
                <Timer
                    initialDurationMs={initialDurationMs}
                    remainingDurationMs={remainingDurationMs}
                    isRunning={state.timer?.status === 'running'}
                    locale={i18n?.resolvedLanguage ?? i18n?.language ?? LOCALE} />
                <div className='timer-controls'>
                    {isSettingUp ? (
                        <>
                            <fieldset
                                className='timer-adjustments'
                                aria-label={t('label_timer_duration')}>
                                {COUNTDOWN_ADJUSTMENTS.map(amount => (
                                    <Button
                                        key={amount}
                                        aria-label={t(amount < 0 ? 'label_timer_subtract_minutes' : 'label_timer_add_minutes', {
                                            count : Math.abs(amount),
                                        })}
                                        disabled={durationMinutes + amount < MIN_COUNTDOWN_MINUTES}
                                        onClick={() => setDurationMinutes(previous => Math.max(MIN_COUNTDOWN_MINUTES, previous + amount))}>
                                        {amount > 0 ? '+' : '-'}{Math.abs(amount)}
                                    </Button>
                                ))}
                            </fieldset>
                            <Button
                                type='primary'
                                onClick={() => controller.startTimer(durationMinutes * 60_000)}>
                                {t('action_timer_start')}
                            </Button>
                        </>
                    ) : state.timeUp ? (
                        <>
                            <Typography.Text
                                className='timer-time-up'
                                aria-live='polite'
                                strong>
                                {t('label_timer_time_up')}
                            </Typography.Text>
                            <Button
                                type='primary'
                                onClick={reset}>
                                {t('action_timer_new')}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Typography.Text>{t(state.timer?.status === 'paused' ? 'label_timer_paused' : 'label_timer_running')}</Typography.Text>
                            <Button
                                type='primary'
                                onClick={state.timer?.status === 'paused' ? controller.resume : controller.pause}>
                                {t(state.timer?.status === 'paused' ? 'action_timer_resume' : 'action_timer_pause')}
                            </Button>
                            <Button onClick={reset}>{t('action_timer_reset')}</Button>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};
