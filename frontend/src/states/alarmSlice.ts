import { createSlice, type PayloadAction, } from '@reduxjs/toolkit';

import { ALARM_TRACKS, } from '../constants';

type AlarmSlice = {
    track : string,
};

const initialState : AlarmSlice = {
    track : ALARM_TRACKS[0],
};

export const alarmSlice = createSlice({
    name     : 'alarm',
    initialState,
    reducers : {
        setTrack : (state, action : PayloadAction<string>) => ({
            ...state,
            track : action.payload,
        }),
    },
});

export const { setTrack, } = alarmSlice.actions;

export const alarmReducer = alarmSlice.reducer;

