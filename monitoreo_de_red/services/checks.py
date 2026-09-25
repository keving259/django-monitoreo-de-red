from dataclasses import dataclass
from typing import Optional
import platform
import subprocess
import re
from statistics import median

@dataclass
class CheckResult:
    estado: str
    tiempo_respuesta_ms: Optional[int]
    error: Optional[str] = None
    
def check_host(host):
    pass

def ping(host):
    param = '-n' if platform.system().lower() == 'windows' else '-c'
    cmd = ['ping', param, '4', host]
    
    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True
    )
    
    output = result.stdout
    
    times = re.findall(r'tiempo[=<]\s*(\d+)\s*m', output, re.IGNORECASE)
    times = [int(t) for t in times]
    
    if times:
        return {
            'estado' : 'up',
            'tiempo' : median(times)
        }
    else:
        return {
            'estado' : 'timeout',
            'tiempo' : None
        }


def _check_http(host):
    pass

def _check_socket(host):
    pass
