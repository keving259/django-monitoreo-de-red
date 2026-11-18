import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from .services.checks import ejecutar_revision_hosts

class CheckHostsCronView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        token_recibido = request.GET.get('token')
        token_esperado = os.environ.get('CRON_SECRET_TOKEN')
        
        if not token_esperado or token_recibido != token_esperado:
            return Response({'error': "No autorizado"}, status=status.HTTP_403_FORBIDDEN)
        
        result = ejecutar_revision_hosts()
        return Response({'status': "ok", 'hosts_revisados': result})
