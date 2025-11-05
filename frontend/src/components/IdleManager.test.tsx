import { MemoryRouter, Route, Routes, } from 'react-router';
import { act, render, } from '@testing-library/react';

import { TIMEOUT_IDLE, } from '../constants';
import { IdleManager, } from './IdleManager';

vi.useFakeTimers();

const setup = (initialPath = '/dashboard/weather') => {
    window.history.pushState({}, '', `#${initialPath}`);

    const { getByText, } = render(
        <MemoryRouter initialEntries={[
            initialPath,
        ]}>
            <Routes>
                <Route element={<IdleManager />}>
                    <Route
                        path='/dashboard/weather'
                        element={
                            <div>Weather</div>
                        } />
                    <Route
                        path='/clock'
                        element={
                            <div>Clock</div>
                        } />
                </Route>
            </Routes>
        </MemoryRouter>
    );

    return { getByText, };
};

describe('<IdleManager />', () => {
    afterEach(() => {
        vi.clearAllTimers();
    });

    it('navigates to /clock after idle timeout', () => {
        const { getByText, } = setup('/dashboard/weather');
        expect(getByText('Weather')).toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(TIMEOUT_IDLE + 1);
        });

        expect(getByText('Clock')).toBeInTheDocument();
    });

    it('returns to last screen after activity on /clock', () => {
        const { getByText, } = setup('/dashboard/weather');

        act(() => {
            vi.advanceTimersByTime(TIMEOUT_IDLE + 1);
        });
        expect(getByText('Clock')).toBeInTheDocument();

        act(() => {
            window.dispatchEvent(new Event('click'));
        });

        expect(getByText('Weather')).toBeInTheDocument();
    });

    it('resets timer on user activity', () => {
        const { getByText, } = setup('/dashboard/weather');

        act(() => {
            window.dispatchEvent(new Event('mousemove'));
            vi.advanceTimersByTime(TIMEOUT_IDLE / 2);
            window.dispatchEvent(new Event('click'));
            vi.advanceTimersByTime(TIMEOUT_IDLE / 2);
        });

        expect(getByText('Weather')).toBeInTheDocument();
    });
});
