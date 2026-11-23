import { Alert, Button, Typography, } from 'antd';
import { useEffect, useRef, useState, useSyncExternalStore, } from 'react';
import { useTranslation, } from 'react-i18next';

import { Timer, } from '../components';
import { LOCALE, WS_ENDPOINT, } from '../constants';
import { useAppSelector, useWebSocket, } from '../hooks';
import { COUNTDOWN_ADJUSTMENTS, DEFAULT_COUNTDOWN_MINUTES, MIN_COUNTDOWN_MINUTES, } from '../timer/constants';
import { getTaskReply, isTaskTimerMessage, } from '../timer/taskMessage';
import { createTimerController, } from '../timer/timerController';
import './TimerScreen.css';

export const TimerScreen = () => {
    const { track, } = useAppSelector(root => root.alarm);
    const { t, i18n, } = useTranslation();
    const [ controller, ] = useState(() => createTimerController(track));
    const [ durationMinutes, setDurationMinutes, ] = useState(DEFAULT_COUNTDOWN_MINUTES);
    const [ messageError, setMessageError, ] = useState<'invalid' | 'acknowledgment' | null>(null);
    const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot);
    const sendRef = useRef<(message : Record<string, unknown>) => boolean>(() => false);

    const { send, } = useWebSocket(`${WS_ENDPOINT}/timer`, (message) : void => {
        const reply = getTaskReply(message);
        if (!isTaskTimerMessage(message)) {
            setMessageError('invalid');
            if (reply) sendRef.current({
                target_id : reply.replyTo,
                payload   : {
                    requestId : reply.requestId,
                    accepted  : false,
                },
            });

            return;
        }

        controller.startTimer(message.timeLimit * 60_000, message.title);
        setMessageError(null);
        if (reply && !sendRef.current({
            target_id : reply.replyTo,
            payload   : {
                requestId : reply.requestId,
                accepted  : true,
            },
        })) setMessageError('acknowledgment');
    });

    useEffect(() => {
        sendRef.current = send;
    }, [ send, ]);

    useEffect(() => controller.connect(), [ controller, ]);

    useEffect(() => {
        controller.setAlarmTrack(track);
    }, [ controller, track, ]);

    const reset = () : void => {
        controller.reset();
        setDurationMinutes(DEFAULT_COUNTDOWN_MINUTES);
        setMessageError(null);
    };

    const isSettingUp = !state.timer && !state.timeUp;
    const initialDurationMs = isSettingUp ? durationMinutes * 60_000 : state.initialDurationMs;
    const remainingDurationMs = isSettingUp ? initialDurationMs : state.remainingMs;

    return (
        <section
            className='timer-screen'
            aria-label={t('label_timer_countdown')}>
            <div className='timer-heading'>
                <Typography.Text
                    strong
                    title={state.title || t('label_timer_setup')}>
                    {state.title || t('label_timer_setup')}
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
            {messageError && (
                <Alert
                    className='timer-error'
                    type='error'
                    showIcon
                    message={t(messageError === 'invalid' ? 'error_timer_task_invalid' : 'error_timer_acknowledgment')} />
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
