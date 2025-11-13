import { render, } from '../utils/test';
import { MastermindGameScreen, } from './MastermindGameScreen';

vi.mock('../states/mastermindSlice', async importOriginal => ({
    ...(await importOriginal<any>()),
    cyclePeg   : vi.fn(),
    makeGuess  : vi.fn(),
    pickColour : vi.fn(),
    reset      : vi.fn(),
    setCurrent : vi.fn(),
}));

describe('<MastermindGameScreen />', () => {
    it('renders restart, guess, and clear buttons', () => {
        const { getByText, } = render(<MastermindGameScreen />);

        expect(getByText('action_restart')).toBeInTheDocument();
        expect(getByText('action_guess')).toBeInTheDocument();
        expect(getByText('action_clear')).toBeInTheDocument();
    });

    it('renders secret code pegs', () => {
        const { getAllByRole, } = render(<MastermindGameScreen />);

        expect(getAllByRole('button')).not.toHaveLength(0);
    });

    it('guess button is disabled when pegs are not filled', () => {
        const { getAllByRole, } = render(<MastermindGameScreen />);

        const buttons = getAllByRole('button');
        expect(buttons[buttons.length - 2]).toBeDisabled();
    });

    it('clear button is disabled when all pegs are empty', () => {
        const { getAllByRole, } = render(<MastermindGameScreen />);

        const buttons = getAllByRole('button');
        expect(buttons[buttons.length - 1]).toBeDisabled();
    });
});
