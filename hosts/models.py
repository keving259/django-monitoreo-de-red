from django.db import models
from django.conf import settings
from django.core.validators import RegexValidator

# Create your models here.
class Host(models.Model):
    nombre = models.CharField(max_length=100)
    hostname = models.CharField(
            max_length=63,
            validators=[
                RegexValidator(
                    regex=r'^[A-Za-z][A-Za-z0-9-]{0,61}[A-Za-z0-9]$'
                )
            ]
        )
    ip_address = models.GenericIPAddressField(protocol='IPv4', unique=True)
    puerto = models.IntegerField()
    intervalo_chequeo = models.TimeField()
    propietario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='hosts'
    )
    activo = models.BooleanField(default=True)
    