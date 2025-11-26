import { configureStore, type Store, } from '@reduxjs/toolkit';
import { render, } from '@testing-library/react';
import type { ReactNode, } from 'react';
import { Provider, } from 'react-redux';
import { MemoryRouter, } from 'react-router';

import { newsService, sensorService, systemService, tflService, thermohiveService, unsplashService, weatherService, } from '../apis';
import { hangmanReducer, } from '../states/hangmanSlice';
import { mastermindReducer, } from '../states/mastermindSlice';
import { memoryReducer, } from '../states/memorySlice';

export const createStore = (preloadedState? : unknown) => configureStore({
    preloadedState,
    reducer    : {
        hangman                           : hangmanReducer,
        mastermind                        : mastermindReducer,
        memory                            : memoryReducer,
        [ newsService.reducerPath       ] : newsService.reducer,
        [ sensorService.reducerPath     ] : sensorService.reducer,
        [ systemService.reducerPath     ] : systemService.reducer,
        [ tflService.reducerPath        ] : tflService.reducer,
        [ thermohiveService.reducerPath ] : thermohiveService.reducer,
        [ unsplashService.reducerPath   ] : unsplashService.reducer,
        [ weatherService.reducerPath    ] : weatherService.reducer,
    },
    middleware : getDefaultMiddleware => getDefaultMiddleware().concat(newsService.middleware, sensorService.middleware, systemService.middleware, tflService.middleware, thermohiveService.middleware, unsplashService.middleware, weatherService.middleware),
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
