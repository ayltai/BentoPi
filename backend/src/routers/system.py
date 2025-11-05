from subprocess import run

from fastapi import APIRouter

router = APIRouter(prefix='/api/v1/system', tags=['system'])


@router.get('/cpu/temperature', summary='Get CPU temperature in Celsius')
def get_cpu_temperature() -> float:
    """Get CPU temperature in Celsius."""
    with open('/sys/class/thermal/thermal_zone0/temp', 'r', encoding='utf-8') as file:
        temp = file.readline().strip()

        return round(int(temp) / 1000.0, 1)


@router.get('/cpu/voltage', summary='Get CPU voltage in Volts')
def get_cpu_voltage() -> float:
    result = run([
        'vcgencmd',
        'measure_volts',
        'core',
    ], capture_output=True, text=True, check=True)

    output = result.stdout.strip()

    return float(output.replace('volt=', '').replace('V', ''))


@router.get('/cpu/frequency', summary='Get CPU frequency in MHz')
def get_cpu_frequency() -> int:
    with open('/sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq', 'r', encoding='utf-8') as file:
        freq = file.readline().strip()

        return round(int(freq) // 1000.0)


@router.get('/mem/total', summary='Get total memory in MB')
def get_total_memory() -> int:
    with open('/proc/meminfo', 'r', encoding='utf-8') as file:
        meminfo   = file.readlines()
        mem_total = int(meminfo[0].split()[1])

        return round(mem_total // 1024)


@router.get('/mem/usage', summary='Get memory usage in percentage')
def get_memory_usage_percentage() -> int:
    with open('/proc/meminfo', 'r', encoding='utf-8') as file:
        meminfo   = file.readlines()
        mem_total = int(meminfo[0].split()[1])
        mem_free  = int(meminfo[1].split()[1])
        buffers   = int(meminfo[3].split()[1])
        cached    = int(meminfo[4].split()[1])
        mem_used  = mem_total - (mem_free + buffers + cached)

        return round((mem_used / mem_total) * 100)


@router.get('/disk/total', summary='Get total disk space in MB')
def get_total_disk_space() -> float:
    result = run([
        'df',
        '/',
    ], capture_output=True, text=True, check=True)

    output         = result.stdout.strip().split('\n')[1]
    total_space_kb = output.split()[1]

    return int(total_space_kb) / 1024 / 1024


@router.get('/disk/usage', summary='Get disk usage in percentage')
def get_disk_usage_percentage() -> int:
    result = run([
        'df',
        '/',
    ], capture_output=True, text=True, check=True)

    output           = result.stdout.strip().split('\n')[1]
    usage_percentage = output.split()[4]

    return int(usage_percentage.replace('%', ''))
