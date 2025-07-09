# dashboard/urls.py - NEW FILE for SHELTER dashboard endpoints

from django.urls import path
from . import views

urlpatterns = [
    # Existing dashboard endpoints (if any were already working)
    path('stats/', views.dashboard_stats, name='dashboard_stats'),
    path('reports/trends/', views.report_trends, name='report_trends'),
    path('animals/distribution/', views.animal_distribution, name='animal_distribution'),
    
    # NEW: Enhanced endpoints for SHELTER users
    path('medical/', views.medical_dashboard_stats, name='medical_dashboard_stats'),
    path('capacity/', views.capacity_stats, name='capacity_stats'),
    
    # NEW: Real-time monitoring endpoints for SHELTER operations
    path('alerts/', views.get_dashboard_alerts, name='dashboard_alerts'),
    path('emergency-status/', views.get_emergency_status, name='emergency_status'),
]