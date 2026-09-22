from django.db import models
from hosts.models import Host

# Create your models here.
class Chequeo(models.Model):
    host = models.ForeignKey(
        'hosts.Host',
        on_delete=models.CASCADE
    )
    fecha_hora = models.DateTimeField()

    class Estado(models.TextChoices):
        UP = 'up', 'Up'
        DOWN = 'down', 'Down'
        TIMEOUT = 'timeout', 'Timeout'
    
    estado = models.CharField(
        max_length=7,
        choices=Estado.choices
    )
    tiempo_respuesta_ms = models.IntegerField()

class Alerta(models.Model):
    chequeo = models.ForeignKey(
        Chequeo,
        on_delete=models.CASCADE
    )
    
    class Nivel(models.TextChoices):
        WARNING = 'warning', 'Warning'
        CRITICAL = 'critical', 'Critical'
    nivel = models.CharField(
        max_length=8,
        choices=Nivel.choices
    )
    mensaje = models.TextField()
    resuelta = models.BooleanField()
    fecha_creacion = models.DateTimeField()
