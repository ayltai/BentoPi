import { afterEach, beforeEach, describe, expect, it, vi, } from 'vitest';

import { TIMER_STORAGE_KEY, } from './constants';
import { loadTimer, } from './storage';
import { createTimerController, } from './timerController';

const minute = 60_000;

let now : number;
let audio : {
    play : ReturnType<typeof vi.fn<(track : string) => Promise<void>>>,
    stop : ReturnType<typeof vi.fn<(immediate? : boolean) => Promise<void>>>,
};
let onError : ReturnType<typeof vi.fn<(error : unknown) => void>>;

const createController = () => createTimerController('Bedside Clock Alarm', {
    now : () => now,
    audio,
    onError,
});

beforeEach(() => {
    localStorage.clear();
    now = 0;
    audio = {
        play : vi.fn().mockResolvedValue(undefined),
        stop : vi.fn().mockResolvedValue(undefined),
    };
    onError = vi.fn();
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('timer controller', () => {
    it('uses elapsed monotonic time, pauses, resumes, and restarts the same duration', () => {
        const controller = createController();
        controller.startTimer(30 * minute);
        now = 7 * minute + 250;
        controller.pause();
        expect(controller.getSnapshot()).toMatchObject({
            remainingMs : 23 * minute - 250,
            timer       : {
                status : 'paused',
            },
        });
        expect(loadTimer()).toMatchObject({
            remainingMs : 23 * minute - 250,
            status      : 'paused',
        });

        now = 60 * minute;
        controller.resume();
        now += 2 * minute;
        controller.tick();
        expect(controller.getSnapshot().remainingMs).toBe(21 * minute - 250);

        controller.startTimer(30 * minute);
        expect(controller.getSnapshot()).toMatchObject({
            remainingMs : 30 * minute,
            timer       : {
                status : 'running',
            },
        });
        expect(audio.stop).toHaveBeenCalledTimes(2);
    });

    it('checkpoints at ten-second intervals using the actual elapsed time', () => {
        const setItem = vi.spyOn(Storage.prototype, 'setItem');
        const controller = createController();
        controller.startTimer(30 * minute);
        now = 9_999;
        controller.tick();
        expect(setItem).toHaveBeenCalledTimes(1);
        now = 35_500;
        controller.tick();
        expect(setItem).toHaveBeenCalledTimes(2);
        expect(loadTimer()).toMatchObject({
            remainingMs : 30 * minute - 35_500,
            status      : 'running',
        });
    });

    it('plays one milestone when crossing five minutes, even across a pause', () => {
        const controller = createController();
        controller.startTimer(30 * minute);
        now = 25 * minute;
        controller.tick();
        controller.tick();
        expect(audio.play).toHaveBeenCalledExactlyOnceWith('milestone-chime');
        controller.pause();
        now = 50 * minute;
        controller.resume();
        now += minute;
        controller.tick();
        expect(audio.play).toHaveBeenCalledTimes(1);
    });

    it('plays the milestone when a manual pause crosses the five-minute mark', () => {
        const controller = createController();
        controller.startTimer(10 * minute);
        now = 5 * minute;
        controller.pause();

        expect(audio.play).toHaveBeenCalledExactlyOnceWith('milestone-chime');
        expect(audio.stop).toHaveBeenCalledTimes(1);
        expect(controller.getSnapshot().timer?.status).toBe('paused');
    });

    it('does not play a milestone when starting at or below five minutes', () => {
        const controller = createController();
        controller.startTimer(5 * minute);
        now = minute;
        controller.tick();
        controller.startTimer(2 * minute);
        now += minute;
        controller.tick();
        expect(audio.play).not.toHaveBeenCalled();
    });

    it('skips the milestone on a jump to expiry and clears recovery without replaying the alarm', () => {
        const controller = createController();
        controller.startTimer(10 * minute);
        now = 11 * minute;
        controller.tick();
        controller.tick();
        expect(audio.play).toHaveBeenCalledExactlyOnceWith('bedside-clock-alarm');
        expect(controller.getSnapshot()).toMatchObject({
            timer             : null,
            timeUp            : true,
            remainingMs       : 0,
            initialDurationMs : 10 * minute,
        });
        expect(loadTimer()).toBeNull();

        const recovered = createController();
        expect(recovered.getSnapshot().timeUp).toBe(false);
        expect(audio.play).toHaveBeenCalledTimes(1);
    });

    it('plays the final alarm instead of pausing when time has already expired', () => {
        const controller = createController();
        controller.startTimer(5 * minute);
        now = 5 * minute;
        controller.pause();
        expect(controller.getSnapshot()).toMatchObject({
            timer  : null,
            timeUp : true,
        });
        expect(audio.play).toHaveBeenCalledExactlyOnceWith('bedside-clock-alarm');
        expect(audio.stop).toHaveBeenCalledTimes(1);
    });

    it('restores a short saved timer paused and checkpoints the paused recovery', () => {
        localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify({
            initialDurationMs : 2 * minute,
            remainingMs       : minute,
            status            : 'running',
        }));
        const controller = createController();
        expect(controller.getSnapshot()).toMatchObject({
            remainingMs : minute,
            timer       : {
                status : 'paused',
            },
        });
        const disconnect = controller.connect();
        expect(loadTimer()?.status).toBe('paused');
        controller.resume();
        now = 30_000;
        controller.tick();
        expect(controller.getSnapshot().remainingMs).toBe(30_000);
        expect(audio.play).not.toHaveBeenCalled();
        disconnect();
        expect(loadTimer()).toMatchObject({
            remainingMs : 30_000,
            status      : 'paused',
        });
    });

    it('saves an unrounded fractional-millisecond remainder at route interruption', () => {
        const controller = createController();
        const disconnect = controller.connect();
        const durationMs = 1.500_001 * minute;
        controller.startTimer(durationMs);
        now = 1_234.125;
        disconnect();
        expect(controller.getSnapshot().remainingMs).toBe(durationMs - now);
        expect(loadTimer()).toMatchObject({
            initialDurationMs : durationMs,
            remainingMs       : durationMs - now,
            status            : 'paused',
        });
        expect(createController().getSnapshot().remainingMs).toBe(durationMs - now);
    });

    it('pauses and saves on pagehide, hidden visibility, and route cleanup', () => {
        const controller = createController();
        const disconnect = controller.connect();
        controller.startTimer(30 * minute);
        now = minute;
        window.dispatchEvent(new Event('pagehide'));
        expect(audio.stop).toHaveBeenLastCalledWith(true);
        expect(loadTimer()).toMatchObject({
            remainingMs : 29 * minute,
            status      : 'paused',
        });

        controller.resume();
        now = 2 * minute;
        vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
        document.dispatchEvent(new Event('visibilitychange'));
        expect(loadTimer()).toMatchObject({
            remainingMs : 28 * minute,
            status      : 'paused',
        });

        controller.resume();
        now = 3 * minute;
        disconnect();
        expect(loadTimer()).toMatchObject({
            remainingMs : 27 * minute,
            status      : 'paused',
        });
        expect(audio.stop).toHaveBeenCalledTimes(4);
    });

    it('surfaces invalid or unavailable storage without blocking completion', () => {
        localStorage.setItem(TIMER_STORAGE_KEY, '{"remainingMs":1}');
        const controller = createController();
        expect(controller.getSnapshot().storageError).toBe(true);
        expect(onError).toHaveBeenCalledTimes(1);
        controller.startTimer(5 * minute);
        expect(controller.getSnapshot().storageError).toBe(false);

        vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
            throw new Error('Storage unavailable');
        });
        now = 5 * minute;
        controller.tick();
        expect(controller.getSnapshot()).toMatchObject({
            timeUp       : true,
            storageError : true,
        });
        expect(audio.play).toHaveBeenCalledExactlyOnceWith('bedside-clock-alarm');
    });

    it('reports malformed recovery data without exposing its contents', () => {
        localStorage.setItem(TIMER_STORAGE_KEY, '{"title":"private task');
        const controller = createController();
        expect(controller.getSnapshot().storageError).toBe(true);
        expect(onError).toHaveBeenCalledWith(expect.objectContaining({
            message : 'Saved timer data is invalid.',
        }));
    });

    it('reports current audio failures but ignores failures from superseded actions', async () => {
        let rejectOld : (error : Error) => void = () => {};
        audio.play.mockImplementationOnce(() => new Promise((_resolve, reject) => {
            rejectOld = reject;
        }));
        const controller = createController();
        controller.startTimer(5 * minute);
        now = 5 * minute;
        controller.tick();
        controller.reset();
        rejectOld(new Error('Old failure'));
        await Promise.resolve();
        expect(controller.getSnapshot().audioError).toBe(false);
        expect(onError).not.toHaveBeenCalled();

        audio.play.mockRejectedValueOnce(new Error('Audio unavailable'));
        controller.startTimer(5 * minute);
        now += 5 * minute;
        controller.tick();
        await Promise.resolve();
        expect(controller.getSnapshot().audioError).toBe(true);
        expect(onError).toHaveBeenCalledWith(expect.objectContaining({
            message : 'Audio unavailable',
        }));
    });
});
