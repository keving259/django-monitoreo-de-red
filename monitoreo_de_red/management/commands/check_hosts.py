from django.core.management.base import BaseCommand
from network_checks.models import Host, Chequeo, Alerta
from monitoreo_de_red.services.checks import check_host

class Command(BaseCommand):
    def handle(self, *args, **options):
        for host in Host.objects.filter(activo=True):
            resultado = check_host(host)
            chequeo = Chequeo.objects.create(
                host=host,
                estado=resultado.estado,
                tiempo_respuesta_ms=resultado.tiempo_respuesta_ms,
            )
            if resultado.estado != 'up':
                Alerta.objects.create(
                    chequeo=chequeo,
                    nivel='critical',
                    mensaje=resultado.mensaje_error or 'Host no disponible',
                )