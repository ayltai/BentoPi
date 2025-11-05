import { configureStore, type Store, } from '@reduxjs/toolkit';
import { render, } from '@testing-library/react';
import type { ReactNode, } from 'react';
import { Provider, } from 'react-redux';
import { MemoryRouter, } from 'react-router';

import { newsService, sensorService, tflService, unsplashService, weatherService, } from '../apis';

export const createStore = (preloadedState? : unknown) => configureStore({
    preloadedState,
    reducer    : {
        [ newsService.reducerPath     ] : newsService.reducer,
        [ sensorService.reducerPath   ] : sensorService.reducer,
        [ tflService.reducerPath      ] : tflService.reducer,
        [ unsplashService.reducerPath ] : unsplashService.reducer,
        [ weatherService.reducerPath  ] : weatherService.reducer,
    },
    middleware : (getDefaultMiddleware) => getDefaultMiddleware().concat(newsService.middleware, sensorService.middleware, tflService.middleware, unsplashService.middleware, weatherService.middleware),
});

export const defaultStore = createStore();

export type RootState = ReturnType<typeof defaultStore.getState>;

const customRender = (ui : any, {
    preloadedState,
    store = createStore(preloadedState),
    ...rest
} : {
    preloadedState? : Record<string, any>,
    store?          : Store<RootState>,
    [ key : string] : any,
} = {}) => render(ui, {
    wrapper : ({
        children,
    } : {
        children : ReactNode,
    }) => (
        <Provider store={store}>
            <MemoryRouter>
                {children}
            </MemoryRouter>
        </Provider>
    ),
    ...rest,
});

export * from '@testing-library/react';

export { customRender as render, };
