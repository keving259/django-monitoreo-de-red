from django.shortcuts import render

# Create your views here.
import os 
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from network_checks.services.checks import check_all_hosts
from rest_framework import generics
from .models import Chequeo
from monitoreo_de_red.serializers import CheckSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def trigger_check(request):
    if request.GET.get('token') != os.environ.get('CHECK_TRIGGER_TOKEN'):
        return JsonResponse({'error': 'No autorizado'}, status=403)

    check_all_hosts()
    return JsonResponse({'status': 'Chequeo ejecutado'})

class CheckListView(generics.ListAPIView):
    queryset = Chequeo.objects.select_related('host').order_by('-fecha_hora')
    serializer_class = CheckSerializer

def checks(request):
    return render(request, 'checks.html')
