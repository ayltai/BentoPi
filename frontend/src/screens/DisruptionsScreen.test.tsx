import { render, } from '../utils/test';
import { DisruptionsScreen, } from './DisruptionsScreen';

vi.mock('../apis', async (importOriginal) => ({
    ...await importOriginal(),
    useGetDisruptionsQuery : () => ({
        data  : [
            {
                description : 'Test disruption',
                closureText : 'Closed',
                category    : 'Line',
                type        : 'plannedWork',
            },
        ],
        error : undefined,
    }),
}));

describe('<DisruptionsScreen />', () => {
    it('renders disruptions list', () => {
        const { getByText, } = render(<DisruptionsScreen />);

        expect(getByText('Test disruption')).toBeInTheDocument();
    });
});
