from rest_framework import viewsets, permissions
from rest_framework.response import Response
from .models import Animal

class AnimalViewSet(viewsets.ModelViewSet):
    queryset = Animal.objects.all()
    permission_classes = [permissions.AllowAny]
    
    def list(self, request):
        try:
            count = Animal.objects.count()
            return Response({"count": count, "message": "Animals endpoint working"})
        except Exception as e:
            return Response({"error": str(e)})