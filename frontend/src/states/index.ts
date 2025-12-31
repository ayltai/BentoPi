import { combineReducers, configureStore, } from '@reduxjs/toolkit';
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE, } from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

import { newsService, systemService, tflService, espartanThermoService, unsplashService, weatherService, } from '../apis';
import { hangmanReducer, } from './hangmanSlice';
import { mastermindReducer, } from './mastermindSlice';
import { memoryReducer, } from './memorySlice';

const createNoopStorage = () => ({
    getItem    : () => Promise.resolve(null),
    setItem    : (_ : string, value : any) => Promise.resolve(value),
    removeItem : () => Promise.resolve(),
});

const storage = typeof window !== 'undefined' ? createWebStorage('local') : createNoopStorage();

const makeStore = () => configureStore({
    reducer    : persistReducer({
        key       : 'root',
        storage,
        blacklist : [
            newsService.reducerPath,
            systemService.reducerPath,
            tflService.reducerPath,
            espartanThermoService.reducerPath,
            unsplashService.reducerPath,
            weatherService.reducerPath,
        ],
    }, combineReducers({
        hangman                               : hangmanReducer,
        mastermind                            : mastermindReducer,
        memory                                : memoryReducer,
        [ espartanThermoService.reducerPath ] : espartanThermoService.reducer,
        [ newsService.reducerPath           ] : newsService.reducer,
        [ systemService.reducerPath         ] : systemService.reducer,
        [ tflService.reducerPath            ] : tflService.reducer,
        [ unsplashService.reducerPath       ] : unsplashService.reducer,
        [ weatherService.reducerPath        ] : weatherService.reducer,
    })),
    middleware : getDefaultMiddleware => getDefaultMiddleware({
        serializableCheck : {
            ignoredActions : [
                FLUSH,
                PAUSE,
                PERSIST,
                PURGE,
                REGISTER,
                REHYDRATE,
            ],
        },
    }).concat(newsService.middleware, systemService.middleware, tflService.middleware, espartanThermoService.middleware, unsplashService.middleware, weatherService.middleware),
    devTools  : import.meta.env.DEV,
});

export const store = makeStore();

export const persistor = persistStore(store);

export type AppState    = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
