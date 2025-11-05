import { Card, Empty, Image, List, Skeleton, Typography, } from 'antd';
import { intlFormatDistance, } from 'date-fns';
import { useEffect, } from 'react';
import { useTranslation, } from 'react-i18next';

import { useGetNewsQuery, } from '../apis';
import { INTERVAL_NEWS_UPDATE, } from '../constants';
import { handleError, } from '../utils';

export const NewsScreen = () => {
    const { data, error, isLoading, isUninitialized, } = useGetNewsQuery(undefined, {
        pollingInterval : INTERVAL_NEWS_UPDATE,
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
                    itemLayout='vertical'
                    dataSource={data}
                    renderItem={item => (
                        <List.Item
                            actions={[
                                <Typography.Text
                                    style={{
                                        fontSize : '0.8em',
                                        color    : 'gray',
                                    }}
                                    key={item.title}>
                                    {intlFormatDistance(new Date(item.pubDate), new Date())}
                                </Typography.Text>,
                            ]}
                            extra={item.imageUrl ? (
                                <Image
                                    width={100}
                                    alt='thumbnail'
                                    src={item.imageUrl} />
                            ) : undefined}>
                            <List.Item.Meta
                                style={{
                                    marginRight : 8,
                                }}
                                title={item.title}
                                description={item.description} />
                        </List.Item>
                    )} />
            )}
            {(!data || data.length === 0) && !isLoading && !isUninitialized && (
                <Empty
                    description={t('empty_news_feed')}
                    image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
        </Card>
    );
};
