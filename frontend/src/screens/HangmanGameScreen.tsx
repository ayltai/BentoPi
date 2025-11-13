import { ReloadOutlined, } from '@ant-design/icons';
import { Button, Col, Modal, Progress, Row, Space, Typography, } from 'antd';
import { useCallback, useMemo, } from 'react';
import { useTranslation, } from 'react-i18next';

import { SCREEN_HEIGHT, SCREEN_WIDTH, TOP_BAR_HEIGHT, } from '../constants';
import { useAppDispatch, useAppSelector, } from '../hooks';
import { makeGuess, MEANINGS, reset, } from '../states/hangmanSlice';

const MAX_WRONG : number = 6;

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
    const { secret, guessed, attempt, } = useAppSelector(state => state.hangman);

    const dispatch = useAppDispatch();

    const letters = useMemo(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), []);

    const remaining = useMemo(() => Math.max(0, MAX_WRONG - attempt), [ attempt, ]);

    const evaluate = useCallback(() => secret.split('').every((char : string) => guessed.includes(char)), [ guessed, secret, ]);

    const handleReset = () => dispatch(reset());

    const gameResult = useMemo(() => {
        if (evaluate()) return 'win';

        if (attempt >= MAX_WRONG) return 'lose';

        return null;
    }, [ attempt, evaluate, ]);

    const onLetterPress = (letter : string) => {
        if (gameResult) return;

        dispatch(makeGuess(letter));
    };

    const { t, } = useTranslation();

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
                    <HangmanSVG step={Math.min(attempt, MAX_WRONG)} />
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
                                percent={Math.round((attempt / MAX_WRONG) * 100)}
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
                            onClick={handleReset}>
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
                                {MEANINGS[secret.toLowerCase()]}
                            </Typography.Text>
                            <div
                                aria-hidden
                                style={{
                                    letterSpacing : 6,
                                    fontSize      : 24,
                                    textAlign     : 'center',
                                    userSelect    : 'none',
                                }}>
                                {secret.split('').map((letter : string, index : number) => (
                                    <span key={`${letter}-${index}`}>
                                        {guessed.includes(letter) ? letter : '_'}
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
                                const disabled = guessed.includes(letter) || !!gameResult || remaining === 0;
                                const correct  = guessed.includes(letter) && secret.includes(letter);
                                const incorrect= guessed.includes(letter) && !secret.includes(letter);

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
                                        aria-pressed={guessed.includes(letter)}
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
                open={gameResult !== null}
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
                        onClick={handleReset}>
                        {t('action_restart')}
                    </Button>
                </div>
            </Modal>
        </div>
    );
};
