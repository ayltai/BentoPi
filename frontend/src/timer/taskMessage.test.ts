import { describe, expect, it, } from 'vitest';

import { getTaskReply, isTaskTimerMessage, isValidTimerMinutes, } from './taskMessage';

describe('task timer messages', () => {
    it('accepts legacy fractional durations without rounding or a seven-day cap', () => {
        expect(isTaskTimerMessage({
            title     : 'Older task',
            timeLimit : 1.500_001,
        })).toBe(true);
        expect(isValidTimerMinutes(30 * 24 * 60)).toBe(true);
        expect(isValidTimerMinutes(Number.MAX_SAFE_INTEGER / 60_000)).toBe(true);
    });

    it('rejects empty titles and invalid, non-finite, or unrepresentable durations', () => {
        for (const duration of [
            0,
            -1,
            Number.NaN,
            Number.POSITIVE_INFINITY,
            Number.MAX_SAFE_INTEGER,
            '30',
        ]) expect(isValidTimerMinutes(duration)).toBe(false);

        expect(isTaskTimerMessage({
            title     : ' ',
            timeLimit : 30,
        })).toBe(false);
    });

    it('requires both nonempty reply identifiers', () => {
        expect(getTaskReply({
            replyTo   : 'tasks-123',
            requestId : 'request-456',
        })).toEqual({
            replyTo   : 'tasks-123',
            requestId : 'request-456',
        });
        expect(getTaskReply({
            replyTo : 'tasks-123',
        })).toBeNull();
        expect(getTaskReply({
            replyTo   : ' ',
            requestId : 'request-456',
        })).toBeNull();
    });
});
