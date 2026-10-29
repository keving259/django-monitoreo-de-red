from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from .serializers import UserSerializer
from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect
from django.contrib.auth import login as auth_login
from django.utils.http import url_has_allowed_host_and_scheme
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.csrf import csrf_protect

@csrf_protect
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = User.objects.filter(username=username).first()
    
    if user is None or not user.check_password(password):
        return Response({'error' : "Credenciales inválidas"}, status=status.HTTP_400_BAD_REQUEST)
    
    token, created = Token.objects.get_or_create(user=user)
    auth_login(request, user)
    serializer = UserSerializer(instance=user)
    
    group = user.groups.first()
    role = group.name if group else None
    
    next_url = request.data.get('next') or '/api/hosts/'
    
    if not url_has_allowed_host_and_scheme(
        url=next_url,
        allowed_hosts={request.get_host()},
        require_https=request.is_secure(),
    ):
        next_url = '/api/hosts/'
    
    return Response({'token' : token.key, 'user' : serializer.data, 'role' : role, 'next': next_url}, status=status.HTTP_200_OK)

@ensure_csrf_cookie
def login_page(request):
    return render(request, 'login.html')
