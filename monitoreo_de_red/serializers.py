from rest_framework import serializers
from hosts.models import Host
from network_checks.models import Chequeo, Alerta
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

class HostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Host
        fields = ['nombre', 'hostname', 'ip_address', 'tipo_servicio', 'puerto', 'intervalo_chequeo', 'propietario', 'activo']

class CheckSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chequeo
        fields = ['host', 'fecha_hora', 'estado', 'tiempo_respuesta_ms']

class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alerta
        fields = ['chequeo', 'nivel', 'mensaje', 'resuelta', 'fecha_creacion']