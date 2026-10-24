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
        fields = '__all__'
        read_only_fields = ['propietario']
        
    def validate_intervalo_chequeo(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "El intervalo debe ser mayor que cero."
            )
        
        return value
    
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
    nombre_host = serializers.CharField(source='host.nombre', read_only=True)
    class Meta:
        model = Chequeo
        fields = ['id', 'host', 'fecha_hora', 'estado', 'tiempo_respuesta_ms']
        read_only_fields = fields

class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alerta
        fields = ['chequeo', 'nivel', 'mensaje', 'resuelta', 'fecha_creacion']