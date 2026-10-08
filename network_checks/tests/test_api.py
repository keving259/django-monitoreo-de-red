import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework.test import APIClient
from network_checks.models import Host
from datetime import time

User = get_user_model()

@pytest.fixture
def groups():
    admin = Group.objects.get_or_create(name='Administrador')[0]
    sistema = Group.objects.get_or_create(name='Sistema')[0]
    monitoreo = Group.objects.get_or_create(name='Solo monitoreo')[0]
    return {'admin': admin, 'sistema': sistema, 'monitoreo': monitoreo}

@pytest.fixture
def admin_user(groups):
    user = User.objects.create_user(username='admin_test', password='test1234')
    user.groups.add(groups['admin'])
    return user

@pytest.fixture
def monitoring_user(groups):
    user = User.objects.create_user(username='monitoring_test', password='test1234')
    user.groups.add(groups['monitoreo'])
    return user

@pytest.fixture
def host_test(admin_user):
    return Host.objects.create(
        nombre = 'Host de prueba',
        hostname = 'localhost',
        ip_address = '127.0.0.1',
        tipo_servicio = 'api',
        puerto = 8000,
        intervalo_chequeo=time(0, 5, 0),
        propietario = admin_user,
        activo = True
    )



@pytest.mark.django_db
def test_solo_monitoreo_no_puede_crear_host(monitoring_user, host_test):
    client = APIClient()
    client.force_authenticate(user=monitoring_user)
    
    data = {
        'nombre' : 'Host nuevo',
        'hostname' : 'router',
        'ip_address' : '192.168.1.1',
        'tipo_servicio' : 'custom',
        'puerto' : None,
        'activo': True
    }
    
    response = client.post('/hosts/', data, format='json')
    
    assert response.status_code == 403

@pytest.mark.django_db
def test_administrador_puede_crear_host(admin_user, host_test):
    client = APIClient()
    client.force_authenticate(user=admin_user)
    
    data = {
        'nombre' : 'Host nuevo',
        'hostname' : 'router',
        'ip_address' : '192.168.1.1',
        'tipo_servicio' : 'custom',
        'puerto' : 8000,
        'intervalo_chequeo' : time(0, 5, 0),
        'activo': True
    }
    
    response = client.post('/hosts/', data, format='json')
    
    print(response.data)
    assert response.status_code == 201