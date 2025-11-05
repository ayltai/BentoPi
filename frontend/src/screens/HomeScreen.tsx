
import { ReadFilled, SettingFilled, SunFilled, VideoCameraFilled,  WarningFilled, } from '@ant-design/icons';
import { Button, Flex, Typography, } from 'antd';
import { type ReactElement, } from 'react';
import { useTranslation, } from 'react-i18next';
import { useNavigate, } from 'react-router';

const ICON_SIZE : number = 64;

const ICONS : ReactElement[] = [
    <SunFilled
        style={{
            fontSize : ICON_SIZE,
        }}
        key='weather' />,
    <ReadFilled
        style={{
            fontSize : ICON_SIZE,
        }}
        key='news' />,
    <WarningFilled
        style={{
            fontSize : ICON_SIZE,
        }}
        key='disruptions' />,
    <VideoCameraFilled
        style={{
            fontSize : ICON_SIZE,
        }}
        key='security' />,
    <SettingFilled
        style={{
            fontSize : ICON_SIZE,
        }}
        key='system' />,
];

export const HomeScreen = () => {
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
            {(t('apps', {
                returnObjects : true,
            }) as string[]).map((app, index) => {
                const handleClick = () => navigate(`/dashboard/${app.toLowerCase()}`);

                return (
                    <Flex
                        key={app}
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
                            {app}
                        </Typography.Text>
                    </Flex>
                );
            })}
        </Flex>
    );
};
