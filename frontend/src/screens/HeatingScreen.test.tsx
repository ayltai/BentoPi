import type { Entity, Thermostat, } from '../models';
import { render, } from '../utils/test';
import { HeatingScreen, } from './HeatingScreen';

const mockUseGetTelemetryQuery = vi.fn();
const mockUseGetThermostatQuery = vi.fn();

vi.mock('../apis', async importOriginal => ({
    ...await importOriginal<typeof import('../apis')>(),
    useGetTelemetryQuery         : () => mockUseGetTelemetryQuery(),
    useGetThermostatQuery        : () => mockUseGetThermostatQuery(),
    useSetTargetTemperatureMutation : () => [
        vi.fn(),
        {
            isLoading : false,
            error     : undefined,
        },
    ],
}));

vi.mock('react-gauge-component', () => ({
    GaugeComponent : () => <div data-testid='mock-gauge' />,
}));

const sensors : Entity[] = [
    {
        entityId   : 'sensor.living_area_climate_living_area_temperature',
        state      : '19',
        attributes : {
            deviceClass : 'temperature',
        },
    }, {
        entityId   : 'sensor.living_area_climate_living_area_humidity',
        state      : '40',
        attributes : {
            deviceClass : 'humidity',
        },
    },
];

const boiler : Entity = {
    entityId   : 'input_boolean.desired_boiler_switch_state',
    state      : 'on',
    attributes : {},
};

const thermostat : Thermostat = {
    entityId   : 'climate.entrance_climate_actuator_entrance_thermostat',
    state      : 'heat',
    attributes : {
        minTemp            : 5,
        maxTemp            : 40,
        currentTemperature : 19,
        temperature        : 21,
    },
};

describe('<HeatingScreen />', () => {
    beforeEach(() => {
        mockUseGetTelemetryQuery.mockReturnValue({
            data  : [ ...sensors, boiler, ],
            error : undefined,
        });
        mockUseGetThermostatQuery.mockReturnValue({
            data  : thermostat,
            error : undefined,
        });
    });

    it('renders temperature and humidity for each sensor', () => {
        const { getByText, } = render(<HeatingScreen />);

        expect(getByText('sensor.living_area_climate_living_area')).toBeInTheDocument();
        expect(getByText('19.0°C')).toBeInTheDocument();
        expect(getByText('40%')).toBeInTheDocument();
    });

    it('shows heating status as ON', () => {
        const { getByText, } = render(<HeatingScreen />);

        expect(getByText('label_heating_status_on')).toBeInTheDocument();
    });

    it('shows heating status as OFF when the boiler switch is off', () => {
        mockUseGetTelemetryQuery.mockReturnValue({
            data  : [ ...sensors, {
                ...boiler,
                state : 'off',
            }, ],
            error : undefined,
        });

        const { getByText, } = render(<HeatingScreen />);

        expect(getByText('label_heating_status_off')).toBeInTheDocument();
    });
});
