export type CountdownStatus = 'running' | 'paused';

export type CountdownTimer = {
    initialDurationMs : number,
    remainingMs       : number,
    anchorMs          : number,
    status            : CountdownStatus,
};

export const startCountdown = (durationMs : number, nowMs : number) : CountdownTimer => ({
    initialDurationMs : durationMs,
    remainingMs       : durationMs,
    anchorMs          : nowMs,
    status            : 'running',
});

export const getRemainingMs = (timer : CountdownTimer, nowMs : number) : number => timer.status === 'running' ? Math.max(0, timer.remainingMs - Math.max(0, nowMs - timer.anchorMs)) : timer.remainingMs;

export const pauseCountdown = (timer : CountdownTimer, nowMs : number) : CountdownTimer => ({
    ...timer,
    remainingMs : getRemainingMs(timer, nowMs),
    anchorMs    : nowMs,
    status      : 'paused',
});

export const resumeCountdown = (timer : CountdownTimer, nowMs : number) : CountdownTimer => ({
    ...timer,
    anchorMs : nowMs,
    status   : 'running',
});
