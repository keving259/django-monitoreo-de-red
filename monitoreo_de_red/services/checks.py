from dataclasses import dataclass
from typing import Optional
import platform
import subprocess
import re
from statistics import median
import socket
import time

@dataclass
class CheckResult:
    estado: str
    tiempo_respuesta_ms: Optional[int]
    error: Optional[str] = None
    
def check_host(host):
    ping_result = ping(host.ip_address)
    result = CheckResult(estado=ping_result['estado'], tiempo_respuesta_ms=ping_result['tiempo'])
    
    if result.estado == 'up':
        if host.tipo_servicio in ('web', 'api'):
            return _check_http(host)
        else:
            return _check_socket(host)
        
    else:
        return result
    

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
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(2)
    
    try:
        inicio = time.time()
        sock.connect((host.ip_address, host.puerto))
        
        request = (
            f'GET / HTTP/1.1\r\n'
            f'Host: {host.ip_address}\r\n'
            f'Connection: close\r\n'
            f'\r\n'
        )
        
        sock.sendall(request.encode())
        response = sock.recv(4096).decode(errors='ignore')
        tiempo_ms = round((time.time() - inicio) * 1000)
        
        if response.startswith('HTTP/'):
            return CheckResult(estado='up', tiempo_respuesta_ms=tiempo_ms)
        else:
            return CheckResult(
                estado='down',
                tiempo_respuesta_ms=None,
                mensaje_error=f'El servicio en {host.ip_address}:{host.puerto} no respondió mediante HTTP'
            )
            
    except socket.timeout:
        return CheckResult(
            estado='timeout',
            tiempo_respuesta_ms=None,
            mensaje_error=f'Timeout al conectar con {host.ip_address}:{host.puerto}'
        )
    
    except OSError as e:
        return CheckResult(
            estado='down',
            tiempo_respuesta_ms=None,
            mensaje_error=f'Error al comprobar HTTP en {host.ip_address}:{host.puerto}: {e}'
        )
    
    finally:
        sock.close()

def _check_socket(host):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(2)
    
    try:
        inicio = time.time()
        result = sock.connect_ex((host.ip_address, host.puerto))
        tiempo_ms = round((time.time() - inicio) * 1000)
        
        if result == 0:
            return CheckResult(estado='up', tiempo_respuesta_ms=tiempo_ms)
        else:
            return CheckResult(
                estado='down',
                tiempo_respuesta_ms=None,
                mensaje_error=f'No se puede establecer la conexión con {host.ip_address}:{host.puerto}'
            )
            
    except socket.timeout:
        return CheckResult(
            estado='timeout',
            tiempo_respuesta_ms=None,
            mensaje_error=f'Tiempo al conectar con {host.ip_address}:{host.puerto}'
        )
    
    except OSError as e:
        return CheckResult(
            estado='down',
            tiempo_respuesta_ms=None,
            mensaje_error=f'Error al comprobar el puerto en {host.ip_address}:{host.puerto}: {e}'
        )
        
    finally:
        sock.close()
    
