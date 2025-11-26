
import { FireFilled, ReadFilled, SettingFilled, SmileFilled, SunFilled, VideoCameraFilled,  WarningFilled, } from '@ant-design/icons';
import { Button, Flex, Typography, } from 'antd';
import { type ReactElement, } from 'react';
import { useTranslation, } from 'react-i18next';
import { useNavigate, } from 'react-router';

const ICON_SIZE   : number = 56;
const BUTTON_SIZE : number = 96;

const ICONS : ReactElement[] = [
    <FireFilled
        style={{
            fontSize : ICON_SIZE,
        }}
        key='heating' />,
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
    <SmileFilled
        style={{
            fontSize : ICON_SIZE,
        }}
        key='games' />,
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
                padding : 16,
            }}
            wrap
            gap={16}
            align='center'
            justify='space-evenly'>
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
                                width       : BUTTON_SIZE,
                                height      : BUTTON_SIZE,
                                marginLeft  : 8,
                                marginRight : 8,
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
