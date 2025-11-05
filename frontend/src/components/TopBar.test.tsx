import { render, } from '../utils/test';
import { TopBar, } from './TopBar';

vi.mock('../apis', async (importOriginal) => ({
    ...await importOriginal(),
    useGetTemperatureQuery : () => ({
        data  : 21.5,
        error : undefined,
    }),
    useGetHumidityQuery    : () => ({
        data  : 55.2,
        error : undefined,
    }),
}));

describe('<TopBar />', () => {
    it('renders temperature and humidity', () => {
        const { getByText, } = render(<TopBar />);

        expect(getByText(/22°/)).toBeInTheDocument();
        expect(getByText(/55%/)).toBeInTheDocument();
    });
});
