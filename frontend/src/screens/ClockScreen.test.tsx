import { render, } from '../utils/test';
import { ClockScreen, } from './ClockScreen';

describe('<ClockScreen />', () => {
    it('renders date and time', () => {
        const { getByText, } = render(<ClockScreen />);

        expect(getByText(/^[A-Za-z]{3},/)).toBeInTheDocument();
    });
});
