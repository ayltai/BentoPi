import { ClearOutlined, QuestionOutlined, ReloadOutlined, } from '@ant-design/icons';
import { Button, Col, Flex, Modal, Row, Space, Typography, } from 'antd';
import { useCallback, } from 'react';
import { useTranslation, } from 'react-i18next';

import { useAppDispatch, useAppSelector, } from '../hooks';
import { cyclePeg, type GuessResult, makeGuess, PALETTE, PEG_COUNT, pickColour, reset, setCurrent, } from '../states/mastermindSlice';

const MAX_ATTEMPTS  : number = 10;
const PEG_SIZE      : number = 32;
const FEEDBACK_SIZE : number = 12;

const GuessHistory = ({
    guesses,
    palette,
} : {
    guesses : GuessResult[],
    palette : string[],
}) => (
    <div style={{
        maxHeight    : 222,
        paddingRight : 8,
        overflowY    : 'auto',
    }}>
        {guesses.slice().reverse().map((guess, index) => (
            <Row
                key={index}
                style={{
                    marginBottom : 6,
                }}
                align='middle'>
                <Col span={16}>
                    <Space>
                        {guess.pegs.map((peg, i) => (
                            <div
                                key={i}
                                style={{
                                    width           : PEG_SIZE,
                                    height          : PEG_SIZE,
                                    borderRadius    : '50%',
                                    backgroundColor : palette[peg],
                                }} />
                        ))}
                    </Space>
                </Col>
                <Col span={8}>
                    <Flex gap={6}>
                        {Array.from({
                            length : guess.feedback.correct,
                        }).map((_, i) => (
                            <div
                                key={`black-${i}`}
                                style={{
                                    width           : FEEDBACK_SIZE,
                                    height          : FEEDBACK_SIZE,
                                    borderRadius    : '50%',
                                    backgroundColor : 'green',
                                }} />
                        ))}
                        {Array.from({
                            length : guess.feedback.misplaced,
                        }).map((_, i) => (
                            <div
                                key={`white-${i}`}
                                style={{
                                    width           : FEEDBACK_SIZE,
                                    height          : FEEDBACK_SIZE,
                                    borderRadius    : '50%',
                                    backgroundColor : 'white',
                                }} />
                        ))}
                        {Array.from({
                            length : PEG_COUNT - guess.feedback.correct - guess.feedback.misplaced,
                        }).map((_, i) => (
                            <div
                                key={`empty-${i}`}
                                style={{
                                    width        : FEEDBACK_SIZE,
                                    height       : FEEDBACK_SIZE,
                                    border       : '2px solid white',
                                    borderRadius : '50%',
                                }} />
                        ))}
                    </Flex>
                </Col>
            </Row>
        ))}
    </div>
);

const PegRow = ({
    current,
    palette,
    onCycle,
} : {
    current : (number | null)[],
    palette : string[],
    onCycle : (index : number) => void,
}) => (
    <Flex
        wrap
        gap='small'
        justify='center'>
        {current.map((peg, index) => {
            const handleClick = () => onCycle(index);

            return (
                <Button
                    key={`peg-${index}`}
                    style={{
                        width           : PEG_SIZE,
                        height          : PEG_SIZE,
                        padding         : 0,
                        border          : '2px solid #666',
                        borderRadius    : '50%',
                        backgroundColor : peg === null ? '#000' : palette[peg],
                        boxShadow       : '0 1px 0 rgba(0, 0, 0, 0.2)',
                    }}
                    onClick={handleClick} />
            );
        })}
    </Flex>
);

const ColourPicker = ({
    palette,
    onPick,
} : {
    palette : string[],
    onPick  : (index : number) => void,
}) => (
    <Flex
        style={{
            width        : 168,
            marginTop    : 40,
            marginBottom : 40,
        }}
        wrap
        gap='small'
        justify='center'>
        {palette.map((colour, index) => {
            const handleClick = () => onPick(index);

            return (
                <Button
                    key={`colour-${index}`}
                    style={{
                        width        : PEG_SIZE,
                        height       : PEG_SIZE,
                        padding      : 0,
                        borderRadius : '50%',
                    }}
                    onClick={handleClick}>
                    <div style={{
                        width           : '100%',
                        height          : '100%',
                        borderRadius    : '50%',
                        backgroundColor : colour,
                    }} />
                </Button>
            );
        })}
    </Flex>
);

export const MastermindGameScreen = () => {
    const { secret, guesses, current, } = useAppSelector(state => state.mastermind);

    const dispatch = useAppDispatch();

    const { t, } = useTranslation();

    const handleReset = useCallback(() => dispatch(reset()), [ dispatch, ]);

    const handleGuess = async () => {
        if (current.some((c : number | null) => c === null)) return;

        dispatch(makeGuess());
    };

    const handlePickColour = (index : number) => {
        if (current.includes(null)) dispatch(pickColour(index));
    };

    const handleCyclePeg = (index : number) => dispatch(cyclePeg(index));

    const handleClear = () => dispatch(setCurrent((Array(PEG_COUNT).fill(null))));

    const Secret = (
        <Flex
            style={{
                marginTop : 8,
            }}
            gap={6}
            justify='center'>
            {secret.map((peg : number, index : number) => (
                <div
                    key={`peg-${index}`}
                    style={{
                        width           : PEG_SIZE,
                        height          : PEG_SIZE,
                        borderRadius    : '50%',
                        backgroundColor : PALETTE[peg],
                    }} />
            ))}
        </Flex>
    );

    return (
        <div style={{
            padding : 8,
        }}>
            <Row
                align='middle'
                justify='space-between'>
                <Col span={24}>
                    <Button
                        size='small'
                        icon={<ReloadOutlined />}
                        onClick={handleReset}>
                        {t('action_restart')}
                    </Button>
                </Col>
            </Row>
            <Row style={{
                marginTop : 8,
            }}>
                <Col span={14}>
                    <GuessHistory
                        guesses={guesses}
                        palette={PALETTE} />
                </Col>
                <Col span={10}>
                    <Flex
                        vertical
                        align='center'>
                        <PegRow
                            current={current}
                            palette={PALETTE}
                            onCycle={handleCyclePeg} />
                        <ColourPicker
                            palette={PALETTE}
                            onPick={handlePickColour} />
                        <Space style={{
                            marginTop : 8,
                        }}>
                            <Button
                                size='small'
                                disabled={current.some((c : number | null) => c === null)}
                                icon={<QuestionOutlined />}
                                type='primary'
                                onClick={handleGuess}>
                                {t('action_guess')}
                            </Button>
                            <Button
                                size='small'
                                disabled={current.every((c : number | null) => c === null)}
                                icon={<ClearOutlined />}
                                onClick={handleClear}>
                                {t('action_clear')}
                            </Button>
                        </Space>
                    </Flex>
                </Col>
            </Row>
            <Modal
                style={{
                    textAlign : 'center',
                }}
                width='80%'
                centered
                closable={false}
                open={guesses.length > 0 && guesses[guesses.length - 1].feedback.correct === PEG_COUNT || guesses.length >= MAX_ATTEMPTS}
                footer={null}>
                {guesses.length > 0 && guesses[guesses.length - 1].feedback.correct === PEG_COUNT && (
                    <>
                        <Typography.Title level={4}>
                            {t('result_won')}
                        </Typography.Title>
                        <Typography.Text>
                            {t('result_code')}
                            {Secret}
                        </Typography.Text>
                    </>
                )}
                {guesses.length > 0 && guesses[guesses.length - 1].feedback.correct < PEG_COUNT && guesses.length >= MAX_ATTEMPTS && (
                    <>
                        <Typography.Title level={4}>
                            {t('result_lost')}
                        </Typography.Title>
                        <Typography.Text>
                            {t('result_code')}
                            {Secret}
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
