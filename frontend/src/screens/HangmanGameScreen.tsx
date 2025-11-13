import { ReloadOutlined, } from '@ant-design/icons';
import { Button, Col, Modal, Progress, Row, Space, Typography, } from 'antd';
import { useCallback, useEffect, useMemo, useState, } from 'react';
import { useTranslation, } from 'react-i18next';

import { SCREEN_HEIGHT, SCREEN_WIDTH, TOP_BAR_HEIGHT, } from '../constants';
import { useRandom, } from '../hooks';

const MAX_WRONG : number = 6;

const MEANINGS : Record<string, string> = {
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

type Result = 'win' | 'lose' | null;

const HangmanSVG = ({
    step,
} : {
    step : number,
}) => {
    const parts = [];

    parts.push(
        <line
            key='base'
            x1='10'
            y1='190'
            x2='150'
            y2='190'
            stroke='#999'
            strokeWidth='8' />
    );

    parts.push(
        <line
            key='pole'
            x1='40'
            y1='190'
            x2='40'
            y2='20'
            stroke='#999'
            strokeWidth='4' />
    );

    parts.push(
        <line
            key='beam'
            x1='40'
            y1='20'
            x2='110'
            y2='20'
            stroke='#999'
            strokeWidth='4' />
    );

    parts.push(
        <line
            key='rope'
            x1='110'
            y1='20'
            x2='110'
            y2='45'
            stroke='#999'
            strokeWidth='2' />
    );

    // head
    if (step > 0) parts.push(
        <circle
            key='head'
            cx='110'
            cy='65'
            r='18'
            stroke='#eee'
            strokeWidth='3'
            fill='none' />
    );

    // body
    if (step > 1) parts.push(
        <line
            key='body'
            x1='110'
            y1='83'
            x2='110'
            y2='130'
            stroke='#eee'
            strokeWidth='3' />
    );

    // left arm
    if (step > 2) parts.push(
        <line
            key='larm'
            x1='110'
            y1='95'
            x2='90'
            y2='110'
            stroke='#eee'
            strokeWidth='3' />
    );

    // right arm
    if (step > 3) parts.push(
        <line
            key='rarm'
            x1='110'
            y1='95'
            x2='130'
            y2='110'
            stroke='#eee'
            strokeWidth='3' />
    );

    // left leg
    if (step > 4) parts.push(
        <line
            key='lleg'
            x1='110'
            y1='130'
            x2='95'
            y2='165'
            stroke='#eee'
            strokeWidth='3' />
    );

    // right leg
    if (step > 5) parts.push(
        <line
            key='rleg'
            x1='110'
            y1='130'
            x2='125'
            y2='165'
            stroke='#eee'
            strokeWidth='3' />
    );

    return (
        <svg
            viewBox='0 0 200 200'
            width='100%'
            height='100%'
            preserveAspectRatio='xMidYMid meet'>
            {parts}
        </svg>
    );
};

export const HangmanGameScreen = () => {
    const [ random, ] = useRandom();

    const choose = (list : string[]) => list[Math.floor(random() * list.length)];

    const [ secret,     setSecret,     ] = useState<string>(choose(Object.keys(MEANINGS)));
    const [ guessed,    setGuessed,    ] = useState<Set<string>>(new Set());
    const [ wrongCount, setWrongCount, ] = useState<number>(0);
    const [ showModal,  setShowModal,  ] = useState<boolean>(false);
    const [ gameResult, setGameResult, ] = useState<Result>(null);

    const letters = useMemo(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), []);

    const normalizedSecret = secret.toUpperCase();

    const remaining = useMemo(() => Math.max(0, MAX_WRONG - wrongCount), [ wrongCount, ]);

    const resetGame = () => {
        setSecret(choose(Object.keys(MEANINGS)));
        setGuessed(new Set());
        setWrongCount(0);
        setShowModal(false);
        setGameResult(null);
    };

    const finishGame = useCallback((result : Result) => {
        setGameResult(result);
        setShowModal(true);
    }, []);

    const onLetterPress = (letter : string) => {
        if (gameResult) return;

        setGuessed(prev => {
            const next = new Set(prev);
            if (next.has(letter)) return next;

            next.add(letter);

            return next;
        });

        if (!normalizedSecret.includes(letter)) setWrongCount(count => count + 1);
    };

    const { t, } = useTranslation();

    useEffect(() => {
        let timeout = null;

        const allRevealed = normalizedSecret.split('').every(char => guessed.has(char));
        if (allRevealed) {
            timeout = setTimeout(() => finishGame('win'), 0);
        } else if (wrongCount >= MAX_WRONG) {
            timeout = setTimeout(() => finishGame('lose'), 0);
        }

        return () => {
            if (timeout) clearTimeout(timeout);
        };
    }, [ guessed, wrongCount, finishGame, normalizedSecret, ]);

    return (
        <div style={{
            width         : SCREEN_WIDTH,
            height        : SCREEN_HEIGHT - TOP_BAR_HEIGHT,
            paddingLeft   : 8,
            paddingRight  : 8,
            paddingBottom : 8,
            boxSizing     : 'border-box',
            overflow      : 'hidden',
        }}>
            <Row
                style={{
                    height : '100%',
                }}
                gutter={8}>
                <Col
                    style={{
                        display       : 'flex',
                        flexDirection : 'column',
                    }}
                    span={10}>
                    <HangmanSVG step={Math.min(wrongCount, MAX_WRONG)} />
                    <div style={{
                        paddingLeft   : 8,
                        paddingRight  : 8,
                        paddingTop    : 0,
                        paddingBottom : 8,
                    }}>
                        <Space
                            style={{
                                width : '100%',
                            }}
                            direction='vertical'>
                            <Progress
                                strokeColor={{
                                    '0%'   : 'green',
                                    '50%'  : 'orange',
                                    '100%' : 'red',
                                }}
                                percent={Math.round((wrongCount / MAX_WRONG) * 100)}
                                showInfo={false} />
                        </Space>
                    </div>
                    <div style={{
                        flex           : '1 1 auto',
                        display        : 'flex',
                        alignItems     : 'center',
                        justifyContent : 'center',
                    }}>
                        <Button
                            size='middle'
                            icon={<ReloadOutlined />}
                            onClick={resetGame}>
                            <Typography.Text style={{
                                fontSize : '0.85em',
                            }}>
                                {t('action_restart')}
                            </Typography.Text>
                        </Button>
                    </div>
                </Col>
                <Col span={14}>
                    <div style={{
                        flex           : '0 0 36%',
                        display        : 'flex',
                        flexDirection  : 'column',
                        justifyContent : 'center',
                    }}>
                        <div style={{
                            display        : 'flex',
                            flexDirection  : 'column',
                            alignItems     : 'center',
                            justifyContent : 'center',
                            textAlign      : 'center',
                            padding        : '8px 0',
                        }}>
                            <Typography.Text style={{
                                marginBottom : 8,
                                fontSize     : '0.85em',
                            }}>
                                {MEANINGS[secret]}
                            </Typography.Text>
                            <div
                                aria-hidden
                                style={{
                                    letterSpacing : 6,
                                    fontSize      : 24,
                                    textAlign     : 'center',
                                    userSelect    : 'none',
                                }}>
                                {normalizedSecret.split('').map((letter, index) => (
                                    <span key={`${letter}-${index}`}>
                                        {guessed.has(letter) ? letter : '_'}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div style={{
                        flex     : '1 1 auto',
                        overflow : 'hidden',
                        padding  : 4,
                    }}>
                        <div style={{
                            display        : 'flex',
                            flexWrap       : 'wrap',
                            justifyContent : 'center',
                            alignContent   : 'flex-start',
                            gap            : 4,
                            paddingTop     : 4,
                        }}>
                            {letters.map((letter, index) => {
                                const disabled = guessed.has(letter) || !!gameResult || remaining === 0;
                                const correct  = guessed.has(letter) && normalizedSecret.includes(letter);
                                const incorrect= guessed.has(letter) && !normalizedSecret.includes(letter);

                                return (
                                    <Button
                                        key={`${letter}-${index}`}
                                        style={{
                                            minWidth        : 29,
                                            minHeight       : 32,
                                            margin          : 2,
                                            fontWeight      : 600,
                                            backgroundColor : correct ? '#004d4088' : incorrect ? '#bf360c44' : undefined,
                                            touchAction     : 'manipulation',
                                        }}
                                        aria-pressed={guessed.has(letter)}
                                        size='small'
                                        disabled={disabled}
                                        onClick={() => onLetterPress(letter)}>
                                        {letter}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                </Col>
            </Row>
            <Modal
                style={{
                    textAlign : 'center',
                }}
                width='80%'
                centered
                closable={false}
                open={showModal}
                footer={null}>
                {gameResult === 'win' ? (
                    <>
                        <Typography.Title level={4}>
                            {t('result_won')}
                        </Typography.Title>
                        <Typography.Text>
                            {t('result_secret')}
                            <Typography.Text strong>{secret}</Typography.Text>
                        </Typography.Text>
                    </>
                ) : (
                    <>
                        <Typography.Title level={4}>
                            {t('result_lost')}
                        </Typography.Title>
                        <Typography.Text>
                            {t('result_secret')}
                            <Typography.Text strong>{secret}</Typography.Text>
                        </Typography.Text>
                    </>
                )}
                <div style={{
                    marginTop : 32,
                }}>
                    <Button
                        type='primary'
                        onClick={() => {
                            resetGame();
                            setShowModal(false);
                        }}>
                        {t('action_restart')}
                    </Button>
                </div>
            </Modal>
        </div>
    );
};
