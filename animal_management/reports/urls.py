# reports/urls.py - ENHANCED VERSION for SHELTER features

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReportViewSet

# Create router for report API endpoints
router = DefaultRouter()
router.register(r'', ReportViewSet, basename='reports')

urlpatterns = [
    path('', include(router.urls)),
    
    # NEW: Additional endpoints for SHELTER report management
    # These complement the existing router endpoints
    
    # Bulk operations for SHELTER users
    path('bulk-assign/', ReportViewSet.as_view({'post': 'bulk_assign_reports'}), name='bulk_assign_reports'),
    path('bulk-update-status/', ReportViewSet.as_view({'post': 'bulk_update_status'}), name='bulk_update_status'),
    
    # Priority and emergency management
    path('emergency/', ReportViewSet.as_view({'get': 'emergency_reports'}), name='emergency_reports'),
    path('priority-filter/', ReportViewSet.as_view({'get': 'filter_by_priority'}), name='filter_by_priority'),
    
    # Staff assignment and tracking
    path('unassigned/', ReportViewSet.as_view({'get': 'unassigned_reports'}), name='unassigned_reports'),
    path('assigned-to-me/', ReportViewSet.as_view({'get': 'my_assigned_reports'}), name='my_assigned_reports'),
    
    # Analytics and performance for SHELTER users
    path('response-times/', ReportViewSet.as_view({'get': 'response_time_analytics'}), name='response_times'),
    path('completion-stats/', ReportViewSet.as_view({'get': 'completion_statistics'}), name='completion_stats'),
]

# This creates the original endpoints:
# GET /api/reports/ - List reports
# POST /api/reports/ - Create report  
# GET /api/reports/{id}/ - Get specific report
# PUT /api/reports/{id}/ - Update report

# Plus new SHELTER-specific endpoints:
# POST /api/reports/bulk-assign/ - Assign multiple reports to staff
# POST /api/reports/bulk-update-status/ - Update status of multiple reports
# GET /api/reports/emergency/ - Get emergency priority reports
# GET /api/reports/priority-filter/?priority=HIGH - Filter by priority level
# GET /api/reports/unassigned/ - Get unassigned reports
# GET /api/reports/assigned-to-me/ - Get reports assigned to current user
# GET /api/reports/response-times/ - Get response time analytics
# GET /api/reports/completion-stats/ - Get completion statistics