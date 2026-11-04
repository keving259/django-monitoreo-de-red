from rest_framework import routers
from django.urls import path, include
from .api import HostViewSet, CheckViewSet, AlertViewSet
from . import views
from hosts.views import hosts
from network_checks.views import checks, alerts
from django.contrib import admin

router = routers.DefaultRouter()

router.register('hosts', HostViewSet)
router.register('checks', CheckViewSet)
router.register('alerts', AlertViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls')),
    
    # Autenticación
    path('login/', views.login_page, name='login_page'),
    path('api/login/', views.login, name='api_login'),
    path('api/logout/', views.logout, name='api_logout'),
    
    # HTML
    path('hosts/', hosts, name='hosts'),
    path('checks/', checks, name='checks'),
    path('alerts/', alerts, name='alerts'),
    
    # API
    path('api/', include(router.urls)),
    path('api/', include('network_checks.urls')),
]
