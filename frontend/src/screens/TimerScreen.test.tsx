import { act, cleanup, fireEvent, render, screen, } from '../utils/test';
import { TimerScreen, } from './TimerScreen';

vi.mock('react-i18next', () => ({
    useTranslation : () => ({
        t    : (key : string) => key,
        i18n : {
            language : 'en',
        },
    }),
}));

let now = 0;

const fetchMock = vi.fn<(url : RequestInfo | URL) => Promise<Response>>(async () => new Response(null, {
    status : 200,
}));

const advance = async (milliseconds : number) => {
    now += milliseconds;

    await act(async () => {
        vi.advanceTimersByTime(1000);
    });
};

const clickAdjustment = (amount : number) => {
    fireEvent.click(screen.getByText(amount > 0 ? `+${amount}` : String(amount)));
};

const playbackRequests = (track : string) => fetchMock.mock.calls.filter(([ url, ]) => String(url).includes(`/music/play/${track}`));

beforeEach(() => {
    now = 0;
    fetchMock.mockClear();
    localStorage.clear();
    vi.useFakeTimers();
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    vi.stubGlobal('fetch', fetchMock);
});

afterEach(async () => {
    await act(async () => cleanup());
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    localStorage.clear();
});

describe('<TimerScreen />', () => {
    it('sets a minimum five-minute countdown and pauses, resumes and resets it', async () => {
        render(<TimerScreen />);

        expect(screen.getByText('30:00')).toBeInTheDocument();

        clickAdjustment(15);
        expect(screen.getByText('45:00')).toBeInTheDocument();
        clickAdjustment(-15);
        clickAdjustment(-15);
        clickAdjustment(-10);

        expect(screen.getByText('5:00')).toBeInTheDocument();
        expect(screen.getByText('-5').closest('button')).toBeDisabled();

        fireEvent.click(screen.getByRole('button', {
            name : /start/i,
        }));
        await advance(65_000);
        expect(screen.getByText('3:55')).toBeInTheDocument();
        expect(playbackRequests('milestone-chime')).toHaveLength(0);

        fireEvent.click(screen.getByRole('button', {
            name : /pause/i,
        }));
        await advance(120_000);
        expect(screen.getByText('3:55')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', {
            name : /resume/i,
        }));
        await advance(1_000);
        expect(screen.getByText('3:54')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', {
            name : /reset/i,
        }));
        expect(screen.getByText('30:00')).toBeInTheDocument();
    });

    it('restores an interrupted countdown paused at its saved remainder', async () => {
        const first = render(<TimerScreen />);

        fireEvent.click(screen.getByRole('button', {
            name : /start/i,
        }));
        await advance(120_000);
        expect(screen.getByText('28:00')).toBeInTheDocument();
        act(() => window.dispatchEvent(new Event('pagehide')));
        first.unmount();
        render(<TimerScreen />);

        expect(screen.getByText('label_timer_countdown')).toBeInTheDocument();
        expect(screen.getByText('28:00')).toBeInTheDocument();
        expect(screen.getByRole('button', {
            name : /resume/i,
        })).toBeInTheDocument();

        await advance(60_000);
        expect(screen.getByText('28:00')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', {
            name : /resume/i,
        }));
        await advance(60_000);
        expect(screen.getByText('27:00')).toBeInTheDocument();
    });

    it('pauses when the page becomes hidden', async () => {
        render(<TimerScreen />);

        fireEvent.click(screen.getByRole('button', {
            name : /start/i,
        }));
        await advance(60_000);
        expect(screen.getByText('29:00')).toBeInTheDocument();

        vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
        vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
        act(() => document.dispatchEvent(new Event('visibilitychange')));

        expect(screen.getByRole('button', {
            name : /resume/i,
        })).toBeInTheDocument();
        await advance(60_000);
        expect(screen.getByText('29:00')).toBeInTheDocument();
    });

    it('reports unavailable recovery storage without preventing a new countdown', async () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('Storage unavailable');
        });
        const logError = vi.spyOn(console, 'error').mockImplementation(() => {});

        render(<TimerScreen />);

        expect(screen.getByText(/storage|save/i)).toBeInTheDocument();
        expect(logError).toHaveBeenCalled();

        fireEvent.click(screen.getByRole('button', {
            name : /start/i,
        }));
        await advance(60_000);
        expect(screen.getByText('29:00')).toBeInTheDocument();
    });

    it('reports audio failures while the visual countdown keeps running', async () => {
        fetchMock.mockResolvedValueOnce(new Response(null, {
            status : 500,
        }));
        const logError = vi.spyOn(console, 'error').mockImplementation(() => {});

        render(<TimerScreen />);

        await act(async () => {
            fireEvent.click(screen.getByRole('button', {
                name : /start/i,
            }));
        });

        expect(screen.getByText(/audio|sound/i)).toBeInTheDocument();
        expect(logError).toHaveBeenCalled();
        await advance(60_000);
        expect(screen.getByText('29:00')).toBeInTheDocument();
    });

    it('plays only the final alarm if a delayed tick skips the five-minute mark', async () => {
        render(<TimerScreen />);

        clickAdjustment(-15);
        clickAdjustment(-5);
        fireEvent.click(screen.getByRole('button', {
            name : /start/i,
        }));

        await advance(11 * 60_000);
        expect(screen.getByText('0:00')).toBeInTheDocument();
        expect(playbackRequests('milestone-chime')).toHaveLength(0);
        expect(playbackRequests('alarm-beep')).toHaveLength(1);
    });

    it('finishes rather than pausing when time expires before the next tick', async () => {
        render(<TimerScreen />);

        clickAdjustment(-15);
        clickAdjustment(-10);
        fireEvent.click(screen.getByRole('button', {
            name : /start/i,
        }));

        now += 5 * 60_000;
        await act(async () => {
            fireEvent.click(screen.getByRole('button', {
                name : /pause/i,
            }));
        });

        expect(screen.getByText('0:00')).toBeInTheDocument();
        expect(screen.getByText(/time.up/i)).toBeInTheDocument();
        expect(playbackRequests('alarm-beep')).toHaveLength(1);
    });

    it('plays the five-minute cue and final alarm once and keeps time up visible', async () => {
        render(<TimerScreen />, {
            preloadedState : {
                alarm : {
                    track : 'Bedside Clock Alarm',
                },
            },
        });

        clickAdjustment(-15);
        clickAdjustment(-5);
        fireEvent.click(screen.getByRole('button', {
            name : /start/i,
        }));

        await advance(5 * 60_000);
        expect(screen.getByText('5:00')).toBeInTheDocument();
        expect(playbackRequests('milestone-chime')).toHaveLength(1);
        const progress = screen.getByRole('progressbar');
        expect(Number(progress.getAttribute('value')) / Number(progress.getAttribute('max'))).toBeCloseTo(0.5);

        fireEvent.click(screen.getByRole('button', {
            name : /pause/i,
        }));
        fireEvent.click(screen.getByRole('button', {
            name : /resume/i,
        }));
        await advance(60_000);
        expect(playbackRequests('milestone-chime')).toHaveLength(1);

        await advance(4 * 60_000);
        expect(screen.getByText('0:00')).toBeInTheDocument();
        expect(screen.getByText(/time.up/i)).toBeInTheDocument();
        expect(playbackRequests('bedside-clock-alarm')).toHaveLength(1);
        expect(String(playbackRequests('bedside-clock-alarm')[0][0])).toContain('loop=false');

        await advance(60_000);
        expect(screen.getByText(/time.up/i)).toBeInTheDocument();
        expect(playbackRequests('bedside-clock-alarm')).toHaveLength(1);

        const stopCount = fetchMock.mock.calls.filter(([ url, ]) => String(url).endsWith('/music/stop')).length;
        await act(async () => {
            fireEvent.click(screen.getByRole('button', {
                name : /new/i,
            }));
        });
        expect(screen.getByText('30:00')).toBeInTheDocument();
        expect(screen.queryByText(/time.up/i)).not.toBeInTheDocument();
        expect(fetchMock.mock.calls.filter(([ url, ]) => String(url).endsWith('/music/stop'))).toHaveLength(stopCount + 1);
    });
});
