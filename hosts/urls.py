from django.urls import path, include
from . import views

urlpatterns = [
    path('hosts/', views.hosts, name='hosts'),
]
