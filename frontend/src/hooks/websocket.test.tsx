import { act, renderHook, waitFor, } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi, } from 'vitest';

import { handleError, } from '../utils';
import { useWebSocket, } from './websocket';

vi.mock('../utils', () => ({
    handleError : vi.fn(),
}));

class FakeWebSocket {
    static OPEN = 1;
    static instances : FakeWebSocket[] = [];
    static shouldThrow = false;

    readyState = 0;
    onopen : (() => void) | null = null;
    onclose : (() => void) | null = null;
    onerror : (() => void) | null = null;
    onmessage : ((event : { data : string, }) => void) | null = null;
    send = vi.fn<(data : string) => void>();
    close = vi.fn<() => void>();

    constructor() {
        if (FakeWebSocket.shouldThrow) throw new Error('Socket unavailable');

        FakeWebSocket.instances.push(this);
    }
}

beforeEach(() => {
    FakeWebSocket.instances = [];
    FakeWebSocket.shouldThrow = false;
    vi.stubGlobal('WebSocket', FakeWebSocket);
});

afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
});

describe('useWebSocket', () => {
    it('returns true only when an open socket actually sends', () => {
        const { result, unmount, } = renderHook(() => useWebSocket('ws://example.test/timer'));
        const socket = FakeWebSocket.instances[0];
        expect(result.current.send({
            payload : 'test',
        })).toBe(false);

        act(() => {
            socket.readyState = FakeWebSocket.OPEN;
            socket.onopen?.();
        });
        expect(result.current.send({
            payload : 'test',
        })).toBe(true);
        expect(socket.send).toHaveBeenCalledWith('{"payload":"test"}');

        socket.send.mockImplementationOnce(() => {
            throw new Error('Send failed');
        });
        expect(result.current.send({
            payload : 'test',
        })).toBe(false);
        expect(handleError).toHaveBeenCalledOnce();
        unmount();
        expect(socket.close).toHaveBeenCalledOnce();
    });

    it('delivers valid messages and logs invalid JSON or message shapes', () => {
        const onMessage = vi.fn();
        const { result, unmount, } = renderHook(() => useWebSocket('ws://example.test/timer', onMessage));
        const socket = FakeWebSocket.instances[0];

        act(() => {
            socket.onmessage?.({
                data : '{"title":"Task","timeLimit":1.5}',
            });
        });
        expect(onMessage).toHaveBeenCalledWith({
            title     : 'Task',
            timeLimit : 1.5,
        });
        expect(result.current.messages).toHaveLength(1);
        act(() => {
            socket.onmessage?.({
                data : 'null',
            });
            socket.onmessage?.({
                data : '{',
            });
        });
        expect(handleError).toHaveBeenCalledTimes(2);
        unmount();
        expect(socket.onmessage).toBeNull();
    });

    it('reconnects after disconnection and ignores messages from the old socket', () => {
        vi.useFakeTimers();
        const onMessage = vi.fn();
        const { result, unmount, } = renderHook(() => useWebSocket('ws://example.test/timer', onMessage));
        const first = FakeWebSocket.instances[0];
        act(() => first.onclose?.());
        expect(result.current.status).toBe('disconnected');
        act(() => vi.advanceTimersByTime(500));
        const second = FakeWebSocket.instances[1];
        expect(second).toBeDefined();
        act(() => {
            first.onmessage?.({
                data : '{"title":"stale"}',
            });
            second.readyState = FakeWebSocket.OPEN;
            second.onopen?.();
        });
        expect(onMessage).not.toHaveBeenCalled();
        expect(result.current.status).toBe('connected');
        unmount();
        expect(second.close).toHaveBeenCalledOnce();
    });

    it('reports a socket constructor failure', async () => {
        FakeWebSocket.shouldThrow = true;
        const { result, unmount, } = renderHook(() => useWebSocket('ws://example.test/timer'));
        await waitFor(() => expect(result.current.status).toBe('error'));
        expect(result.current.send({
            payload : 'test',
        })).toBe(false);
        expect(handleError).toHaveBeenCalledOnce();
        unmount();
    });
});
