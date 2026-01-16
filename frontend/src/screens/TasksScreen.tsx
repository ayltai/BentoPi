import { DeleteOutlined, EditOutlined, PlayCircleOutlined, PlusOutlined, } from '@ant-design/icons';
import { Button, Empty, FloatButton, Form, Input, InputNumber, Layout, List, message, Modal, Popconfirm, Typography, } from 'antd';
import { useState, } from 'react';
import { useTranslation, } from 'react-i18next';
import { v4, } from 'uuid';

import { WS_ENDPOINT ,} from '../constants';
import { useAppDispatch, useAppSelector, useWebSocket, } from '../hooks';
import type { Task, } from '../models';
import { addTask, removeTask, updateTask, } from '../states/taskSlice';

const DEFAULT_TIME_LIMIT : number = 60;

export const TasksScreen = () => {
    const [ currentTaskId, setCurrentTaskId, ] = useState<string | null>(null);
    const [ isModalOpen,   setIsModalOpen,   ] = useState<boolean>(false);

    const { tasks, } = useAppSelector(state => state.task);

    const dispatch = useAppDispatch();

    const { send, } = useWebSocket(`${WS_ENDPOINT}/tasks-${v4()}`);

    const [ messageApi, contextHolder, ] = message.useMessage();

    const [ form, ] = Form.useForm<Task>();

    const { t, } = useTranslation();

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
                            const handleStartTask = async () => {
                                send({
                                    target_id : 'timer',
                                    payload   : {
                                        title     : task.title,
                                        timeLimit : task.timeLimit,
                                    },
                                });

                                await messageApi.success(t('label_task_sent'));
                            };

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
                                                icon={<PlayCircleOutlined />}
                                                onClick={handleStartTask} />,
                                            <Button
                                                key='edit'
                                                type='text'
                                                shape='circle'
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
                            timeLimit : DEFAULT_TIME_LIMIT,
                        }}
                        validateTrigger='onBlur'>
                        <Form.Item<Task>
                            name='title'
                            label={t('label_task_description')}
                            rules={[
                                {
                                    required : true,
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
                                    type    : 'number',
                                    min     : 1,
                                    max     : 7 * 24 * 60,
                                    message : t('error_task_time_limit'),
                                },
                            ]}>
                            <InputNumber
                                min={1}
                                max={7 * 24 * 60} />
                        </Form.Item>
                    </Form>
                </Modal>
            </Layout.Content>
        </Layout>
    );
};
