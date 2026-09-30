from django.shortcuts import render

# Create your views here.
import os 
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from network_checks.services.checks import check_all_hosts

@api_view(['GET'])
@permission_classes([AllowAny])
def trigger_check(request):
    if request.GET.get('token') != os.environ.get('CHECK_TRIGGER_TOKEN'):
        return JsonResponse({'error': 'No autorizado'}, status=403)

    check_all_hosts()
    return JsonResponse({'status': 'Chequeo ejecutado'})
