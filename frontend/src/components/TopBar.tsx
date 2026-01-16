import { ArrowLeftOutlined, } from '@ant-design/icons';
import { Button, Flex, theme, Typography, } from 'antd';
import { useTranslation, } from 'react-i18next';
import { useNavigate, useLocation, } from 'react-router';

import { SCREEN_WIDTH, TOP_BAR_HEIGHT, } from '../constants';
import { Clock, } from './Clock';

const APP_LINKS : Record<string, number> = {
    '/dashboard/heating'     : 0,
    '/dashboard/weather'     : 1,
    '/dashboard/news'        : 2,
    '/dashboard/disruptions' : 3,
    '/dashboard/games'       : 4,
    '/timer'                 : 5,
    '/dashboard/security'    : 6,
    '/dashboard/system'      : 7,
};

const GAME_LINKS : Record<string, number> = {
    '/games/memory'     : 0,
    '/games/hangman'    : 1,
    '/games/mastermind' : 2,
};

export const TopBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const token    = theme.useToken();

    const { t, } = useTranslation();

    const handleClick = () => navigate(-1);

    return (
        <Flex style={{
            width           : SCREEN_WIDTH,
            maxWidth        : SCREEN_WIDTH,
            height          : TOP_BAR_HEIGHT,
            top             : 0,
            left            : 0,
            right           : 0,
            padding         : 8,
            lineHeight      : 1,
            zIndex          : 1000,
            position        : 'fixed',
            alignItems      : 'center',
            backgroundColor : token.token.colorBgContainer,
        }}>
            {!location.pathname.endsWith('/dashboard/home') && (
                <Button
                    style={{
                        marginRight : 8,
                    }}
                    type='text'
                    icon={<ArrowLeftOutlined />}
                    onClick={handleClick} />
            )}
            {APP_LINKS[location.pathname] !== undefined && (
                <Typography.Text>
                    {(t('apps', {
                        returnObjects : true,
                    }) as string[])[APP_LINKS[location.pathname]]}
                </Typography.Text>
            )}
            {GAME_LINKS[location.pathname] !== undefined && (
                <Typography.Text>
                    {(t('games', {
                        returnObjects : true,
                    }) as string[])[GAME_LINKS[location.pathname]]}
                </Typography.Text>
            )}
            <div style={{
                display       : 'flex',
                flexDirection : 'column',
                flexGrow      : 1,
                alignItems    : 'end',
            }}>
                <div style={{
                    paddingRight : 8,
                    flexGrow     : 1,
                    alignContent : 'center',
                }}>
                    <Clock />
                </div>
            </div>
        </Flex>
    );
};
