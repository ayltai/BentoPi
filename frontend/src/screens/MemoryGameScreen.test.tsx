import { render, fireEvent, } from '../utils/test';
import { MemoryGameScreen, } from './MemoryGameScreen';

describe('<MemoryGameScreen />', () => {
    it('renders the correct number of cards', () => {
        const { getAllByAltText, } = render(<MemoryGameScreen />);

        expect(getAllByAltText('card')).toHaveLength(12);
    });

    it('renders the restart button', () => {
        const { getByText, } = render(<MemoryGameScreen />);

        expect(getByText('action_restart')).toBeInTheDocument();
    });

    it('flips a card when clicked', () => {
        const { getAllByAltText, } = render(<MemoryGameScreen />);

        const card          = getAllByAltText('card')[0];
        const cardContainer = card.closest('.card-front')?.parentElement;

        expect(cardContainer).not.toHaveClass('flipped');

        fireEvent.click(cardContainer!);
        expect(cardContainer).toHaveClass('flipped');
    });
});
