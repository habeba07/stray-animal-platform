from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta
from .models import ResourceCategory, MentalHealthResource, SelfCareReminder, StressLogEntry
from .serializers import (
    ResourceCategorySerializer, MentalHealthResourceSerializer,
    SelfCareReminderSerializer, StressLogEntrySerializer
)

class ResourceCategoryViewSet(viewsets.ModelViewSet):
    queryset = ResourceCategory.objects.all()
    serializer_class = ResourceCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticatedOrReadOnly()]

class MentalHealthResourceViewSet(viewsets.ModelViewSet):
    queryset = MentalHealthResource.objects.filter(is_published=True)
    serializer_class = MentalHealthResourceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticatedOrReadOnly()]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured mental health resources"""
        featured = self.queryset.filter(is_featured=True)[:5]
        serializer = self.get_serializer(featured, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get resources grouped by category"""
        categories = ResourceCategory.objects.all()
        result = []
        
        for category in categories:
            resources = self.queryset.filter(category=category)[:3]
            if resources:
                result.append({
                    'category': ResourceCategorySerializer(category).data,
                    'resources': MentalHealthResourceSerializer(resources, many=True).data
                })
        
        return Response(result)

class SelfCareReminderViewSet(viewsets.ModelViewSet):
    serializer_class = SelfCareReminderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return SelfCareReminder.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def active_reminders(self, request):
        """Get user's active reminders"""
        reminders = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(reminders, many=True)
        return Response(serializer.data)

class StressLogEntryViewSet(viewsets.ModelViewSet):
    serializer_class = StressLogEntrySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return StressLogEntry.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def stress_trends(self, request):
        """Get user's stress level trends over time"""
        days = int(request.query_params.get('days', 30))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        entries = self.get_queryset().filter(
            date__range=[start_date, end_date]
        ).order_by('date')
        
        # Calculate average stress by week
        weekly_data = {}
        for entry in entries:
            week_start = entry.date - timedelta(days=entry.date.weekday())
            week_key = week_start.strftime('%Y-%m-%d')
            
            if week_key not in weekly_data:
                weekly_data[week_key] = {'total': 0, 'count': 0}
            
            weekly_data[week_key]['total'] += entry.stress_level
            weekly_data[week_key]['count'] += 1
        
        # Format for frontend chart
        trend_data = []
        for week, data in weekly_data.items():
            avg_stress = data['total'] / data['count']
            trend_data.append({
                'week': week,
                'average_stress': round(avg_stress, 2),
                'entry_count': data['count']
            })
        
        return Response({
            'trends': sorted(trend_data, key=lambda x: x['week']),
            'current_average': sum(e.stress_level for e in entries[-7:]) / max(len(entries[-7:]), 1),
            'total_entries': len(entries)
        })
    
    @action(detail=False, methods=['get'])
    def stress_factors_analysis(self, request):
        """Analyze most common stress factors"""
        entries = self.get_queryset().filter(
            date__gte=timezone.now().date() - timedelta(days=90)
        )
        
        factor_count = {}
        for entry in entries:
            for factor in entry.factors:
                factor_count[factor] = factor_count.get(factor, 0) + 1
        
        # Sort by frequency
        sorted_factors = sorted(factor_count.items(), key=lambda x: x[1], reverse=True)
        
        return Response({
            'top_factors': sorted_factors[:10],
            'total_factors': len(factor_count),
            'analysis_period': '90 days'
        })
