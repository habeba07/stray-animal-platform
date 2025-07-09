from rest_framework import serializers
from .models import Report
from users.serializers import UserSerializer
from animals.serializers import AnimalSerializer

class ReportSerializer(serializers.ModelSerializer):
    reporter_details = UserSerializer(source='reporter', read_only=True)
    assigned_to_details = UserSerializer(source='assigned_to', read_only=True)
    animal_details = AnimalSerializer(source='animal', read_only=True)
    
    class Meta:
        model = Report
        fields = ['id', 'tracking_id', 'reporter', 'reporter_details', 'animal', 'animal_details', 
                  'status', 'location', 'location_details', 'description', 
                  'animal_condition', 'photos', 'assigned_to', 'assigned_to_details', 
                  'rescue_notes', 'rescue_time', 'created_at', 'updated_at']
        read_only_fields = ['reporter', 'tracking_id', 'created_at', 'updated_at']
