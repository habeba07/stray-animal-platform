from rest_framework import serializers
from .models import ResourceCategory, MentalHealthResource, SelfCareReminder, StressLogEntry
from users.serializers import UserSerializer

class ResourceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceCategory
        fields = ['id', 'name', 'description', 'icon', 'order', 'created_at']

class MentalHealthResourceSerializer(serializers.ModelSerializer):
    category_details = ResourceCategorySerializer(source='category', read_only=True)
    
    class Meta:
        model = MentalHealthResource
        fields = ['id', 'title', 'slug', 'category', 'category_details', 'resource_type', 
                  'content', 'summary', 'external_url', 'featured_image', 'author',
                  'is_featured', 'is_published', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['created_by', 'created_at', 'updated_at']

class SelfCareReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = SelfCareReminder
        fields = ['id', 'user', 'title', 'message', 'frequency', 
                  'time_of_day', 'is_active', 'last_sent', 'created_at']
        read_only_fields = ['user', 'last_sent', 'created_at']

class StressLogEntrySerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = StressLogEntry
        fields = ['id', 'user', 'user_details', 'date', 'stress_level', 
                  'notes', 'factors', 'created_at']
        read_only_fields = ['user', 'created_at']
