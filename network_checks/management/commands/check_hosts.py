from django.core.management.base import BaseCommand
from network_checks.models import Host, Chequeo, Alerta
from network_checks.services.checks import check_host

class Command(BaseCommand):
    def handle(self, *args, **options):
        for host in Host.objects.filter(activo=True):
            resultado = check_host(host)
            chequeo = Chequeo.objects.create(
                host=host,
                estado=resultado.estado,
                tiempo_respuesta_ms=resultado.tiempo_respuesta_ms,
            )
            
            if resultado.estado == 'up':
                Alerta.objects.filter(chequeo__host=host, resuelta=False).update(resuelta=True)
            else:
                nivel = 'warning' if resultado.estado == 'timeout' else 'critical'
                Alerta.objects.create(
                    chequeo=chequeo,
                    nivel=nivel,
                    mensaje=resultado.error or 'Host no disponible'
                )