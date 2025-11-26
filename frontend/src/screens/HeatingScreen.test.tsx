import { render, } from '../utils/test';
import { HeatingScreen, } from './HeatingScreen';

const mockUseGetDevicesQuery      = vi.fn();
const mockUseGetTelemetryQuery    = vi.fn();
const mockUseGetCurrentStateQuery = vi.fn();

vi.mock('../apis', async (importOriginal) => ({
    ...(await importOriginal<any>()),
    useGetConfigurationsQuery : () => ({
        data  : {
            thresholdOn      : 18,
            thresholdOff     : 22,
            decisionStrategy : 'min',
        },
        error : undefined,
    }),
    useGetDevicesQuery        : () => mockUseGetDevicesQuery(),
    useGetTelemetryQuery      : () => mockUseGetTelemetryQuery(),
    useGetCurrentStateQuery   : () => mockUseGetCurrentStateQuery(),
}));

vi.mock('react-gauge-component', async (importOriginal) => ({
    ...(await importOriginal<any>()),
    GaugeComponent : () => <div data-testid="mock-gauge" />,
}));

describe('<HeatingScreen />', () => {
    beforeEach(() => {
        mockUseGetDevicesQuery.mockReset();
        mockUseGetTelemetryQuery.mockReset();
        mockUseGetCurrentStateQuery.mockReset();

        mockUseGetDevicesQuery.mockReturnValue({
            data  : [
                {
                    id          : '1',
                    displayName : 'Living Room',
                    mode        : 'sensor',
                    lastSeen    : '2025-11-21T12:00:00Z',
                }, {
                    id          : '2',
                    displayName : 'Heater',
                    mode        : 'actuator',
                    lastSeen    : '2025-11-21T12:00:00Z',
                },
            ],
            error : undefined,
        });

        mockUseGetTelemetryQuery.mockReturnValue({
            data  : [
                {
                    deviceId   : '1',
                    timestamp  : '2025-11-21T12:00:00Z',
                    sensorType : 'temperature',
                    value      : 19,
                }, {
                    deviceId   : '1',
                    timestamp  : '2025-11-21T12:00:00Z',
                    sensorType : 'humidity',
                    value      : 40,
                },
            ],
            error : undefined,
        });

        mockUseGetCurrentStateQuery.mockReturnValue({
            data  : 1,
            error : undefined,
        });
    });

    it('renders temperature and humidity for each sensor', () => {
        const { getByText, } = render(<HeatingScreen />);

        expect(getByText('Living Room')).toBeInTheDocument();
        expect(getByText('19.0°C')).toBeInTheDocument();
        expect(getByText('40%')).toBeInTheDocument();
    });

    it('shows heating status as ON', () => {
        const { getByText, } = render(<HeatingScreen />);

        expect(getByText('label_heating_status_on')).toBeInTheDocument();
    });

    it('shows heating status as OFF if currentStateData is 0', () => {
        mockUseGetCurrentStateQuery.mockReturnValue({
            data  : 0,
            error : undefined,
        });

        const { getByText, } = render(<HeatingScreen />);

        expect(getByText('label_heating_status_off')).toBeInTheDocument();
    });
});
