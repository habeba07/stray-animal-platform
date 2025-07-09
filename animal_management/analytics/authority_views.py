from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta

from animals.models import Animal
from reports.models import Report

class AuthorityAnalyticsViewSet(viewsets.ViewSet):
    """
    Simple analytics for Authority users only
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def check_authority_permission(self, request):
        """Check if user is authorized"""
        if request.user.user_type != 'AUTHORITY':
            return False
        return True

    @action(detail=False, methods=['get'])
    def test_endpoint(self, request):
        """
        Simple test endpoint to see if authority analytics work
        """
        if not self.check_authority_permission(request):
            return Response({'error': 'Access denied - AUTHORITY users only'}, status=status.HTTP_403_FORBIDDEN)
        
        # Just return some basic counts for now
        total_animals = Animal.objects.count()
        total_reports = Report.objects.count()
        
        return Response({
            'message': 'Authority analytics working!',
            'total_animals': total_animals,
            'total_reports': total_reports,
            'user_type': request.user.user_type
        })
