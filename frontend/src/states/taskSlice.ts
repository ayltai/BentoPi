import { createSlice, type PayloadAction, } from '@reduxjs/toolkit';

import type { Task, } from '../models';

type TaskSlice = {
    tasks : Task[],
};

const initialState : TaskSlice = {
    tasks : [],
};

export const taskSlice = createSlice({
    name     : 'tasks',
    initialState,
    reducers : {
        addTask   : (state, action : PayloadAction<Task>) => ({
            ...state,
            tasks : [
                ...state.tasks,
                action.payload,
            ],
        }),
        updateTask : (state, action : PayloadAction<Task>) => ({
            ...state,
            tasks : state.tasks.map(task => task.id === action.payload.id ? action.payload : task),
        }),
        removeTask : (state, action : PayloadAction<string>) => ({
            ...state,
            tasks : state.tasks.filter(task => task.id !== action.payload),
        }),
    },
});

export const { addTask, removeTask, updateTask, } = taskSlice.actions;

export const taskReducer = taskSlice.reducer;
