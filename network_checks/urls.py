from django.urls import path
from .views import trigger_check

urlpatterns = [
    path('trigger-check/', trigger_check),
]
