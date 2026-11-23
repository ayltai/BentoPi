import { TIMER_STORAGE_KEY, } from './constants';

export type SavedTimer = {
    initialDurationMs : number,
    remainingMs       : number,
    status            : 'running' | 'paused',
};

export const loadTimer = () : SavedTimer | null => {
    const json = localStorage.getItem(TIMER_STORAGE_KEY);
    if (json === null) return null;

    let value : unknown;

    try {
        value = JSON.parse(json);
    } catch {
        throw new Error('Saved timer data is invalid.');
    }

    if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error('Saved timer data is invalid.');

    const record = value as Record<string, unknown>;
    const { initialDurationMs, remainingMs, status, } = record;

    if (typeof initialDurationMs !== 'number' || !Number.isFinite(initialDurationMs) || initialDurationMs <= 0 || initialDurationMs > Number.MAX_SAFE_INTEGER || typeof remainingMs !== 'number' || !Number.isFinite(remainingMs) || remainingMs <= 0 || remainingMs > initialDurationMs || (status !== 'running' && status !== 'paused')) throw new Error('Saved timer data is invalid.');

    return {
        initialDurationMs,
        remainingMs,
        status,
    };
};

export const saveTimer = (timer : SavedTimer | null) : void => {
    if (timer) {
        localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timer));
    } else {
        localStorage.removeItem(TIMER_STORAGE_KEY);
    }
};
