import { faDroplet, faFireFlameCurved, faTemperatureFull, } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon, } from '@fortawesome/react-fontawesome';
import { CaretDownFilled, CaretUpFilled, } from '@ant-design/icons';
import { Button, Col, Divider, Flex, Row, Typography, } from 'antd';
import { useEffect, useMemo, } from 'react';
import { GaugeComponent, } from 'react-gauge-component';
import { useTranslation, } from 'react-i18next';

import { useGetTelemetryQuery, useGetThermostatQuery, useSetTargetTemperatureMutation, } from '../apis';
import { INTERVAL_HEATING_UPDATE, } from '../constants';
import type { Entity, } from '../models';
import { handleError, } from '../utils';

const ORDER = [
    'sensor.entrance_climate_actuator_entrance',
    'sensor.kitchen_climate_kitchen',
    'sensor.living_area_climate_living_area',
    'sensor.guest_room_climate_guest_room',
    'sensor.harold_climate_harold',
    'sensor.loft_climate_loft',
];

export const HeatingScreen = () => {
    const [ setTargetTemperature, { isLoading : isUpdatingTargetTemperature, error : setTargetTemperatureError, }, ] = useSetTargetTemperatureMutation();

    const { data : thermostatData, error : thermostatError, } = useGetThermostatQuery(undefined, {
        pollingInterval : INTERVAL_HEATING_UPDATE,
    });

    const { data : telemetryData, error : telemetryError, } = useGetTelemetryQuery(undefined, {
        pollingInterval : INTERVAL_HEATING_UPDATE,
    });

    const { t, } = useTranslation();

    const handleIncrementThreshold = () => {
        setTargetTemperature(thermostatData!.attributes.temperature + 0.5);
    };

    const handleDecrementThreshold = () => {
        setTargetTemperature(thermostatData!.attributes.temperature - 0.5);
    };

    const devices = useMemo<Record<string, Entity[]>>(() => {
        const groupedDevices : Record<string, Entity[]> = {};

        telemetryData?.forEach(telemetry => {
            ORDER.forEach(order => {
                if (telemetry.entityId.startsWith(order)) {
                    if (!groupedDevices[order]) {
                        groupedDevices[order] = [
                            telemetry,
                        ];
                    } else {
                        groupedDevices[order].push(telemetry);
                    }
                }
            });
        });

        return groupedDevices;
    }, [ telemetryData, ]);

    useEffect(() => {
        if (setTargetTemperatureError) handleError(setTargetTemperatureError);
    }, [ setTargetTemperatureError, ]);

    useEffect(() => {
        if (thermostatError) handleError(thermostatError);
    }, [ thermostatError, ]);

    useEffect(() => {
        if (telemetryError) handleError(telemetryError);
    }, [ telemetryError, ]);

    return (
        <Row>
            {thermostatData && (
                <Col
                    style={{
                        marginTop    : 24,
                        paddingLeft  : 8,
                        paddingRight : 8,
                    }}
                    span={12}>
                    <GaugeComponent
                        type='radial'
                        arc={{
                            cornerRadius : 9,
                            padding      : 0.03,
                            subArcs      : [
                                {
                                    color : '#004ba0',
                                    limit : 17,
                                }, {
                                    color : '#00600f',
                                    limit : 22,
                                }, {
                                    color : '#9a0007',
                                },
                            ],
                        }}
                        labels={{
                            tickLabels : {
                                type                   : 'inner',
                                autoSpaceTickLabels    : true,
                                defaultTickValueConfig : {
                                    formatTextValue : (value : number) => `${value.toFixed(0)} °C`,
                                    style           : {
                                        fontSize : 9,
                                    },
                                },
                                ticks                  : [
                                    {
                                        value : 5,
                                    }, {
                                        valueConfig : {
                                            hide : true,
                                        },
                                        value : 10,
                                    }, {
                                        value : 15,
                                    }, {
                                        valueConfig : {
                                            hide : true,
                                        },
                                        value : 20,
                                    }, {
                                        value : 25,
                                    }, {
                                        valueConfig : {
                                            hide : true,
                                        },
                                        value : 30,
                                    }, {
                                        value : 35,
                                    }, {
                                        valueConfig : {
                                            hide : true,
                                        },
                                        value       : 40,
                                    },
                                ],
                            },
                            valueLabel : {
                                animateValue     : true,
                                formatTextValue  : (value : number) => `${value.toFixed(1)} °C`,
                                maxDecimalDigits : 1,
                                style            : {
                                    fontSize   : 36,
                                    fontWeight : 'bold',
                                },
                            },
                        }}
                        pointer={{
                            animate : true,
                        }}
                        minValue={5}
                        maxValue={40}
                        value={thermostatData.attributes.currentTemperature} />
                </Col>
            )}
            <Col
                style={{
                    paddingTop   : 12,
                    paddingRight : 8,
                }}
                span={12}>
                <Flex vertical>
                    {thermostatData && (
                        <Row>
                            <Col
                                style={{
                                    display        : 'flex',
                                    alignItems     : 'center',
                                    justifyContent : 'center',
                                }}
                                span={24}>
                                <FontAwesomeIcon
                                    size='lg'
                                    color={thermostatData.state === 'heat' ? '#d32f2f' : '#546e7a'}
                                    icon={faFireFlameCurved} />
                                <Typography.Text style={{
                                    marginLeft : 8,
                                    color      : thermostatData.state === 'heat' ? '#d32f2f' : '#546e7a',
                                    fontSize   : '1.2em',
                                    fontWeight : 'bold',
                                }}>
                                    {t(thermostatData.state === 'heat' ? 'label_heating_status_on' : 'label_heating_status_off')}
                                </Typography.Text>
                            </Col>
                        </Row>
                    )}
                    <Divider
                        style={{
                            marginTop    : 4,
                            marginBottom : 8,
                            borderColor  : '#263238',
                        }}
                        orientation='horizontal' />
                    {ORDER.map(order => (
                        <Row
                            key={order}
                            align='middle'>
                            <Col span={10}>
                                <Typography.Text style={{
                                    fontSize : '0.8em',
                                }}>
                                    {t(order)}
                                </Typography.Text>
                            </Col>
                            <Col span={8}>
                                <Typography.Text style={{
                                    fontSize : '0.8em',
                                }}>
                                    <FontAwesomeIcon
                                        size='sm'
                                        icon={faTemperatureFull} />
                                    {(devices[order]?.filter(device => device.attributes.deviceClass === 'temperature')?.map(device => Number(device.state))[0]?.toFixed(1)) ?? '-'}°C
                                </Typography.Text>
                            </Col>
                            <Col span={6}>
                                <Typography.Text style={{
                                    fontSize : '0.8em',
                                }}>
                                    <FontAwesomeIcon
                                        size='sm'
                                        icon={faDroplet} />
                                    {(devices[order]?.filter(device => device.attributes.deviceClass === 'humidity')?.map(device => Number(device.state))[0]?.toFixed(0)) ?? '-'}%
                                </Typography.Text>
                            </Col>
                        </Row>
                    ))}
                    <Divider
                        style={{
                            marginTop    : 8,
                            marginBottom : 8,
                            borderColor  : '#263238',
                        }}
                        orientation='horizontal' />
                    {thermostatData && (
                        <>
                            <Row align='middle'>
                                <Col
                                    style={{
                                        display        : 'flex',
                                        alignItems     : 'center',
                                        justifyContent : 'center',
                                    }}
                                    span={6}>
                                    <Button
                                        disabled={isUpdatingTargetTemperature || thermostatData.attributes.temperature <= thermostatData.attributes.minTemp}
                                        size='middle'
                                        icon={
                                            <CaretDownFilled style={{
                                                fontSize : '1.2em',
                                            }} />}
                                        onClick={handleDecrementThreshold} />
                                </Col>
                                <Col
                                    style={{
                                        display       : 'flex',
                                        flexDirection : 'column',
                                        alignItems    : 'center',
                                    }}
                                    span={12}>
                                    <Typography.Text style={{
                                        fontSize : '0.8em',
                                    }}>
                                        {t('label_heating_target')}
                                    </Typography.Text>
                                    <Typography.Text style={{
                                        marginTop    : 0,
                                        marginBottom : 0,
                                        fontSize     : '1.25em',
                                        fontWeight   : 'bold',
                                        lineHeight   : 1,
                                    }}>
                                        {(thermostatData.attributes.temperature).toFixed(1)} °C
                                    </Typography.Text>
                                </Col>
                                <Col
                                    style={{
                                        display        : 'flex',
                                        alignItems     : 'center',
                                        justifyContent : 'center',
                                    }}
                                    span={6}>
                                    <Button
                                        disabled={isUpdatingTargetTemperature || thermostatData.attributes.temperature >= thermostatData.attributes.maxTemp}
                                        size='middle'
                                        icon={
                                            <CaretUpFilled style={{
                                                fontSize : '1.2em',
                                            }} />}
                                        onClick={handleIncrementThreshold} />
                                </Col>
                            </Row>
                        </>
                    )}
                </Flex>
            </Col>
        </Row>
    );
};
