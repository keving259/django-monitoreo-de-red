from rest_framework import routers
from django.urls import path, include
from .api import HostViewSet, CheckViewSet, AlertViewSet
from . import views
from django.contrib import admin

router = routers.DefaultRouter()

router.register('hosts', HostViewSet)
router.register('chequeos', CheckViewSet)
router.register('alertas', AlertViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('admin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls')),
    path('login/', views.login, name='login')
]
