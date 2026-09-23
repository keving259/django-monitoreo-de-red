from hosts.models import Host
from network_checks.models import Alerta, Chequeo
from rest_framework import viewsets
from .serializers import HostSerializer, CheckSerializer, AlertSerializer

class HostViewSet(viewsets.ModelViewSet):
    queryset = Host.objects.all()
    serializer_class = HostSerializer

class CheckViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Chequeo.objects.all()
    serializer_class = CheckSerializer

class AlertViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Alerta.objects.all()
    serializer_class = AlertSerializer