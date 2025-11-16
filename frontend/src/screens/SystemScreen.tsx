import { Descriptions, Typography, } from 'antd';
import { useEffect, } from 'react';
import { useTranslation, } from 'react-i18next';

import { INTERVAL_SYSTEM_UPDATE, } from '../constants';
import { useGetCpuFrequencyQuery, useGetCpuTemperatureQuery, useGetCpuVoltageQuery, useGetDiskTotalQuery, useGetDiskUsageQuery, useGetMemoryTotalQuery, useGetMemoryUsageQuery, } from '../apis';
import { handleError, } from '../utils';

export const SystemScreen = () => {
    const { data : temperatureData, error : temperatureError, } = useGetCpuTemperatureQuery(undefined, {
        pollingInterval : INTERVAL_SYSTEM_UPDATE,
    });

    const { data : voltageData, error : voltageError, } = useGetCpuVoltageQuery(undefined, {
        pollingInterval : INTERVAL_SYSTEM_UPDATE,
    });

    const { data : frequencyData, error : frequencyError, } = useGetCpuFrequencyQuery(undefined, {
        pollingInterval : INTERVAL_SYSTEM_UPDATE,
    });

    const { data : memoryTotalData, error : memoryTotalError, } = useGetMemoryTotalQuery(undefined, {
        pollingInterval : INTERVAL_SYSTEM_UPDATE,
    });

    const { data : memoryUsageData, error : memoryUsageError, } = useGetMemoryUsageQuery(undefined, {
        pollingInterval : INTERVAL_SYSTEM_UPDATE,
    });

    const { data : diskTotalData, error : diskTotalError, } = useGetDiskTotalQuery(undefined, {
        pollingInterval : INTERVAL_SYSTEM_UPDATE,
    });

    const { data : diskUsageData, error : diskUsageError, } = useGetDiskUsageQuery(undefined, {
        pollingInterval : INTERVAL_SYSTEM_UPDATE,
    });

    const { t, } = useTranslation();

    useEffect(() => {
        if (temperatureError) handleError(temperatureError);
    }, [ temperatureError, ]);

    useEffect(() => {
        if (voltageError) handleError(voltageError);
    }, [ voltageError, ]);

    useEffect(() => {
        if (frequencyError) handleError(frequencyError);
    }, [ frequencyError, ]);

    useEffect(() => {
        if (memoryTotalError) handleError(memoryTotalError);
    }, [ memoryTotalError, ]);

    useEffect(() => {
        if (memoryUsageError) handleError(memoryUsageError);
    }, [ memoryUsageError, ]);

    useEffect(() => {
        if (diskTotalError) handleError(diskTotalError);
    }, [ diskTotalError, ]);

    useEffect(() => {
        if (diskUsageError) handleError(diskUsageError);
    }, [ diskUsageError, ]);

    return (
        <Descriptions
            style={{
                margin : 8,
            }}
            bordered
            items={[
                {
                    key      : 'temperature',
                    label    : t('label_system_cpu_temperature'),
                    children : (
                        <Typography.Text>
                            {temperatureData ? `${temperatureData.toFixed(1)} °C` : ''}
                        </Typography.Text>
                    ),
                }, {
                    key      : 'voltage',
                    label    : t('label_system_cpu_voltage'),
                    children : (
                        <Typography.Text>
                            {voltageData ? `${voltageData.toFixed(4)} V` : ''}
                        </Typography.Text>
                    ),
                }, {
                    key      : 'frequency',
                    label    : t('label_system_cpu_frequency'),
                    children : (
                        <Typography.Text>
                            {frequencyData ? `${frequencyData.toFixed(0)} MHz` : ''}
                        </Typography.Text>
                    ),
                }, {
                    key      : 'memory_total',
                    label    : t('label_system_memory_total'),
                    children : (
                        <Typography.Text>
                            {memoryTotalData ? `${memoryTotalData.toFixed(0)} MB` : ''}
                        </Typography.Text>
                    ),
                }, {
                    key      : 'memory_usage',
                    label    : t('label_system_memory_usage'),
                    children : (
                        <Typography.Text>
                            {memoryUsageData ? `${memoryUsageData.toFixed(0)} %` : ''}
                        </Typography.Text>
                    ),
                }, {
                    key      : 'disk_total',
                    label    : t('label_system_disk_total'),
                    children : (
                        <Typography.Text>
                            {diskTotalData ? `${diskTotalData.toFixed(1)} GB` : ''}
                        </Typography.Text>
                    ),
                }, {
                    key      : 'disk_usage',
                    label    : t('label_system_disk_usage'),
                    children : (
                        <Typography.Text>
                            {diskUsageData ? `${diskUsageData.toFixed(0)} %` : ''}
                        </Typography.Text>
                    ),
                },
            ]} />
    );
};
