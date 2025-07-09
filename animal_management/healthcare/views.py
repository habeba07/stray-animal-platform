from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import VaccinationRecord, MedicalRecord, HealthStatus
from .serializers import (
    VaccinationRecordSerializer, 
    MedicalRecordSerializer, 
    HealthStatusSerializer,
    AnimalHealthSummarySerializer
)
from animals.models import Animal

class VaccinationRecordViewSet(viewsets.ModelViewSet):
    queryset = VaccinationRecord.objects.all()
    serializer_class = VaccinationRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = VaccinationRecord.objects.all()
        animal_id = self.request.query_params.get('animal', None)
        if animal_id is not None:
            queryset = queryset.filter(animal_id=animal_id)
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class MedicalRecordViewSet(viewsets.ModelViewSet):
    queryset = MedicalRecord.objects.all()
    serializer_class = MedicalRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = MedicalRecord.objects.all()
        animal_id = self.request.query_params.get('animal', None)
        if animal_id is not None:
            queryset = queryset.filter(animal_id=animal_id)
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class HealthStatusViewSet(viewsets.ModelViewSet):
    queryset = HealthStatus.objects.all()
    serializer_class = HealthStatusSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def by_animal(self, request):
        animal_id = request.query_params.get('animal', None)
        if animal_id:
            health_status = get_object_or_404(HealthStatus, animal_id=animal_id)
            serializer = self.get_serializer(health_status)
            return Response(serializer.data)
        return Response({"error": "Animal ID is required"}, status=status.HTTP_400_BAD_REQUEST)


class AnimalHealthViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        animal = get_object_or_404(Animal, pk=pk)
        serializer = AnimalHealthSummarySerializer(animal)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def vaccinations_due(self, request, pk=None):
        animal = get_object_or_404(Animal, pk=pk)
        due_vaccinations = VaccinationRecord.objects.filter(
            animal=animal,
            next_due_date__isnull=False,
            next_due_date__lte=timezone.now().date() + timezone.timedelta(days=30)
        )
        serializer = VaccinationRecordSerializer(due_vaccinations, many=True)
        return Response(serializer.data)
