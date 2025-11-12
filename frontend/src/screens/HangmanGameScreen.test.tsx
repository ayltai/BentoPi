import { render, fireEvent, } from '../utils/test';
import { HangmanGameScreen, } from './HangmanGameScreen';

describe('<HangmanGameScreen />', () => {
    it('renders the restart button', () => {
        const { getAllByText, } = render(<HangmanGameScreen />);

        expect(getAllByText('action_restart')[0]).toBeInTheDocument();
    });

    it('renders letter buttons', () => {
        const { getAllByRole, } = render(<HangmanGameScreen />);

        expect(getAllByRole('button', {
            name : /^[A-Z]$/,
        })).toHaveLength(26);
    });

    it('disables letter after guessing', () => {
        const { getByRole, } = render(<HangmanGameScreen />);

        const letterBtn = getByRole('button', {
            name : 'A',
        });

        fireEvent.click(letterBtn);

        expect(letterBtn).toBeDisabled();
    });
});
