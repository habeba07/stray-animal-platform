from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Animal
from .serializers import AnimalSerializer
from django.db.models import Q

class AnimalViewSet(viewsets.ModelViewSet):
    queryset = Animal.objects.all()
    serializer_class = AnimalSerializer
    permission_classes = [permissions.AllowAny]  # Simplified permissions first
    
    # Basic list - no complex filtering yet
    def list(self, request):
        try:
            animals = Animal.objects.all()
            serializer = self.get_serializer(animals, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e), "count": Animal.objects.count()})
    
    # Add back adoptable action
    @action(detail=False, methods=['get'])
    def adoptable(self, request):
        try:
            adoptable = Animal.objects.filter(status='AVAILABLE')
            serializer = self.get_serializer(adoptable, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)})