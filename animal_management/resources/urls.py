
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ResourceCategoryViewSet,
    EducationalResourceViewSet,
    ResourceRatingViewSet,
    LearningProgressViewSet
)

router = DefaultRouter()
router.register(r'categories', ResourceCategoryViewSet)
router.register(r'resources', EducationalResourceViewSet) 
router.register(r'ratings', ResourceRatingViewSet)
router.register(r'learning-progress', LearningProgressViewSet, basename='learningprogress')

# Add the missing action endpoints manually
urlpatterns = [
    path('', include(router.urls)),
    
    # Add these missing endpoints that the frontend expects:
    path('featured/', EducationalResourceViewSet.as_view({'get': 'featured'}), name='resources-featured'),
    path('by_category/', EducationalResourceViewSet.as_view({'get': 'by_category'}), name='resources-by-category'),
]
