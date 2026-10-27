from django.urls import path
from . import views

urlpatterns = [
    path('api/trigger-check/', views.trigger_check),
    
    path('api/checks/', views.checks, name='checks'),
    path('checks/', views.CheckListView.as_view(), name='check-list'),
    
    path('api/alerts/', views.alerts, name='alerts'),
    path('alerts/', views.AlertListView.as_view(), name='alert-list'),
]
