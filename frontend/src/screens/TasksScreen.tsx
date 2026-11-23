import { DeleteOutlined, EditOutlined, PlayCircleOutlined, PlusOutlined, } from '@ant-design/icons';
import { Button, Empty, FloatButton, Form, Input, InputNumber, Layout, List, message, Modal, Popconfirm, Typography, } from 'antd';
import { useEffect, useRef, useState, } from 'react';
import { useTranslation, } from 'react-i18next';
import { v4, } from 'uuid';

import { WS_ENDPOINT ,} from '../constants';
import { useAppDispatch, useAppSelector, useWebSocket, } from '../hooks';
import type { Task, } from '../models';
import { addTask, removeTask, updateTask, } from '../states/taskSlice';
import { DEFAULT_COUNTDOWN_MINUTES, MIN_COUNTDOWN_MINUTES, } from '../timer/constants';
import { isValidTimerMinutes, } from '../timer/taskMessage';

const TASK_ACK_TIMEOUT_MS = 5_000;

export const TasksScreen = () => {
    const [ currentTaskId, setCurrentTaskId, ] = useState<string | null>(null);
    const [ isModalOpen,   setIsModalOpen,   ] = useState<boolean>(false);
    const [ senderId, ] = useState(() => `tasks-${v4()}`);
    const pendingRequests = useRef(new Map<string, number>());

    const { tasks, } = useAppSelector(state => state.task);
    const dispatch = useAppDispatch();
    const [ messageApi, contextHolder, ] = message.useMessage();
    const [ form, ] = Form.useForm<Task>();
    const { t, } = useTranslation();

    const { send, status, } = useWebSocket(`${WS_ENDPOINT}/${senderId}`, (response) : void => {
        if (typeof response.requestId !== 'string') return;

        const timeout = pendingRequests.current.get(response.requestId);
        if (timeout === undefined) return;

        window.clearTimeout(timeout);
        pendingRequests.current.delete(response.requestId);
        if (response.accepted === true) {
            void messageApi.success(t('label_task_sent'));
        } else {
            void messageApi.error(t('error_task_invalid'));
        }
    });

    useEffect(() => {
        const pending = pendingRequests.current;

        return () => {
            for (const timeout of pending.values()) window.clearTimeout(timeout);
            pending.clear();
        };
    }, []);

    useEffect(() => {
        if ((status === 'disconnected' || status === 'error') && pendingRequests.current.size > 0) {
            for (const timeout of pendingRequests.current.values()) window.clearTimeout(timeout);
            pendingRequests.current.clear();
            void messageApi.error(t('error_task_socket'));
        }
    }, [ status, messageApi, t, ]);

    const handleStartTask = (task : Task) : void => {
        if (typeof task.title !== 'string' || task.title.trim().length === 0 || !isValidTimerMinutes(task.timeLimit)) {
            void messageApi.error(t('error_task_invalid'));

            return;
        }

        const requestId = v4();
        const timeout = window.setTimeout(() => {
            if (pendingRequests.current.delete(requestId)) void messageApi.error(t('error_task_not_delivered'));
        }, TASK_ACK_TIMEOUT_MS);
        pendingRequests.current.set(requestId, timeout);

        if (!send({
            target_id : 'timer',
            payload   : {
                title     : task.title,
                timeLimit : task.timeLimit,
                replyTo   : senderId,
                requestId,
            },
        })) {
            window.clearTimeout(timeout);
            pendingRequests.current.delete(requestId);
            void messageApi.error(t('error_task_socket'));
        }
    };

    const handleAddTask = () => {
        form.resetFields();

        setIsModalOpen(true);
    };

    const handleCancelTask = () => {
        form.resetFields();

        setCurrentTaskId(null);
        setIsModalOpen(false);
    };

    const handleSaveTask = async () => {
        try {
            await form.validateFields();

            if (currentTaskId) {
                dispatch(updateTask({
                    id        : currentTaskId,
                    title     : form.getFieldValue('title'),
                    timeLimit : form.getFieldValue('timeLimit'),
                }));
            } else {
                dispatch(addTask({
                    id        : v4(),
                    title     : form.getFieldValue('title'),
                    timeLimit : form.getFieldValue('timeLimit'),
                }));
            }

            handleCancelTask();
        } catch {
        }
    };

    const currentTask = tasks.find((task : Task) => task.id === currentTaskId);
    const savedShortDuration = currentTask && isValidTimerMinutes(currentTask.timeLimit) && currentTask.timeLimit < MIN_COUNTDOWN_MINUTES
        ? currentTask.timeLimit
        : null;

    return (
        <Layout style={{
            height : '100vh',
            display : 'flex',
        }}>
            <Layout.Header style={{
                paddingLeft  : 16,
                paddingRight : 16,
            }}>
                {t('label_task_title')}
            </Layout.Header>
            <Layout.Content style={{
                display       : 'flex',
                flexDirection : 'column',
            }}>
                {contextHolder}
                {tasks.length === 0 && (
                    <Empty
                        style={{
                            display        : 'flex',
                            flexDirection  : 'column',
                            flex           : 1,
                            alignItems     : 'center',
                            justifyContent : 'center',
                        }}
                        description={
                            <Typography.Text>{t('empty_tasks')}</Typography.Text>
                        } />
                )}
                {tasks.length > 0 && (
                    <List
                        dataSource={tasks}
                        renderItem={(task : Task) => {
                            const handleEditTask = () => {
                                form.setFieldsValue({
                                    id        : task.id,
                                    title     : task.title,
                                    timeLimit : task.timeLimit,
                                });

                                setCurrentTaskId(task.id);
                                setIsModalOpen(true);
                            };

                            const handleDeleteTask = () => dispatch(removeTask(task.id));

                            return (
                                <>
                                    <List.Item
                                        style={{
                                            paddingLeft  : 16,
                                            paddingRight : 16,
                                        }}
                                        actions={[
                                            <Button
                                                key='start'
                                                type='text'
                                                shape='circle'
                                                aria-label={t('action_task_start')}
                                                icon={<PlayCircleOutlined />}
                                                onClick={() => handleStartTask(task)} />,
                                            <Button
                                                key='edit'
                                                type='text'
                                                shape='circle'
                                                aria-label={t('action_task_edit')}
                                                icon={<EditOutlined />}
                                                onClick={handleEditTask} />,
                                            <Popconfirm
                                                key='delete'
                                                title={t('label_task_delete_title')}
                                                description={t('label_task_delete_message')}
                                                onConfirm={handleDeleteTask}>
                                                <Button
                                                    danger
                                                    type='text'
                                                    shape='circle'
                                                    icon={<DeleteOutlined />} />
                                            </Popconfirm>,
                                        ]}>
                                        <List.Item.Meta title={
                                            <Typography.Text style={{
                                                fontWeight : 'normal',
                                            }}>
                                                {task.title}
                                            </Typography.Text>
                                        } />
                                    </List.Item>
                                </>
                            );
                        }} />
                )}
                {!isModalOpen && (
                    <FloatButton
                        type='primary'
                        shape='square'
                        aria-label={t('label_task_add')}
                        icon={<PlusOutlined />}
                        onClick={handleAddTask} />
                )}
                <Modal
                    centered
                    destroyOnHidden
                    closable={false}
                    maskClosable={false}
                    title={t('label_task_add')}
                    open={isModalOpen}
                    cancelText={t('action_cancel')}
                    okText={t('action_save')}
                    onCancel={handleCancelTask}
                    onOk={handleSaveTask}>
                    <Form
                        form={form}
                        labelCol={{
                            span : 8,
                        }}
                        wrapperCol={{
                            span : 16,
                        }}
                        initialValues={{
                            id        : currentTaskId,
                            timeLimit : DEFAULT_COUNTDOWN_MINUTES,
                        }}
                        validateTrigger='onBlur'>
                        <Form.Item<Task>
                            name='title'
                            label={t('label_task_description')}
                            rules={[
                                {
                                    required : true,
                                    whitespace : true,
                                    message  : t('error_task_title'),
                                },
                            ]}>
                            <Input />
                        </Form.Item>
                        <Form.Item<Task>
                            name='timeLimit'
                            label={t('label_task_time_limit')}
                            rules={[
                                {
                                    required : true,
                                    message  : t('error_task_time_limit'),
                                },
                                {
                                    validator : (_rule, value : unknown) => isValidTimerMinutes(value) && (value >= MIN_COUNTDOWN_MINUTES || value === savedShortDuration)
                                        ? Promise.resolve()
                                        : Promise.reject(new Error(t('error_task_time_limit'))),
                                },
                            ]}>
                            <InputNumber />
                        </Form.Item>
                    </Form>
                </Modal>
            </Layout.Content>
        </Layout>
    );
};
