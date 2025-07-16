from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StaffScheduleViewSet, StaffTaskViewSet, StaffPerformanceViewSet

router = DefaultRouter()
router.register(r'staff-schedules', StaffScheduleViewSet)
router.register(r'staff-tasks', StaffTaskViewSet)
router.register(r'staff-performance', StaffPerformanceViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]