import { render, } from '@testing-library/react';
import { describe, expect, it, } from 'vitest';

import { formatRemaining, Timer, } from './Timer';

describe('timer dial', () => {
    it('uses the reference countdown formatting and rounds up partial seconds', () => {
        expect(formatRemaining(0, 'en-GB')).toBe('0:00');
        expect(formatRemaining(1, 'en-GB')).toBe('0:01');
        expect(formatRemaining(9 * 60_000 + 59_000, 'en-GB')).toBe('9:59');
        expect(formatRemaining(10 * 60_000, 'en-GB')).toBe('10:00');
        expect(formatRemaining(30 * 60_000, 'en-GB')).toBe('30:00');
        expect(formatRemaining(60 * 60_000, 'en-GB')).toBe('1:00:00');
        expect(formatRemaining(61 * 60_000 + 1_000, 'en-GB')).toBe('1:01:01');
    });

    it('exposes native elapsed progress and pulses only while running in the last minute', () => {
        const view = render(
            <Timer
                initialDurationMs={120_000}
                remainingDurationMs={60_000}
                isRunning
                locale='en-GB' />
        );
        expect(view.getByRole('progressbar')).toHaveAttribute('value', '50');
        expect(view.getByRole('progressbar')).toHaveAttribute('max', '100');
        expect(view.getByText('1:00')).toHaveClass('timer-pulse');
        expect(view.getByText('1:00').parentElement).toHaveAttribute('aria-hidden', 'true');

        view.rerender(
            <Timer
                initialDurationMs={120_000}
                remainingDurationMs={60_000}
                isRunning={false}
                locale='en-GB' />
        );
        expect(view.getByText('1:00')).not.toHaveClass('timer-pulse');
    });
});
