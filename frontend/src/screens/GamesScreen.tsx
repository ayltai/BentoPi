import { AppstoreOutlined, BulbOutlined, UserOutlined, } from '@ant-design/icons';
import { Button, Flex, Typography, } from 'antd';
import { type ReactElement, } from 'react';
import { useTranslation, } from 'react-i18next';
import { useNavigate, } from 'react-router';

const ICON_SIZE   : number = 56;
const BUTTON_SIZE : number = 96;

const ICONS : ReactElement[] = [
    <AppstoreOutlined
        style={{
            fontSize : ICON_SIZE,
        }}
        key='memory' />,
    <UserOutlined
        style={{
            fontSize : ICON_SIZE,
        }}
        key='hangman' />,
    <BulbOutlined
        style={{
            fontSize : ICON_SIZE,
        }}
        key='mastermind' />,
];

export const GamesScreen = () => {
    const navigate = useNavigate();

    const { t, } = useTranslation();

    return (
        <Flex
            style={{
                padding : 16,
            }}
            wrap
            gap={16}
            align='center'
            justify='space-evenly'>
            {(t('games', {
                returnObjects : true,
            }) as string[]).map((game, index) => {
                const handleClick = () => navigate(`/games/${game.toLowerCase()}`);

                return (
                    <Flex
                        key={game}
                        vertical
                        align='center'
                        justify='center'>
                        <Button
                            style={{
                                width       : BUTTON_SIZE,
                                height      : BUTTON_SIZE,
                                marginLeft  : 8,
                                marginRight : 8,
                            }}
                            icon={ICONS[index]}
                            onClick={handleClick} />
                        <Typography.Text>
                            {game}
                        </Typography.Text>
                    </Flex>
                );
            })}
        </Flex>
    );
};
