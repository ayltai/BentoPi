import { render, } from '../utils/test';
import { NewsScreen, } from './NewsScreen';

vi.mock('../apis', async (importOriginal) => ({
    ...await importOriginal(),
    useGetNewsQuery : () => ({
        data  : [
            {
                title       : 'Headline',
                description : 'Description',
            },
        ],
        error : undefined,
    }),
}));

vi.mock('date-fns', async (importOriginal) => ({
    ...await importOriginal(),
    intlFormatDistance : () => '5 minutes ago',
}));

describe('<NewsScreen />', () => {
    it('renders news list', () => {
        const { getByText, } = render(<NewsScreen />);

        expect(getByText('Headline')).toBeInTheDocument();
        expect(getByText('Description')).toBeInTheDocument();
    });
});
