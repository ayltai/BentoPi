import { ReloadOutlined, } from '@ant-design/icons';
import { Button, Col, Row, Typography, } from 'antd';
import { useCallback, useEffect, } from 'react';
import { useTranslation, } from 'react-i18next';

import { useAppDispatch, useAppSelector, } from '../hooks';
import { addMatchedPair, COLS, type MemoryCard, reset, setFlippedCards, } from '../states/memorySlice';
import './MemoryGameScreen.css';

export const MemoryGameScreen = () => {
    const { deck, flippedCards, matchedPairs, } = useAppSelector(state => state.memory);

    const dispatch = useAppDispatch();

    const { t, } = useTranslation();

    const resetGame = useCallback(() => dispatch(reset()), [ dispatch, ]);

    const handleCardClick = (index : number) => {
        console.log(`flippedCards: ${flippedCards}`);
        if (flippedCards.includes(index) || flippedCards.length === 2) return;

        dispatch(setFlippedCards([
            ...flippedCards,
            index,
        ]));
    };

    useEffect(() => {
        if (flippedCards.length === 2) {
            const [ i, j, ] = flippedCards;

            if (deck[i].pairId === deck[j].pairId) setTimeout(() => dispatch(addMatchedPair(deck[i].pairId)), 750);

            const timeout = setTimeout(() => dispatch(setFlippedCards([])), 1250);

            return () => clearTimeout(timeout);
        }
    }, [ deck, flippedCards, dispatch, ]);

    useEffect(() => {
        if (matchedPairs.length === deck.length / 2) {
            const timeout = setTimeout(resetGame, 3000);

            return () => clearTimeout(timeout);
        }
    }, [ deck, matchedPairs, resetGame,]);

    return (
        <>
            <Row
                style={{
                    margin : 8,
                }}
                gutter={[
                    8,
                    8,
                ]}
                align='middle'
                justify='space-around'>
                {deck.map((card : MemoryCard, cardIndex : number) => {
                    const isFlipped = flippedCards.includes(cardIndex) || matchedPairs.includes(card.pairId);

                    const handleClick = () => handleCardClick(cardIndex);

                    return (
                        <Col
                            key={cardIndex}
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
                                        backgroundColor : matchedPairs.includes(card.pairId) ? 'green' : undefined,
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
            <Row>
                <Col
                    style={{
                        textAlign : 'center',
                    }}
                    span={24}>
                    <Button
                        size='small'
                        icon={<ReloadOutlined />}
                        onClick={resetGame}>
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
