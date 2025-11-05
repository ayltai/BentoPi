import { render, } from '../utils/test';
import { Clock, } from './Clock';

describe('<Clock />', () => {
    it('renders current date and time', () => {
        const { getByText, } = render(<Clock />);

        expect(getByText(/^[A-Za-z]{3} /)).toBeInTheDocument();
    });
});
