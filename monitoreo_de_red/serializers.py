from rest_framework import serializers
from hosts.models import Host
from network_checks.models import Chequeo, Alerta
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

class HostSerializer(serializers.ModelSerializer):
    ultimo_chequeo = serializers.SerializerMethodField()
    
    class Meta:
        model = Host
        fields = ['id', 'nombre', 'hostname', 'ip_address', 'tipo_servicio', 'puerto', 'intervalo_chequeo', 'propietario', 'activo', 'ultimo_chequeo']
        read_only_fields = ['propietario']
    
    def get_ultimo_chequeo(self, obj):
        check = obj.chequeo_set.order_by('-fecha_hora').first()
        if check is None:
            return None
        return {
            'estado' : check.estado,
            'tiempo_respuesta_ms': check.tiempo_respuesta_ms,
            'fecha_hora': check.fecha_hora,
        }

class CheckSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chequeo
        fields = ['host', 'fecha_hora', 'estado', 'tiempo_respuesta_ms']

class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alerta
        fields = ['chequeo', 'nivel', 'mensaje', 'resuelta', 'fecha_creacion']