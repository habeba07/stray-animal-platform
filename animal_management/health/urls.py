# health/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.health_check, name='health_check'),
    path('simple/', views.simple_check, name='simple_check'),
]
