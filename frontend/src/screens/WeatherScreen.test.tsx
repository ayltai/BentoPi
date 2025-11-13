import { render, } from '../utils/test';
import { WeatherScreen, } from './WeatherScreen';

vi.mock('../apis', async importOriginal => ({
    ...await importOriginal(),
    useGetWeatherQuery     : () => ({
        data  : {
            currently : {
                weatherCode : 0,
                isDay       : 1,
                temperature : 20,
                humidity    : 50,
                windSpeed   : 5,
            },
            daily     : [
                {
                    temperatureMax           : 25,
                    temperatureMin           : 15,
                    time                     : 1234567890,
                    weatherCode              : 0,
                    precipitation            : 0,
                    precipitationProbability : 0,
                }, {
                    temperatureMax           : 24,
                    temperatureMin           : 14,
                    time                     : 1234567891,
                    weatherCode              : 0,
                    precipitation            : 0,
                    precipitationProbability : 0,
                },
            ],
            hourly    : [
                {
                    time                     : 1234567890,
                    weatherCode              : 0,
                    isDay                    : 1,
                    temperature              : 20,
                    precipitation            : 0,
                    precipitationProbability : 0,
                }, {
                    time                     : 1234567891,
                    weatherCode              : 0,
                    isDay                    : 1,
                    temperature              : 21,
                    precipitation            : 0,
                    precipitationProbability : 0,
                }, {
                    time                     : 1234567892,
                    weatherCode              : 0,
                    isDay                    : 1,
                    temperature              : 22,
                    precipitation            : 0,
                    precipitationProbability : 0,
                }, {
                    time                     : 1234567893,
                    weatherCode              : 0,
                    isDay                    : 1,
                    temperature              : 23,
                    precipitation            : 0,
                    precipitationProbability : 0,
                }, {
                    time                     : 1234567894,
                    weatherCode              : 0,
                    isDay                    : 1,
                    temperature              : 24,
                    precipitation            : 0,
                    precipitationProbability : 0,
                },
            ],
        },
        error : undefined,
    }),
    useGetRandomPhotoQuery : () => ({
        data  : 'https://example.com/photo.jpg',
        error : undefined,
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation : () => ({
        t : (key : string) => key,
    }),
}));

describe('<WeatherScreen />', () => {
    it('renders weather summary', () => {
        const { getByText, } = render(<WeatherScreen />);

        expect(getByText(/weather_code_0/)).toBeInTheDocument();
        expect(getByText(/20°/)).toBeInTheDocument();
        expect(getByText(/50%/)).toBeInTheDocument();
    });

    it('renders hourly and daily forecast', () => {
        const { getAllByText, } = render(<WeatherScreen />);

        expect(getAllByText(/°/).length).toBeGreaterThan(1);
    });
});
