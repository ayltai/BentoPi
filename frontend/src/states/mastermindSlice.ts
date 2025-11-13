import { createSlice, type PayloadAction, } from '@reduxjs/toolkit';

const COLOUR_COUNT : number = 6;

export const PEG_COUNT : number = 4;

export const PALETTE : string[] = [
    '#d32f2f',
    '#5d4037',
    '#fbc02d',
    '#388e3c',
    '#303f9f',
    '#7b1fa2',
    '#009688',
    '#f57c00',
].slice(0, COLOUR_COUNT);

type Feedback = {
    correct   : number,
    misplaced : number,
};

export type GuessResult = {
    pegs     : number[],
    feedback : Feedback,
};

const generateSecret = () => {
    const colours = Array.from({
        length : COLOUR_COUNT,
    }, (_, i) => i);

    const secret : number[] = [];

    for (let i = 0; i < PEG_COUNT; i++) {
        const index = Math.floor(Math.random() * colours.length);
        secret.push(colours[index]);

        colours.splice(index, 1);
    }

    return secret;
};

const evaluate = (guess : number[], secretArray : number[]) : Feedback => {
    const secretCopy = [
        ...secretArray,
    ];

    const guessCopy  = [
        ...guess,
    ];

    let correct   : number = 0;
    let misplaced : number = 0;

    guessCopy.forEach((value, i) => {
        if (value === secretCopy[i]) {
            correct++;

            secretCopy[i] = guessCopy[i] = -1;
        }
    });

    guessCopy.forEach(value => {
        if (value === -1) return;

        const index = secretCopy.indexOf(value);
        if (index !== -1) {
            misplaced++;

            secretCopy[index] = -1;
        }
    });

    return {
        correct,
        misplaced,
    };
};

export type MastermindState = {
    secret  : number[],
    guesses : GuessResult[],
    current : (number | null)[],
};

const initialState : MastermindState = {
    secret  : generateSecret(),
    guesses : [],
    current : Array(PEG_COUNT).fill(null),
};

export const mastermindSlice = createSlice({
    name    : 'mastermind',
    initialState,
    reducers : {
        reset      : () => ({
            ...initialState,
        }),
        pickColour : (state, action : PayloadAction<number>) => {
            const firstEmpty = state.current.indexOf(null);
            if (firstEmpty === -1) return state;

            const newCurrent = [
                ...state.current,
            ];

            newCurrent[firstEmpty] = action.payload;

            return {
                ...state,
                current : newCurrent,
            };
        },
        cyclePeg   : (state, action : PayloadAction<number>) => {
            const index = action.payload;
            if (state.current[index] !== null) {
                const newCurrent = [
                    ...state.current,
                ];

                newCurrent[index] = (newCurrent[index]! + 1) % COLOUR_COUNT;

                return {
                    ...state,
                    current : newCurrent,
                };
            }
        },
        makeGuess  : state => {
            if (state.current.includes(null)) return state;

            const guess = state.current as number[];

            const feedback = evaluate(guess, state.secret);

            const newGuesses = [
                ...state.guesses,
                {
                    pegs     : [
                        ...guess,
                    ],
                    feedback,
                },
            ];

            return {
                ...state,
                guesses : newGuesses,
                current : Array(PEG_COUNT).fill(null),
            };
        },
        setCurrent : (state, action : PayloadAction<(number | null)[]>) => ({
            ...state,
            current : action.payload,
        }),
    },
});

export const { cyclePeg, makeGuess, pickColour, reset, setCurrent, } = mastermindSlice.actions;

export const mastermindReducer = mastermindSlice.reducer;
