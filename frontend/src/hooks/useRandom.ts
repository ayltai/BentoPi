import { useMemo, useState, } from 'react';

const seededRandom = (seed : number) : () => number => {
    let value = seed % 2147483647;
    if (value <= 0) value += 2147483646;
    return () => (value = (value * 16807) % 2147483647) / 2147483647;
};

export const useRandom = () : [ () => number, (seed : number) => void, ] => {
    const [ seed, setSeed, ] = useState<number>(() => Date.now());

    const random = useMemo(() => seededRandom(seed), [ seed, ]);

    return [ random, setSeed, ];
};
