# volunteers/urls.py - Create this file if it doesn't exist

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VolunteerProfileViewSet,
    VolunteerOpportunityViewSet,
    VolunteerAssignmentViewSet,
    RescueVolunteerAssignmentViewSet,
    VolunteerManagementViewSet,
    VolunteerTrainingProgressViewSet
)

from resources.views import LearningProgressViewSet


# Create router for API endpoints
router = DefaultRouter()
router.register(r'profiles', VolunteerProfileViewSet, basename='volunteer-profiles')
router.register(r'opportunities', VolunteerOpportunityViewSet, basename='volunteer-opportunities')
router.register(r'assignments', VolunteerAssignmentViewSet, basename='volunteer-assignments')
router.register(r'rescue-assignments', RescueVolunteerAssignmentViewSet, basename='rescue-assignments')
router.register(r'management', VolunteerManagementViewSet, basename='volunteer-management')
router.register(r'training', VolunteerTrainingProgressViewSet, basename='volunteer-training')
router.register(r'learning-progress', LearningProgressViewSet, basename='learning-progress')

urlpatterns = [
    path('', include(router.urls)),
]
