import { API_ENDPOINT, } from '../constants';

export type TimerAudio = {
    play : (track : string) => Promise<void>,
    stop : (immediate? : boolean) => Promise<void>,
};

export const createTimerAudio = (baseUrl = `${API_ENDPOINT}/api/v1/music`) : TimerAudio => {
    let generation = 0;
    let queue = Promise.resolve();
    let activeRequest : AbortController | null = null;

    const request = async (path : string, current : number, keepalive : boolean) : Promise<void> => {
        const abortController = new AbortController();
        activeRequest = abortController;

        try {
            const response = await fetch(`${baseUrl}${path}`, {
                signal : abortController.signal,
                keepalive,
            });
            if (!response.ok) throw new Error(`Timer audio request failed: ${path} (HTTP ${response.status}).`);
        } catch (error) {
            if (current === generation) throw error;
        } finally {
            if (activeRequest === abortController) activeRequest = null;
        }
    };

    const schedule = (path : string) : Promise<void> => {
        const current = ++generation;
        const operation = queue.then(async () => {
            if (current !== generation) return;

            await request(path, current, path === '/stop');
        });

        queue = operation.catch(() => {});

        return operation;
    };

    const stopImmediately = () : Promise<void> => {
        const current = ++generation;
        const previous = queue;
        const hadActiveRequest = activeRequest !== null;
        activeRequest?.abort();

        // Start a keepalive stop before pagehide returns, then order any later commands behind it.
        const immediate = request('/stop', current, true);
        const operation = Promise.all([
            previous,
            immediate,
        ]).then(async () => {
            if (hadActiveRequest && current === generation) await request('/stop', current, true);
        });
        queue = operation.catch(() => {});

        return operation;
    };

    return {
        play : track => schedule(`/play/${encodeURIComponent(track)}?loop=false`),
        stop : immediate => immediate ? stopImmediately() : schedule('/stop'),
    };
};

export const timerAudio = createTimerAudio();
