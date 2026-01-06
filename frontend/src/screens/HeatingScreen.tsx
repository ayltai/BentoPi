import { faDroplet, faFireFlameCurved, faTemperatureFull, } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon, } from '@fortawesome/react-fontawesome';
import { CaretDownFilled, CaretUpFilled, } from '@ant-design/icons';
import { Button, Col, Divider, Flex, Row, Segmented, Typography, } from 'antd';
import { useEffect, useMemo, } from 'react';
import { GaugeComponent, } from 'react-gauge-component';
import { useTranslation, } from 'react-i18next';

import { useGetConfigurationsQuery, useGetCurrentStateQuery, useGetDevicesQuery, useGetTelemetryQuery, useSetConfigurationsMutation, } from '../apis';
import { HEATING_TEMPERATURE_MAX, HEATING_TEMPERATURE_MIN, INTERVAL_HEATING_UPDATE, } from '../constants';
import { handleError, } from '../utils';

const ORDER = [
    'Entrance',
    'Kitchen',
    'Living Room',
    'Guest Room',
    'Harold',
    'Loft',
];

export const HeatingScreen = () => {
    const [ setConfiguration, { isLoading : isUpdatingConfigurations, error : setConfigurationsError, }, ] = useSetConfigurationsMutation();

    const { data : configurationsData, error : configurationsError, } = useGetConfigurationsQuery(undefined, {
        pollingInterval : INTERVAL_HEATING_UPDATE,
    });

    const { data : devicesData, error : devicesError, } = useGetDevicesQuery(undefined, {
        pollingInterval : INTERVAL_HEATING_UPDATE,
    });

    const { data : telemetryData, error : telemetryError, } = useGetTelemetryQuery(24 * 60 * 60, {
        pollingInterval : INTERVAL_HEATING_UPDATE,
    });

    const actuatorId = useMemo(() => {
        if (!devicesData) return null;

        const actuator = devicesData.find(device => device.capabilities && device.capabilities.indexOf('action_relay') >= 0);
        if (actuator) return actuator.id;

        return null;
    }, [ devicesData, ]);

    const { data : currentStateData, error : currentStateError, } = useGetCurrentStateQuery(actuatorId!, {
        pollingInterval : INTERVAL_HEATING_UPDATE,
        skip            : actuatorId === null,
    });

    const lowestTemperature = useMemo(() => {
        if (!telemetryData || telemetryData.length === 0) return 0;

        let lowest = Number.MAX_VALUE;
        telemetryData.filter(telemetry => telemetry.dataType === 'temperature').forEach(telemetry => {
            if (telemetry.value < lowest) lowest = telemetry.value;
        });

        return lowest;
    }, [ telemetryData, ]);

    const averageTemperature = useMemo(() => {
        if (!telemetryData || telemetryData.length === 0) return 0;

        let sum   = 0;
        let count = 0;

        telemetryData.filter(telemetry => telemetry.dataType === 'temperature').forEach(telemetry => {
            sum   += telemetry.value;
            count += 1;
        });

        return sum / count;
    }, [ telemetryData, ]);

    const handleIncrementThreshold = () => {
        setConfiguration({
            thresholdOn      : configurationsData!.thresholdOff,
            thresholdOff     : configurationsData!.thresholdOff + 0.5,
            decisionStrategy : configurationsData!.decisionStrategy,
        });
    };

    const handleDecrementThreshold = () => {
        setConfiguration({
            thresholdOn      : configurationsData!.thresholdOff - 1.0,
            thresholdOff     : configurationsData!.thresholdOff - 0.5,
            decisionStrategy : configurationsData!.decisionStrategy,
        });
    };

    useEffect(() => {
        if (setConfigurationsError) handleError(setConfigurationsError);
    }, [ setConfigurationsError, ]);

    useEffect(() => {
        if (configurationsError) handleError(configurationsError);
    }, [ configurationsError, ]);

    useEffect(() => {
        if (devicesError) handleError(devicesError);
    }, [ devicesError, ]);

    useEffect(() => {
        if (telemetryError) handleError(telemetryError);
    }, [ telemetryError, ]);

    useEffect(() => {
        if (currentStateError) handleError(currentStateError);
    }, [ currentStateError, ]);

    const { t, } = useTranslation();

    return (
        <Row>
            <Col
                style={{
                    marginTop : 24,
                }}
                span={13}>
                <GaugeComponent
                    type='radial'
                    arc={{
                        subArcs    : [
                            {
                                color : '#004ba0',
                                limit : 16,
                            }, {
                                color : '#00600f',
                                limit : 20,
                            }, {
                                color : '#9a0007',
                            },
                        ],
                    }}
                    labels={{
                        tickLabels : {
                            type                   : 'inner',
                            defaultTickValueConfig : {
                                formatTextValue : (value : number) => `${value.toFixed(0)} °C`,
                                style           : {
                                    fontSize : '0.6em',
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
                            formatTextValue : (value : number) => `${value.toFixed(1)} °C`,
                            maxDecimalDigits : 1,
                            style            : {
                                fontSize   : 36,
                                fontWeight : 'bold',
                            },
                        },
                    }}
                    minValue={5}
                    maxValue={40}
                    value={(configurationsData?.decisionStrategy === 'avg' ? averageTemperature : lowestTemperature) / 100.0} />
            </Col>
            <Col
                style={{
                    paddingTop   : 12,
                    paddingRight : 8,
                }}
                span={11}>
                <Flex vertical>
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
                                color={currentStateData === 1 ? '#d32f2f' : '#546e7a'}
                                icon={faFireFlameCurved} />
                            <Typography.Text style={{
                                marginLeft : 8,
                                color      : currentStateData === 1 ? '#d32f2f' : '#546e7a',
                                fontSize   : '1.2em',
                                fontWeight : 'bold',
                            }}>
                                {t(currentStateData === 1 ? 'label_heating_status_on' : 'label_heating_status_off')}
                            </Typography.Text>
                        </Col>
                    </Row>
                    <Divider
                        style={{
                            marginTop    : 4,
                            marginBottom : 8,
                            borderColor  : '#263238',
                        }}
                        orientation='horizontal' />
                    {devicesData && devicesData.filter(device => device.id !== '544553545f4445564943455f31323334').filter(device => device.capabilities && device.capabilities.indexOf('temperature') >= 0).slice().sort((a, b) => {
                        const indexA = a.displayName ? ORDER.indexOf(a.displayName) : -1;
                        const indexB = b.displayName ? ORDER.indexOf(b.displayName) : -1;

                        if (indexA === -1 && indexB === -1) return devicesData.indexOf(a) - devicesData.indexOf(b);

                        if (indexA === -1) return 1;
                        if (indexB === -1) return -1;

                        return indexA - indexB;
                    }).map(device => (
                        <Row
                            key={device.id}
                            align='middle'>
                            <Col span={10}>
                                <Typography.Text style={{
                                    fontSize : '0.8em',
                                }}>
                                    {device.displayName}
                                </Typography.Text>
                            </Col>
                            <Col span={8}>
                                <Typography.Text style={{
                                    fontSize : '0.8em',
                                }}>
                                    <FontAwesomeIcon
                                        size='sm'
                                        icon={faTemperatureFull} />
                                    {(telemetryData && telemetryData.filter(telemetry => telemetry.deviceId === device.id && telemetry.dataType === 'temperature')?.map(telemetry => telemetry.value / 100.0)[0]?.toFixed(1)) ?? '-'}°C
                                </Typography.Text>
                            </Col>
                            <Col span={6}>
                                <Typography.Text style={{
                                    fontSize : '0.8em',
                                }}>
                                    <FontAwesomeIcon
                                        size='sm'
                                        icon={faDroplet} />
                                    {(telemetryData && telemetryData.filter(telemetry => telemetry.deviceId === device.id && telemetry.dataType === 'humidity')?.map(telemetry => telemetry.value / 100.0)[0]?.toFixed(0)) ?? '-'}%
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
                    {configurationsData && (
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
                                        disabled={isUpdatingConfigurations || configurationsData.thresholdOn <= HEATING_TEMPERATURE_MIN}
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
                                        {(configurationsData.thresholdOn + 0.5).toFixed(1)} °C
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
                                        disabled={isUpdatingConfigurations || configurationsData.thresholdOn >= HEATING_TEMPERATURE_MAX}
                                        size='middle'
                                        icon={
                                            <CaretUpFilled style={{
                                                fontSize : '1.2em',
                                            }} />}
                                        onClick={handleIncrementThreshold} />
                                </Col>
                            </Row>
                            <Row
                                style={{
                                    padding : 8,
                                }}
                                align='middle'>
                                <Col
                                    style={{
                                        display        : 'flex',
                                        alignItems     : 'center',
                                        justifyContent : 'end',
                                    }}
                                    span={8}>
                                    <Typography.Text style={{
                                        fontSize : '0.8em',
                                    }}>
                                        {t('label_heating_decision_strategy')}
                                    </Typography.Text>
                                </Col>
                                <Col
                                    style={{
                                        display        : 'flex',
                                        alignItems     : 'center',
                                        justifyContent : 'center',
                                    }}
                                    span={16}>
                                    <Segmented<string>
                                        style={{
                                            border : '1px solid #37474f',
                                        }}
                                        disabled={isUpdatingConfigurations}
                                        size='small'
                                        options={[
                                            {
                                                label : t('label_heating_decision_strategies_min'),
                                                value : 'min',
                                            }, {
                                                label : t('label_heating_decision_strategies_avg'),
                                                value : 'avg',
                                            },
                                        ]}
                                        value={configurationsData.decisionStrategy}
                                        onChange={value => {
                                            setConfiguration({
                                                thresholdOn      : configurationsData.thresholdOn,
                                                thresholdOff     : configurationsData.thresholdOff,
                                                decisionStrategy : value,
                                            });
                                        }} />
                                </Col>
                            </Row>
                        </>
                    )}
                </Flex>
            </Col>
        </Row>
    );
};
