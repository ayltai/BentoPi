import { Flex, Modal, Typography, } from 'antd';
import { useCallback, useEffect, useState, } from 'react';

import { TIMEOUT_ALERT, WS_ENDPOINT, } from '../constants';
import { useWebSocket, } from '../hooks';

type SnapshotAlert = {
    label      : string,
    snapshot   : string,
    receivedAt : number,
};

export const AlertOverlay = () => {
    const [ alert,       setAlert,       ] = useState<SnapshotAlert | null>(null);
    const [ imageFailed, setImageFailed, ] = useState<boolean>(false);

    const handleMessage = useCallback((message: Record<string, any>) => {
        if (typeof message.label === 'string' && typeof message.snapshot === 'string') {
            setImageFailed(false);

            setAlert({
                label      : message.label,
                snapshot   : message.snapshot,
                receivedAt : Date.now(),
            });
        }
    }, []);

    useWebSocket(`${WS_ENDPOINT}/alerts`, handleMessage);

    useEffect(() => {
        if (alert) {
            const timeout = window.setTimeout(() => setAlert(null), TIMEOUT_ALERT);

            return () => window.clearTimeout(timeout);
        }
    }, [ alert, ]);

    if (alert) {
        const imageUrl = new URL(alert.snapshot);
        imageUrl.searchParams.set('t', String(alert.receivedAt));

        return (
            <Modal
                style={{
                    top          : 0,
                    margin       : 0,
                    maxWidth     : '100vw',
                    paddingBottom : 0,
                }}
                styles={{
                    container : {
                        height          : '100vh',
                        padding         : 0,
                        borderRadius    : 0,
                        backgroundColor : '#000',
                    },
                    body : {
                        height  : '100%',
                        padding : 0,
                    },
                }}
                open
                width='100vw'
                zIndex={3000}
                closable
                footer={null}
                onCancel={() => setAlert(null)}>
                <Flex
                    align='center'
                    justify='center'
                    onClick={() => setAlert(null)}
                    style={{
                        position        : 'relative',
                        height          : '100vh',
                        overflow        : 'hidden',
                        backgroundColor : '#000',
                    }}>
                    {imageFailed ? (
                        <Typography.Text
                            style={{
                                color    : '#fff',
                                fontSize : 20,
                            }}>
                            Snapshot unavailable
                        </Typography.Text>
                    ) : (
                        <img
                            style={{
                                position  : 'absolute',
                                inset     : 0,
                                width     : '100%',
                                height    : '100%',
                                objectFit : 'contain',
                            }}
                            alt={alert.label}
                            src={imageUrl.toString()}
                            onError={() => setImageFailed(true)} />
                    )}
                    <Typography.Text
                        style={{
                            position        : 'absolute',
                            bottom          : 16,
                            maxWidth        : 'calc(100% - 32px)',
                            padding         : '8px 12px',
                            color           : '#fff',
                            backgroundColor : 'rgba(0, 0, 0, 0.72)',
                            textAlign       : 'center',
                            overflowWrap    : 'anywhere',
                        }}
                        strong>
                        {alert.label}
                    </Typography.Text>
                </Flex>
            </Modal>
        );
    }

    return null;
};
