import { render, } from '@testing-library/react';
import { StrictMode, } from 'react';
import { beforeEach, describe, expect, it, vi, } from 'vitest';

import { App, } from './App';

const mocks = vi.hoisted(() => ({
    createRouter : vi.fn(() => ({})),
    weather      : {
        data  : undefined as unknown,
        error : undefined as unknown,
    },
}));

vi.mock('react-router', async importOriginal => ({
    ...(await importOriginal<typeof import('react-router')>()),
    createHashRouter : mocks.createRouter,
}));

vi.mock('react-router/dom', () => ({
    RouterProvider : () => <div data-testid='router' />,
}));

vi.mock('./apis', async importOriginal => ({
    ...(await importOriginal<typeof import('./apis')>()),
    useGetWeatherQuery : () => mocks.weather,
}));

vi.mock('./components', async importOriginal => ({
    ...(await importOriginal<typeof import('./components')>()),
    AlertOverlay : () => null,
}));

beforeEach(() => {
    mocks.createRouter.mockClear();
    mocks.weather.data = undefined;
    mocks.weather.error = undefined;
});

describe('<App />', () => {
    it('keeps one router across Strict Mode renders and weather updates', () => {
        const view = render(<StrictMode><App /></StrictMode>);
        expect(mocks.createRouter).not.toHaveBeenCalled();
        mocks.weather.data = {
            minutely : [],
        };
        view.rerender(<StrictMode><App /></StrictMode>);
        expect(mocks.createRouter).not.toHaveBeenCalled();
    });
});
