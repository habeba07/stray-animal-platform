from rest_framework import viewsets, permissions
from rest_framework.response import Response
from .models import Animal

class AnimalViewSet(viewsets.ModelViewSet):
    queryset = Animal.objects.all()
    permission_classes = [permissions.AllowAny]
    
    def list(self, request):
        try:
            # Don't use serializer - just return basic data
            animals = Animal.objects.all()[:5]  # Only first 5 animals
            data = []
            for animal in animals:
                data.append({
                    'id': animal.id,
                    'name': animal.name or 'Unnamed',
                    'animal_type': animal.animal_type,
                    'status': animal.status
                })
            return Response(data)
        except Exception as e:
            return Response({
                "error": str(e),
                "total_count": Animal.objects.count()
            })