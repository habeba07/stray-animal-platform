from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from animals.views import setup_production_simple, import_data_simple

router = DefaultRouter()
router.register(r'', views.AnimalViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
    path('setup-production-simple/', setup_production_simple, name='setup_production_simple'),
    path('api/import-data-simple/', import_data_simple, name='import_data_simple'),

    # NEW: Enhanced animal management endpoints for SHELTER users
    path('emergency/', views.emergency_animals, name='emergency_animals'),
    path('medical-priority/', views.medical_priority_animals, name='medical_priority_animals'),
    path('quarantine/', views.quarantine_animals, name='quarantine_animals'),
    path('ready-for-transfer/', views.ready_for_transfer_animals, name='ready_for_transfer'),
    
    # NEW: Bulk operations for SHELTER users
    path('bulk-update-status/', views.bulk_update_animal_status, name='bulk_update_status'),
    path('bulk-medical-update/', views.bulk_medical_update, name='bulk_medical_update'),
    path('bulk-transfer/', views.bulk_transfer_animals, name='bulk_transfer'),
    
    # NEW: Medical integration endpoints
    path('<int:animal_id>/medical-summary/', views.animal_medical_summary, name='medical_summary'),
    path('<int:animal_id>/treatment-plan/', views.treatment_plan, name='treatment_plan'),
    path('<int:animal_id>/medical-costs/', views.medical_costs, name='medical_costs'),
    
    # NEW: Advanced filtering and search for SHELTER users
    path('search/advanced/', views.advanced_animal_search, name='advanced_search'),
    path('filter/medical/', views.filter_by_medical_status, name='filter_medical'),
    path('filter/priority/', views.filter_by_priority, name='filter_priority'),
]