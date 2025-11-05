from time import sleep

from fastapi import APIRouter
from sht20 import SHT20

RETRIES = 10

router = APIRouter(prefix='/api/v1/sensors', tags=['sensor'])

try:
    sensor = SHT20(1, SHT20.TEMP_RES_14bit)
except OSError:
    sensor = None


@router.get('/temperature', summary='Get temperature in Celsius')
def get_temperature() -> float:
    if sensor is None:
        raise OSError('Sensor not initialised')

    for _ in range(RETRIES):
        try:
            return round(sensor.read_temp(), 2)
        except OSError:
            sleep(0.2)

    raise OSError('Failed to read temperature after multiple attempts')


@router.get('/humidity', summary='Get relative humidity in %')
def get_humidity() -> float:
    if sensor is None:
        raise OSError('Sensor not initialised')

    for _ in range(RETRIES):
        try:
            return round(sensor.read_humid(), 2)
        except OSError:
            sleep(0.2)

    raise OSError('Failed to read humidity after multiple attempts')
