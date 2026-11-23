export const DEFAULT_COUNTDOWN_MINUTES = 30;
export const MIN_COUNTDOWN_MINUTES = 5;
export const MIN_COUNTDOWN_DURATION_MS = MIN_COUNTDOWN_MINUTES * 60_000;
export const COUNTDOWN_CHECKPOINT_INTERVAL_MS = 10_000;
export const TIMER_STORAGE_KEY = 'bentopi-timer';

export const COUNTDOWN_ADJUSTMENTS = [
    5,
    10,
    15,
    -5,
    -10,
    -15,
] as const;

export const RAINBOW_COLORS = [
    '#ef4444',
    '#f97316',
    '#facc15',
    '#22c55e',
    '#3b82f6',
    '#4f46e5',
    '#a855f7',
] as const;
