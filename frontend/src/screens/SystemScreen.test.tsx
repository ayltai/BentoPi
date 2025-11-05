import { render, } from '../utils/test';
import { SystemScreen, } from './SystemScreen';

vi.mock('../apis', async (importOriginal) => ({
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
});
