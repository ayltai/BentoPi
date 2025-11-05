import { render, } from '../utils/test';
import { HomeScreen, } from './HomeScreen';

describe('<HomeScreen />', () => {
    it('renders all app buttons', () => {
        const { getByText, } = render(<HomeScreen />);

        expect(getByText('Weather')).toBeInTheDocument();
        expect(getByText('News')).toBeInTheDocument();
        expect(getByText('Disruptions')).toBeInTheDocument();
        expect(getByText('Security')).toBeInTheDocument();
        expect(getByText('System')).toBeInTheDocument();
    });
});
