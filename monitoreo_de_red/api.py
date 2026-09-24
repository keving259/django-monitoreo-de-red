from hosts.models import Host
from network_checks.models import Alerta, Chequeo
from rest_framework import viewsets, permissions
from .serializers import HostSerializer, CheckSerializer, AlertSerializer
from .permissions import HostPermission

class HostViewSet(viewsets.ModelViewSet):
    queryset = Host.objects.all()
    permission_classes = [permissions.IsAuthenticated, HostPermission]
    serializer_class = HostSerializer
    
    def perform_create(self, serializer):
        serializer.save(propietario=self.request.user, created_by=self.request.user)

class CheckViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Chequeo.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CheckSerializer

class AlertViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Alerta.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AlertSerializer