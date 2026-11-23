import { afterEach, describe, expect, it, vi, } from 'vitest';

import { createTimerAudio, } from './audio';

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('timer audio', () => {
    it('serializes an in-flight play before stop and drops superseded queued plays', async () => {
        let finishFirst : (value : { ok : boolean, status : number, }) => void = () => {};
        const fetchMock = vi.fn()
            .mockImplementationOnce(() => new Promise(resolve => {
                finishFirst = resolve;
            }))
            .mockResolvedValue({
                ok     : true,
                status : 200,
            });
        vi.stubGlobal('fetch', fetchMock);
        const audio = createTimerAudio('/music');

        const first = audio.play('milestone-chime');
        await Promise.resolve();
        const obsolete = audio.play('old-alarm');
        const stop = audio.stop();
        expect(fetchMock).toHaveBeenCalledTimes(1);
        finishFirst({
            ok     : true,
            status : 200,
        });
        await Promise.all([
            first,
            obsolete,
            stop,
        ]);
        expect(fetchMock.mock.calls.map(call => call[0])).toEqual([
            '/music/play/milestone-chime?loop=false',
            '/music/stop',
        ]);
    });

    it('reports HTTP and network errors for the current request', async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce({
                ok     : false,
                status : 503,
            })
            .mockRejectedValueOnce(new Error('Network unavailable'));
        vi.stubGlobal('fetch', fetchMock);
        const audio = createTimerAudio('/music');

        await expect(audio.play('alarm-clock')).rejects.toThrow('HTTP 503');
        await expect(audio.stop()).rejects.toThrow('Network unavailable');
    });

    it('ignores a stale failure and still sends the newer stop', async () => {
        let rejectFirst : (error : Error) => void = () => {};
        const fetchMock = vi.fn()
            .mockImplementationOnce(() => new Promise((_resolve, reject) => {
                rejectFirst = reject;
            }))
            .mockResolvedValue({
                ok     : true,
                status : 200,
            });
        vi.stubGlobal('fetch', fetchMock);
        const audio = createTimerAudio('/music');
        const first = audio.play('alarm-clock');
        await Promise.resolve();
        const stop = audio.stop();
        rejectFirst(new Error('Stale network failure'));
        await expect(first).resolves.toBeUndefined();
        await expect(stop).resolves.toBeUndefined();
        expect(fetchMock).toHaveBeenLastCalledWith('/music/stop', expect.objectContaining({
            keepalive : true,
        }));
    });

    it('sends a keepalive stop immediately on pagehide, even with a play in flight', async () => {
        let finishFirst : (value : { ok : boolean, status : number, }) => void = () => {};
        const fetchMock = vi.fn()
            .mockImplementationOnce(() => new Promise(resolve => {
                finishFirst = resolve;
            }))
            .mockResolvedValue({
                ok     : true,
                status : 200,
            });
        vi.stubGlobal('fetch', fetchMock);
        const audio = createTimerAudio('/music');
        const play = audio.play('milestone-chime');
        await Promise.resolve();
        const stop = audio.stop(true);
        expect(fetchMock).toHaveBeenNthCalledWith(2, '/music/stop', expect.objectContaining({
            keepalive : true,
        }));
        const playSignal : AbortSignal = fetchMock.mock.calls[0][1].signal;
        expect(playSignal.aborted).toBe(true);

        finishFirst({
            ok     : true,
            status : 200,
        });
        await Promise.all([
            play,
            stop,
        ]);
        expect(fetchMock).toHaveBeenLastCalledWith('/music/stop', expect.objectContaining({
            keepalive : true,
        }));
    });
});
