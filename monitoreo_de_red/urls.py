from rest_framework import routers
from django.urls import path, include
from .api import HostViewSet, CheckViewSet, AlertViewSet

router = routers.DefaultRouter()

router.register('hosts', HostViewSet)
router.register('chequeos', CheckViewSet)
router.register('alertas', AlertViewSet)

urlpatterns = [
    path('', include(router.urls))
]
