from dataclasses import dataclass
from typing import Optional
import platform
import subprocess
from statistics import median
import socket
import time
from hosts.models import Host
from network_checks.models import Chequeo, Alerta

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
    

def ping(host, count=4, timeout=1):
    times = []
    
    is_windows = platform.system().lower() == 'windows'
    count_param = '-n' if is_windows else '-c'
    timeout_param = '-w' if is_windows else '-W'
    timeout_value = str(int(timeout * 1000)) if is_windows else str(timeout)
    
    for _ in range(count):
        inicio = time.monotonic()
        
        try:
            result = subprocess.run(
                ['ping', count_param, '1', timeout_param, timeout_value, host],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                timeout=timeout+1
            )
            
            if result.returncode == 0:
                times.append(
                    (time.monotonic() - inicio) * 1000
                )
        except (FileNotFoundError, subprocess.TimeoutExpired):
            pass
        
    if times:
        return {
            'estado' : 'up',
            'tiempo' : round(median(times), 2)
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
                error=f'El servicio en {host.ip_address}:{host.puerto} no respondió mediante HTTP'
            )
            
    except socket.timeout:
        return CheckResult(
            estado='timeout',
            tiempo_respuesta_ms=None,
            error=f'Timeout al conectar con {host.ip_address}:{host.puerto}'
        )
    
    except OSError as e:
        return CheckResult(
            estado='down',
            tiempo_respuesta_ms=None,
            error=f'Error al comprobar HTTP en {host.ip_address}:{host.puerto}: {e}'
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
            return CheckResult(estado='up', tiempo_resupuesta_ms=tiempo_ms)
        else:
            return CheckResult(
                estado='down',
                tiempo_respuesta_ms=None,
                error=f'No se puede establecer la conexión con {host.ip_address}:{host.puerto}'
            )
            
    except socket.timeout:
        return CheckResult(
            estado='timeout',
            tiempo_respuesta_ms=None,
            error=f'Tiempo al conectar con {host.ip_address}:{host.puerto}'
        )
    
    except OSError as e:
        return CheckResult(
            estado='down',
            tiempo_respuesta_ms=None,
            error=f'Error al comprobar el puerto en {host.ip_address}:{host.puerto}: {e}'
        )
        
    finally:
        sock.close()
    
def check_all_hosts():
    for host in Host.objects.filter(activo=True):
        result = check_host(host)
        check = Chequeo.objects.create(
            host=host,
            estado=result.estado,
            tiempo_respuesta_ms=result.tiempo_respuesta_ms
        )
        if result.estado == 'up':
            Alerta.objects.filter(chequeo__host=host, resuelta=False).update(resuelta=True)
        else:
            nivel = 'warning' if result.estado == 'timeout' else 'critical'
            Alerta.objects.create(chequeo=check, nivel=nivel, mensaje=result.error or 'Host no disponible')
