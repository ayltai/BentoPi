import { AppstoreOutlined, BulbOutlined, UserOutlined, } from '@ant-design/icons';
import { Button, Flex, Typography, } from 'antd';
import { type ReactElement, } from 'react';
import { useTranslation, } from 'react-i18next';
import { useNavigate, } from 'react-router';

const ICON_SIZE : number = 64;

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
                padding : 24,
            }}
            wrap
            gap={24}
            align='center'
            justify='start'>
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
                                width  : 128,
                                height : 128,
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
