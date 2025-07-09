from rest_framework import serializers
from .models import AdopterProfile, AnimalBehaviorProfile, AdoptionApplication, AdoptionMatch
from users.serializers import UserSerializer
from animals.serializers import AnimalSerializer

class AdopterProfileSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = AdopterProfile
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']


class AnimalBehaviorProfileSerializer(serializers.ModelSerializer):
    animal_details = AnimalSerializer(source='animal', read_only=True)
    
    class Meta:
        model = AnimalBehaviorProfile
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class AdoptionApplicationSerializer(serializers.ModelSerializer):
    applicant_details = UserSerializer(source='applicant', read_only=True)
    animal_details = AnimalSerializer(source='animal', read_only=True)
    reviewed_by_details = UserSerializer(source='reviewed_by', read_only=True)
    
    class Meta:
        model = AdoptionApplication
        fields = '__all__'
        read_only_fields = ['applicant', 'compatibility_score', 'reviewed_by', 'created_at', 'updated_at']


class AdoptionMatchSerializer(serializers.ModelSerializer):
    adopter_details = UserSerializer(source='adopter', read_only=True)
    animal_details = AnimalSerializer(source='animal', read_only=True)
    
    class Meta:
        model = AdoptionMatch
        fields = '__all__'
        read_only_fields = ['created_at']
