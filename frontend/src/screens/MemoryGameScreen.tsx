import { Button, Col, Row, Typography, } from 'antd';
import { useCallback, useEffect, useMemo, useState, } from 'react';
import { useTranslation, } from 'react-i18next';

import './MemoryGameScreen.css';

const ROWS : number                          = 3;
const COLS : 1 | 2 | 3 | 4 | 6 | 8 | 12 | 24 = 4;

const FACES : string[] = [
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

type MemoryCard = {
    id     : string,
    face   : string,
    pairId : number,
};

const seededRandom = (seed : number) : () => number => {
    let value = seed % 2147483647;
    if (value <= 0) value += 2147483646;
    return () => (value = (value * 16807) % 2147483647) / 2147483647;
};

const shuffle = <T, >(array : T[], random : () => number) : T[] => {
    const result = [ ...array, ];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [ result[i], result[j], ] = [ result[j], result[i], ];
    }

    return result;
};

export const MemoryGameScreen = () => {
    const total = ROWS * COLS;
    const pairs = total / 2;

    const [ seed, setSeed, ] = useState<number>(() => Date.now());

    const random = useMemo(() => seededRandom(seed), [ seed, ]);

    const buildShuffledDeck = useCallback(() : MemoryCard[] => {
        const shuffledFaces : string[]     = shuffle(FACES, random);
        const selectedFaces : string[]     = shuffledFaces.slice(0, pairs);
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

        return shuffle(shuffledDeck, random);
    }, [ pairs, random, ]);

    const [ deck,         setDeck,         ] = useState<MemoryCard[]>(buildShuffledDeck);
    const [ flippedCards, setFlippedCards, ] = useState<number[]>([]);
    const [ matchedPairs, setMatchedPairs, ] = useState<Set<number>>(new Set());

    const { t, } = useTranslation();

    const restart = useCallback(() => {
        setSeed(Date.now());
        setDeck(buildShuffledDeck());
        setFlippedCards([]);
        setMatchedPairs(new Set());
    }, [ buildShuffledDeck, ]);

    const handleCardClick = (index : number) => {
        if (flippedCards.includes(index) || flippedCards.length === 2) return;

        const card = deck[index];
        if (matchedPairs.has(card.pairId)) return;

        setFlippedCards([
            ...flippedCards,
            index,
        ]);
    };

    useEffect(() => {
        if (flippedCards.length === 2) {
            let timeout;

            const [ i, j, ] = flippedCards;

            if (deck[i].pairId === deck[j].pairId) {
                timeout = setTimeout(() => {
                    setMatchedPairs(previous => new Set([
                        ...previous,
                        deck[i].pairId,
                    ]));

                    setFlippedCards([]);
                }, 300);
            } else {
                timeout = setTimeout(() => {
                    setFlippedCards([]);
                }, 1000);
            }

            return () => clearTimeout(timeout);
        }
    }, [ flippedCards, deck, ]);

    useEffect(() => {
        let timeout = null;

        if (matchedPairs.size === pairs) timeout = setTimeout(() => restart(), 2000);

        return () => {
            if (timeout) clearTimeout(timeout);
        };
    }, [ matchedPairs, pairs, restart, ]);

    return (
        <>
            {Array(ROWS).fill(0).map((_row, rowIndex) => (
                <Row
                    key={rowIndex}
                    style={{
                        margin : 8,
                    }}
                    gutter={[
                        8,
                        8,
                    ]}
                    align='middle'
                    justify='space-around'>
                    {Array(COLS).fill(0).map((_col, colIndex) => {
                        const cardIndex = rowIndex * COLS + colIndex;
                        const card      = deck[cardIndex];

                        if (!card) return null;

                        const isFlipped = flippedCards.includes(cardIndex) || matchedPairs.has(card.pairId);

                        const handleClick = () => handleCardClick(cardIndex);

                        return (
                            <Col
                                key={colIndex}
                                style={{
                                    display        : 'flex',
                                    justifyContent : 'center',
                                }}
                                span={24 / COLS}>
                                <div
                                    className={`card-inner ${isFlipped ? 'flipped' : ''}`}
                                    onClick={handleClick}>
                                    <div className='card-back'>
                                        <Typography.Title style={{
                                            margin : 0,
                                        }}>
                                            ?
                                        </Typography.Title>
                                    </div>
                                    <div
                                        style={{
                                            backgroundColor : matchedPairs.has(card.pairId) ? 'green' : undefined,
                                        }}
                                        className='card-front'>
                                        <img
                                            style={{
                                                width     : 64,
                                                height    : 64,
                                                objectFit : 'contain',
                                            }}
                                            alt='card'
                                            src={card.face} />
                                    </div>
                                </div>
                            </Col>
                        );
                    })}
                </Row>
            ))}
            <Row>
                <Col
                    style={{
                        textAlign : 'center',
                    }}
                    span={24}>
                    <Button
                        size='small'
                        onClick={restart}>
                        <Typography.Text style={{
                            fontSize : '0.85em',
                        }}>
                            {t('action_restart')}
                        </Typography.Text>
                    </Button>
                </Col>
            </Row>
        </>
    );
};
