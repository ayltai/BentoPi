import { act, fireEvent, waitFor, } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi, } from 'vitest';

import type { Task, } from '../models';
import { addTask, } from '../states/taskSlice';
import { createStore, render, } from '../utils/test';
import { TasksScreen, } from './TasksScreen';

const mocks = vi.hoisted(() => ({
    send      : vi.fn<(message : Record<string, unknown>) => boolean>(),
    success   : vi.fn(),
    error     : vi.fn(),
    onMessage : null as ((message : Record<string, unknown>) => void) | null,
    urls      : [] as string[],
}));

vi.mock('../hooks', async importOriginal => {
    const original = await importOriginal<typeof import('../hooks')>();

    return {
        ...original,
        useWebSocket : (url : string, onMessage? : (message : Record<string, unknown>) => void) => {
            mocks.urls.push(url);
            mocks.onMessage = onMessage ?? null;

            return {
                send     : mocks.send,
                status   : 'connected',
                messages : [],
            };
        },
    };
});

vi.mock('antd', async importOriginal => {
    const original = await importOriginal<typeof import('antd')>();

    return {
        ...original,
        message : {
            ...original.message,
            useMessage : () => [
                {
                    success : mocks.success,
                    error   : mocks.error,
                },
                null,
            ],
        },
    };
});

const renderTask = (task : Task) => {
    const store = createStore();
    store.dispatch(addTask(task));

    return render(<TasksScreen />, {
        store,
    });
};

beforeEach(() => {
    mocks.send.mockReset().mockReturnValue(true);
    mocks.success.mockReset();
    mocks.error.mockReset();
    mocks.urls = [];
    mocks.onMessage = null;
});

afterEach(() => {
    vi.useRealTimers();
});

describe('task timer delivery', () => {
    it('sends an unrounded saved short task with a stable sender and waits for a matching acknowledgment', () => {
        const view = renderTask({
            id        : 'task-1',
            title     : 'Tea',
            timeLimit : 1.500_001,
        });
        fireEvent.click(view.getByRole('button', {
            name : 'action_task_start',
        }));
        const sent = mocks.send.mock.calls[0][0];
        const payload = sent.payload as Record<string, unknown>;
        expect(sent.target_id).toBe('timer');
        expect(payload).toMatchObject({
            title     : 'Tea',
            timeLimit : 1.500_001,
        });
        expect(payload.replyTo).toEqual(expect.stringMatching(/^tasks-/));
        expect(payload.requestId).toEqual(expect.any(String));
        expect(mocks.success).not.toHaveBeenCalled();

        view.rerender(<TasksScreen />);
        expect(new Set(mocks.urls).size).toBe(1);
        expect(mocks.urls[0]).toContain(String(payload.replyTo));
        act(() => mocks.onMessage?.({
            requestId : 'unrelated',
            accepted  : true,
        }));
        expect(mocks.success).not.toHaveBeenCalled();
        act(() => mocks.onMessage?.({
            requestId : payload.requestId,
            accepted  : true,
        }));
        expect(mocks.success).toHaveBeenCalledExactlyOnceWith('label_task_sent');
        view.unmount();
    });

    it('reports an unavailable socket and invalid tasks without claiming success', () => {
        mocks.send.mockReturnValue(false);
        const view = renderTask({
            id        : 'task-1',
            title     : 'Tea',
            timeLimit : 30,
        });
        fireEvent.click(view.getByRole('button', {
            name : 'action_task_start',
        }));
        expect(mocks.error).toHaveBeenCalledWith('error_task_socket');
        expect(mocks.success).not.toHaveBeenCalled();
        view.unmount();

        const invalid = renderTask({
            id        : 'task-2',
            title     : 'Invalid',
            timeLimit : Number.POSITIVE_INFINITY,
        });
        fireEvent.click(invalid.getByRole('button', {
            name : 'action_task_start',
        }));
        expect(mocks.error).toHaveBeenLastCalledWith('error_task_invalid');
        expect(mocks.send).toHaveBeenCalledTimes(1);
        invalid.unmount();
    });

    it('reports rejected acknowledgments and times out when the timer is unavailable', () => {
        const view = renderTask({
            id        : 'task-1',
            title     : 'Tea',
            timeLimit : 30,
        });
        vi.useFakeTimers();
        fireEvent.click(view.getByRole('button', {
            name : 'action_task_start',
        }));
        const firstPayload = mocks.send.mock.calls[0][0].payload as Record<string, unknown>;
        act(() => mocks.onMessage?.({
            requestId : firstPayload.requestId,
            accepted  : false,
        }));
        expect(mocks.error).toHaveBeenCalledWith('error_task_invalid');

        fireEvent.click(view.getByRole('button', {
            name : 'action_task_start',
        }));
        act(() => vi.advanceTimersByTime(5_000));
        expect(mocks.error).toHaveBeenLastCalledWith('error_task_not_delivered');
        expect(mocks.success).not.toHaveBeenCalled();
        view.unmount();
    });

    it('clears pending delivery timeouts on unmount', () => {
        const view = renderTask({
            id        : 'task-1',
            title     : 'Tea',
            timeLimit : 30,
        });
        vi.useFakeTimers();
        fireEvent.click(view.getByRole('button', {
            name : 'action_task_start',
        }));
        view.unmount();
        act(() => vi.advanceTimersByTime(5_000));
        expect(mocks.error).not.toHaveBeenCalled();
    });

    it('defaults new tasks to 30 minutes and rejects a new duration below five', async () => {
        const view = render(<TasksScreen />);
        fireEvent.click(view.getByRole('button', {
            name : 'label_task_add',
        }));
        const input = view.getByRole('spinbutton', {
            name : 'label_task_time_limit',
        });
        expect(input).toHaveValue('30');
        fireEvent.change(input, {
            target : {
                value : '4',
            },
        });
        fireEvent.blur(input);
        await waitFor(() => expect(view.getByText('error_task_time_limit')).toBeInTheDocument());
        view.unmount();
    });

    it('preserves a saved fractional short duration when editing its title', async () => {
        const store = createStore();
        store.dispatch(addTask({
            id        : 'task-1',
            title     : 'Tea',
            timeLimit : 1.500_001,
        }));
        const view = render(<TasksScreen />, {
            store,
        });
        fireEvent.click(view.getByRole('button', {
            name : 'action_task_edit',
        }));
        expect(view.getByRole('spinbutton', {
            name : 'label_task_time_limit',
        })).toHaveValue('1.500001');
        fireEvent.change(view.getByRole('textbox', {
            name : 'label_task_description',
        }), {
            target : {
                value : 'Tea break',
            },
        });
        fireEvent.click(view.getByRole('button', {
            name : 'action_save',
        }));
        await waitFor(() => expect(store.getState().task.tasks[0]).toMatchObject({
            title     : 'Tea break',
            timeLimit : 1.500_001,
        }));
        view.unmount();
    });
});
