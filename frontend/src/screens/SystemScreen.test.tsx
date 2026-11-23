import { act, cleanup, createStore, fireEvent, render, screen, } from '../utils/test';
import { SystemScreen, } from './SystemScreen';
import { TimerScreen, } from './TimerScreen';

vi.mock('../apis', async importOriginal => ({
    ...(await importOriginal<any>()),
    useGetCpuTemperatureQuery : () => ({
        data  : 55.5,
        error : undefined,
    }),
    useGetCpuVoltageQuery     : () => ({
        data  : 1.2345,
        error : undefined,
    }),
    useGetCpuFrequencyQuery   : () => ({
        data  : 1500,
        error : undefined,
    }),
    useGetMemoryTotalQuery   : () => ({
        data  : 8192,
        error : undefined,
    }),
    useGetMemoryUsageQuery   : () => ({
        data  : 82,
        error : undefined,
    }),
    useGetDiskTotalQuery     : () => ({
        data  : 256000,
        error : undefined,
    }),
    useGetDiskUsageQuery     : () => ({
        data  : 38,
        error : undefined,
    }),
}));

describe('<SystemScreen />', () => {
    it('renders CPU stats', () => {
        const { getByText, } = render(<SystemScreen />);

        expect(getByText('CPU Temperature')).toBeInTheDocument();
        expect(getByText('55.5 °C')).toBeInTheDocument();
        expect(getByText('CPU Voltage')).toBeInTheDocument();
        expect(getByText('1.2345 V')).toBeInTheDocument();
        expect(getByText('CPU Frequency')).toBeInTheDocument();
        expect(getByText('1500 MHz')).toBeInTheDocument();
    });

    it('requests the sound chosen in system settings when the countdown ends', async () => {
        const store = createStore();
        const fetchMock = vi.fn<(url : RequestInfo | URL) => Promise<Response>>(async () => new Response(null, {
            status : 200,
        }));
        let now = 0;

        localStorage.clear();
        vi.useFakeTimers();
        vi.spyOn(performance, 'now').mockImplementation(() => now);
        vi.stubGlobal('fetch', fetchMock);
        vi.stubGlobal('ResizeObserver', class {
            observe() {}
            unobserve() {}
            disconnect() {}
        });

        try {
            const settings = render(<SystemScreen />, {
                store,
            });
            const selection = screen.getByRole('combobox', {
                name : 'label_system_alarm_sound',
            });

            fireEvent.mouseDown(selection);
            fireEvent.click(screen.getByTitle('Bedside Clock Alarm'));
            expect(store.getState().alarm.track).toBe('Bedside Clock Alarm');

            settings.unmount();
            render(<TimerScreen />, {
                store,
            });
            fireEvent.click(screen.getByRole('button', {
                name : 'action_timer_start',
            }));

            now = 30 * 60_000;
            await act(async () => vi.advanceTimersByTime(250));

            expect(fetchMock.mock.calls.map(([ url, ]) => String(url)).filter(url => url.includes('/music/play/'))).toEqual([
                expect.stringContaining('/music/play/bedside-clock-alarm?loop=false'),
            ]);
        } finally {
            await act(async () => cleanup());
            vi.useRealTimers();
            vi.restoreAllMocks();
            vi.unstubAllGlobals();
            localStorage.clear();
        }
    });
});
