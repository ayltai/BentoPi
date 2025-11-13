import { createSlice, type PayloadAction, } from '@reduxjs/toolkit';

export const FACES : string[] = [
    'images/card-brainrot-01.webp',
    'images/card-brainrot-02.webp',
    'images/card-brainrot-03.webp',
    'images/card-brainrot-04.webp',
    'images/card-brainrot-05.webp',
    'images/card-brainrot-06.webp',
    'images/card-brainrot-07.png',
    'images/card-brainrot-08.webp',
    'images/card-brainrot-09.png',
    'images/card-brainrot-10.webp',
    'images/card-brainrot-11.webp',
    'images/card-brainrot-12.webp',
    'images/card-brainrot-13.webp',
    'images/card-brainrot-14.webp',
];

export const ROWS : number                          = 3;
export const COLS : 1 | 2 | 3 | 4 | 6 | 8 | 12 | 24 = 4;

export type MemoryCard = {
    id     : string,
    face   : string,
    pairId : number,
};

type MemoryState = {
    deck         : MemoryCard[],
    flippedCards : number[],
    matchedPairs : number[],
};

const shuffle = <T, >(array : T[]) : T[] => {
    const result = [ ...array, ];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ result[i], result[j], ] = [ result[j], result[i], ];
    }

    return result;
};

const buildShuffledDeck = () => {
    const shuffledFaces : string[]     = shuffle(FACES);
    const selectedFaces : string[]     = shuffledFaces.slice(0, ROWS * COLS / 2);
    const shuffledDeck  : MemoryCard[] = [];

    selectedFaces.forEach((face, index) => {
        shuffledDeck.push({
            id     : `${index}-a`,
            face,
            pairId : index,
        });

        shuffledDeck.push({
            id     : `${index}-b`,
            face,
            pairId : index,
        });
    });

    return shuffle(shuffledDeck);
};

const initialState : MemoryState = {
    deck         : buildShuffledDeck(),
    flippedCards : [],
    matchedPairs : [],
};

export const memorySlice = createSlice({
    name    : 'memory',
    initialState,
    reducers : {
        reset           : () => ({
            ...initialState,
            deck : buildShuffledDeck(),
        }),
        setFlippedCards : (state, action : PayloadAction<number[]>) => ({
            ...state,
            flippedCards : action.payload,
        }),
        addMatchedPair  : (state, action : PayloadAction<number>) => ({
            ...state,
            matchedPairs : [
                ...state.matchedPairs,
                action.payload,
            ],
        }),
    },
});

export const { addMatchedPair, reset, setFlippedCards, } = memorySlice.actions;

export const memoryReducer = memorySlice.reducer;
