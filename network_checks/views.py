from django.shortcuts import render

# Create your views here.
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from network_checks.services.checks import check_all_hosts
from rest_framework import generics
from .models import Chequeo, Alerta
from monitoreo_de_red.serializers import CheckSerializer, AlertSerializer
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import ensure_csrf_cookie
from monitoreo_de_red.permissions import CanExecuteChecks
from rest_framework import status

@api_view(['POST'])
@permission_classes([IsAuthenticated, CanExecuteChecks])
def trigger_check(request):
    check_all_hosts()
    
    return Response({'status': 'Chequeo ejecutado'}, status=status.HTTP_200_OK)

class CheckListView(generics.ListAPIView):
    queryset = Chequeo.objects.select_related('host').order_by('-fecha_hora')
    serializer_class = CheckSerializer

@login_required(login_url='/login/')
@ensure_csrf_cookie
def checks(request):
    return render(request, 'checks.html')

class AlertListView(generics.ListAPIView):
    queryset = Alerta.objects.select_related('chequeo').order_by('-fecha_creacion')
    serializer_class = AlertSerializer

@login_required(login_url='/login/')
@ensure_csrf_cookie
def alerts(request):
    return render(request, 'alerts.html')
