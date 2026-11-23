import { handleError, } from '../utils';
import { timerAudio, type TimerAudio, } from './audio';
import { COUNTDOWN_CHECKPOINT_INTERVAL_MS, MIN_COUNTDOWN_DURATION_MS, } from './constants';
import { getRemainingMs, pauseCountdown, resumeCountdown, startCountdown, type CountdownTimer, } from './countdown';
import { loadTimer, saveTimer, type SavedTimer, } from './storage';

export type TimerState = {
    timer             : CountdownTimer | null,
    initialDurationMs : number,
    remainingMs       : number,
    title             : string,
    timeUp            : boolean,
    storageError      : boolean,
    audioError        : boolean,
};

type ControllerDependencies = {
    now?     : () => number,
    audio?   : TimerAudio,
    load?    : () => SavedTimer | null,
    save?    : (timer : SavedTimer | null) => void,
    onError? : (error : unknown) => void,
};

export const createTimerController = (initialTrack : string, dependencies : ControllerDependencies = {}) => {
    const now       = dependencies.now ?? (() => performance.now());
    const audio     = dependencies.audio ?? timerAudio;
    const load      = dependencies.load ?? loadTimer;
    const save      = dependencies.save ?? saveTimer;
    const onError   = dependencies.onError ?? handleError;
    const listeners = new Set<() => void>();

    let state : TimerState = {
        timer             : null,
        initialDurationMs : 0,
        remainingMs       : 0,
        title             : '',
        timeUp            : false,
        storageError      : false,
        audioError        : false,
    };
    let track               = initialTrack;
    let lastSaveMs          = now();
    let lastTickRemainingMs = 0;
    let audioGeneration     = 0;
    let recoveredRunning    = false;

    try {
        const saved = load();
        if (saved) {
            state = {
                ...state,
                timer             : {
                    initialDurationMs : saved.initialDurationMs,
                    remainingMs       : saved.remainingMs,
                    anchorMs          : now(),
                    status            : 'paused',
                },
                initialDurationMs : saved.initialDurationMs,
                remainingMs       : saved.remainingMs,
                title             : saved.title,
            };
            lastTickRemainingMs = saved.remainingMs;
            recoveredRunning = saved.status === 'running';
        }
    } catch (error) {
        onError(error);
        state = {
            ...state,
            storageError : true,
        };
    }

    const notify = () : void => {
        for (const listener of listeners) listener();
    };

    const update = (changes : Partial<TimerState>) : void => {
        state = {
            ...state,
            ...changes,
        };
        notify();
    };

    const persist = (nowMs : number, changes : Partial<TimerState> = {}) : void => {
        state = {
            ...state,
            ...changes,
        };
        lastSaveMs = nowMs;

        try {
            save(state.timer ? {
                initialDurationMs : state.timer.initialDurationMs,
                remainingMs       : getRemainingMs(state.timer, nowMs),
                status            : state.timer.status,
                title             : state.title,
            } : null);
            state = {
                ...state,
                storageError : false,
            };
        } catch (error) {
            onError(error);
            state = {
                ...state,
                storageError : true,
            };
        }

        notify();
    };

    const runAudio = (operation : () => Promise<void>) : void => {
        const current = ++audioGeneration;

        operation().catch(error => {
            if (current !== audioGeneration) return;

            onError(error);
            update({
                audioError : true,
            });
        });
    };

    const stopAudio = (immediate = false) : void => runAudio(() => audio.stop(immediate));

    const finish = (nowMs : number) : void => {
        persist(nowMs, {
            timer       : null,
            remainingMs : 0,
            timeUp      : true,
        });
        runAudio(() => audio.play(track.trim().toLowerCase().replace(/\s+/g, '-')));
    };

    const tickAt = (nowMs : number) : void => {
        const timer = state.timer;
        if (timer?.status !== 'running') return;

        const remainingMs = getRemainingMs(timer, nowMs);
        const crossedFiveMinutes = lastTickRemainingMs > MIN_COUNTDOWN_DURATION_MS && remainingMs <= MIN_COUNTDOWN_DURATION_MS;
        lastTickRemainingMs = remainingMs;

        if (remainingMs === 0) {
            finish(nowMs);
        } else {
            if (nowMs - lastSaveMs >= COUNTDOWN_CHECKPOINT_INTERVAL_MS) {
                persist(nowMs, {
                    remainingMs,
                });
            } else {
                update({
                    remainingMs,
                });
            }

            if (crossedFiveMinutes) runAudio(() => audio.play('milestone-chime'));
        }
    };

    const tick = () : void => tickAt(now());

    const startTimer = (durationMs : number, title = '') : void => {
        if (!Number.isFinite(durationMs) || durationMs <= 0 || durationMs > Number.MAX_SAFE_INTEGER) throw new Error('Timer duration is invalid.');

        const nowMs = now();
        lastTickRemainingMs = durationMs;
        stopAudio();
        persist(nowMs, {
            timer             : startCountdown(durationMs, nowMs),
            initialDurationMs : durationMs,
            remainingMs       : durationMs,
            title,
            timeUp            : false,
            audioError        : false,
        });
    };

    const pauseTimer = (immediateStop = false, interrupted = false) : void => {
        if (state.timer?.status !== 'running') return;

        const nowMs = now();
        tickAt(nowMs);
        if (!state.timer) {
            if (interrupted) stopAudio(immediateStop);

            return;
        }

        if (state.timer?.status === 'running') {
            const timer = pauseCountdown(state.timer, nowMs);
            lastTickRemainingMs = timer.remainingMs;
            if (timer.remainingMs === 0) {
                finish(nowMs);
                if (!interrupted) return;
            } else {
                persist(nowMs, {
                    timer,
                    remainingMs : timer.remainingMs,
                    audioError  : false,
                });
            }
        }

        if (interrupted) stopAudio(immediateStop);
    };

    const pause = () : void => pauseTimer();

    const resume = () : void => {
        if (state.timer?.status !== 'paused') return;

        const nowMs = now();
        const timer = resumeCountdown(state.timer, nowMs);
        lastTickRemainingMs = timer.remainingMs;
        persist(nowMs, {
            timer,
            remainingMs : timer.remainingMs,
            audioError  : false,
        });
    };

    const reset = () : void => {
        lastTickRemainingMs = 0;
        stopAudio();
        persist(now(), {
            timer             : null,
            initialDurationMs : 0,
            remainingMs       : 0,
            title             : '',
            timeUp            : false,
            audioError        : false,
        });
    };

    const interrupt = (immediateStop = false) : void => {
        if (state.timer?.status === 'running') {
            pauseTimer(immediateStop, true);
        } else {
            if (state.timer || state.timeUp) persist(now());
            stopAudio(immediateStop);
        }
    };

    const connect = () : (() => void) => {
        if (recoveredRunning) {
            recoveredRunning = false;
            persist(now());
        }

        const onVisibilityChange = () : void => {
            if (document.visibilityState === 'hidden') interrupt();
        };
        const onPageHide = () : void => interrupt(true);
        const intervalId = window.setInterval(tick, 250);
        document.addEventListener('visibilitychange', onVisibilityChange);
        window.addEventListener('pagehide', onPageHide);

        return () => {
            window.clearInterval(intervalId);
            document.removeEventListener('visibilitychange', onVisibilityChange);
            window.removeEventListener('pagehide', onPageHide);
            interrupt();
        };
    };

    return {
        connect,
        tick,
        startTimer,
        pause,
        resume,
        reset,
        setAlarmTrack : (nextTrack : string) => {
            track = nextTrack;
        },
        getSnapshot : () => state,
        subscribe   : (listener : () => void) => {
            listeners.add(listener);

            return () => {
                listeners.delete(listener);
            };
        },
    };
};
