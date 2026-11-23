export type TaskTimerMessage = {
    title     : string,
    timeLimit : number,
};

export const isValidTimerMinutes = (value : unknown) : value is number => typeof value === 'number' && Number.isFinite(value) && value > 0 && value * 60_000 <= Number.MAX_SAFE_INTEGER;

export const isTaskTimerMessage = (message : Record<string, unknown>) : message is Record<string, unknown> & TaskTimerMessage => typeof message.title === 'string' && message.title.trim().length > 0 && isValidTimerMinutes(message.timeLimit);

export const getTaskReply = (message : Record<string, unknown>) => {
    const { replyTo, requestId, } = message;

    return typeof replyTo === 'string' && replyTo.trim().length > 0 && typeof requestId === 'string' && requestId.trim().length > 0 ? {
        replyTo,
        requestId,
    } : null;
};
