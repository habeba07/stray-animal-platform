from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from .models import Animal
from .serializers import AnimalSerializer
from django.db.models import Q

class AnimalPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class AnimalViewSet(viewsets.ModelViewSet):
    queryset = Animal.objects.all()
    serializer_class = AnimalSerializer
    pagination_class = AnimalPagination  # Add pagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['animal_type', 'gender', 'vaccinated', 'neutered_spayed']
    search_fields = ['name', 'breed', 'color']
    ordering_fields = ['created_at', 'intake_date']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'adoptable']:
            return [permissions.AllowAny()] 
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
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
            
        # Apply other filters
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