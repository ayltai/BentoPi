import { Card, Empty, List, Skeleton, } from 'antd';
import { useEffect, } from 'react';
import { useTranslation, } from 'react-i18next';

import { useGetDisruptionsQuery, } from '../apis';
import { INTERVAL_DISRUPTIONS_UPDATE, } from '../constants';
import { handleError, } from '../utils';

export const DisruptionsScreen = () => {
    const { data, error, isLoading, isUninitialized, } = useGetDisruptionsQuery(undefined, {
        pollingInterval : INTERVAL_DISRUPTIONS_UPDATE,
    });

    const { t, } = useTranslation();

    useEffect(() => {
        if (error) handleError(error);
    }, [ error, ]);

    return (
        <Card style={{
            margin : 8,
        }}>
            {!data && (isLoading || isUninitialized) && (
                <Skeleton active paragraph={{
                    rows : 4,
                }} />
            )}
            {data && data.length > 0 && (
                <List
                    dataSource={data.map(item => ({
                        title : item.description,
                    }))}
                    renderItem={item => (
                        <List.Item>
                            <List.Item.Meta title={item.title} />
                        </List.Item>
                    )} />
            )}
            {(!data || data.length === 0) && !isLoading && !isUninitialized && (
                <Empty
                    description={t('empty_disruptions')}
                    image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
        </Card>
    );
};
