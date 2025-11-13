import { createSlice, type PayloadAction, } from '@reduxjs/toolkit';

export const MEANINGS : Record<string, string> = {
    apple     : 'A fruit that is typically red, green, or yellow.',
    banana    : 'A long, curved fruit with a yellow skin.',
    bicycle   : 'A vehicle with two wheels that you ride by pedaling.',
    circle    : 'A round shape with no corners or edges.',
    difficult : 'Not easy; requiring effort or skill to do or understand.',
    earth     : 'The planet we live on; the third planet from the sun.',
    eight     : 'The number that comes after seven and before nine.',
    famous    : 'Well-known by many people; celebrated.',
    february  : 'The second month of the year in the calendar.',
    heart     : 'A muscular organ that pumps blood through the body.',
    history   : 'The study of past events, particularly in human affairs.',
    important : 'Of great significance or value.',
    library   : 'A place where books are kept for reading or borrowing.',
    medicine  : 'A substance used to treat illness or injury.',
    ordinary  : 'With no special or distinctive features; normal.',
    perhaps   : 'Used to express uncertainty or possibility.',
    popular   : 'Liked or admired by many people.',
    potatoes  : 'A starchy vegetable that is often cooked and eaten as food.',
    probably  : 'Almost certainly; as far as one knows or can tell.',
    promise   : 'A declaration that one will do something.',
    quarter   : 'One of four equal parts of a whole.',
    regular   : 'Conforming to a standard; usual or normal.',
    remember  : 'To bring to mind or think of again.',
    special   : 'Different from what is usual.',
    strength  : 'The quality of being strong; power.',
    surprise  : 'An unexpected event, fact, or thing.',
};

const choose = (list : string[]) => list[Math.floor(Math.random() * list.length)];

const getRandomWord = () : string => choose(Object.keys(MEANINGS)).toUpperCase();

type HangmanSlice = {
    secret  : string,
    guessed : string[],
    attempt : number,
};

const initialState : HangmanSlice = {
    secret  : getRandomWord(),
    guessed : [],
    attempt : 0,
};

export const hangmanSlice = createSlice({
    name     : 'hangman',
    initialState,
    reducers : {
        reset     : () => ({
            ...initialState,
            secret : getRandomWord(),
        }),
        makeGuess : (state, action : PayloadAction<string>) => {
            const letter = action.payload.toUpperCase();

            if (state.guessed.includes(letter)) return;

            const newGuessed = [
                ...state.guessed,
                letter,
            ];

            return {
                ...state,
                guessed : newGuessed,
                attempt : !state.secret.includes(letter) ? state.attempt + 1 : state.attempt,
            };
        },
    },
});

export const { makeGuess, reset, } = hangmanSlice.actions;

export const hangmanReducer = hangmanSlice.reducer;
