from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Animal
from .serializers import AnimalSerializer
from django.db.models import Q
from django.contrib.auth import get_user_model
from django.core.management import call_command

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json

class AnimalViewSet(viewsets.ModelViewSet):
    queryset = Animal.objects.all()
    serializer_class = AnimalSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['animal_type', 'gender', 'vaccinated', 'neutered_spayed']
    search_fields = ['name', 'breed', 'color']
    ordering_fields = ['created_at', 'intake_date']
    
    def get_permissions(self):

        if self.action in ['list', 'retrieve', 'adoptable', 'setup_production']:
            return [permissions.AllowAny()] 
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]  # You can add custom permissions here later
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = Animal.objects.all()
        
        # Handle comma-separated status filtering
        status_param = self.request.query_params.get('status', None)
        if status_param:
            statuses = [s.strip() for s in status_param.split(',')]
            queryset = queryset.filter(status__in=statuses)
            
        # Handle priority filtering
        priority_param = self.request.query_params.get('priority', None)
        if priority_param:
            priorities = [p.strip() for p in priority_param.split(',')]
            queryset = queryset.filter(priority_level__in=priorities)
            
        # Apply other filters normally
        for field in ['animal_type', 'gender', 'vaccinated', 'neutered_spayed']:
            value = self.request.query_params.get(field, None)
            if value:
                queryset = queryset.filter(**{field: value})
                
        return queryset
    
    @action(detail=False, methods=['get'])
    def adoptable(self, request):
        adoptable = self.queryset.filter(status='AVAILABLE')
        serializer = self.get_serializer(adoptable, many=True)
        return Response(serializer.data)

@csrf_exempt
@require_http_methods(["POST"])
def setup_production_simple(request):
    """Simple production setup endpoint"""
    from django.conf import settings
    
    if settings.DEBUG:
        return JsonResponse({'success': False, 'message': 'Setup only available in production'})
    
    User = get_user_model()
    if User.objects.filter(is_superuser=True).exists():
        return JsonResponse({'success': False, 'message': 'Production already has admin user'})
    
    try:
        call_command('auto_setup_production')
        return JsonResponse({
            'success': True,
            'message': 'Production setup completed!',
            'admin_username': 'admin',
            'admin_password': 'PawRescue2025!'
        })
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'Setup failed: {str(e)}'})