from rest_framework import serializers
from .models import VirtualAdoption, VirtualAdoptionUpdate, VirtualAdoptionLevel
from users.serializers import UserSerializer
from animals.serializers import AnimalSerializer

class VirtualAdoptionLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = VirtualAdoptionLevel
        fields = '__all__'


class VirtualAdoptionUpdateSerializer(serializers.ModelSerializer):
    created_by_details = UserSerializer(source='created_by', read_only=True)
    
    class Meta:
        model = VirtualAdoptionUpdate
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at']


class VirtualAdoptionSerializer(serializers.ModelSerializer):
    sponsor_details = UserSerializer(source='sponsor', read_only=True)
    animal_details = AnimalSerializer(source='animal', read_only=True)
    updates = VirtualAdoptionUpdateSerializer(many=True, read_only=True)
    
    class Meta:
        model = VirtualAdoption
        fields = '__all__'
        read_only_fields = ['sponsor', 'created_at', 'updated_at', 'next_payment_date']
