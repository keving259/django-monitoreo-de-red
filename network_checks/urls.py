from django.urls import path
from . import views

urlpatterns = [
    path('api/trigger-check/', views.trigger_check),
]
