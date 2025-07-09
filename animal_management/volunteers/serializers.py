from rest_framework import serializers
from .models import (
    VolunteerProfile, VolunteerOpportunity, VolunteerAssignment,
    RescueVolunteerAssignment, VolunteerTrainingProgress, VolunteerSkillCertification
)
from users.serializers import UserSerializer


class VolunteerProfileSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    total_rescues_completed = serializers.IntegerField(read_only=True)
    average_response_time_minutes = serializers.FloatField(read_only=True)
    
    class Meta:
        model = VolunteerProfile
        fields = '__all__'
        read_only_fields = [
            'user', 'total_hours', 'created_at', 'updated_at',
            'total_rescues_completed', 'average_response_time_minutes',
            'last_location_update'
        ]
    
    def validate_max_rescue_distance_km(self, value):
        """Ensure rescue distance is reasonable"""
        if value < 1 or value > 100:
            raise serializers.ValidationError("Rescue distance must be between 1 and 100 km")
        return value


class VolunteerOpportunitySerializer(serializers.ModelSerializer):
    created_by_details = UserSerializer(source='created_by', read_only=True)
    duration_hours = serializers.FloatField(read_only=True)
    is_upcoming = serializers.BooleanField(read_only=True)
    assigned_count = serializers.SerializerMethodField()
    can_participate = serializers.SerializerMethodField()
    
    class Meta:
        model = VolunteerOpportunity
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at']
    
    def get_assigned_count(self, obj):
        return obj.assignments.count()
    
    def get_can_participate(self, obj):
        """Check if current user can participate in this opportunity"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                volunteer_profile = request.user.volunteer_profile
                return obj.can_volunteer_participate(volunteer_profile)
            except VolunteerProfile.DoesNotExist:
                return False
        return False
    
    def validate(self, data):
        """Validate opportunity data"""
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("End time must be after start time")
        
        if data['min_volunteers'] > data['max_volunteers']:
            raise serializers.ValidationError("Minimum volunteers cannot exceed maximum volunteers")
        
        return data


class VolunteerAssignmentSerializer(serializers.ModelSerializer):
    volunteer_details = UserSerializer(source='volunteer', read_only=True)
    opportunity_details = VolunteerOpportunitySerializer(source='opportunity', read_only=True)
    
    class Meta:
        model = VolunteerAssignment
        fields = '__all__'
        read_only_fields = ['volunteer', 'assigned_at', 'confirmed_at', 'completed_at']


class RescueVolunteerAssignmentSerializer(serializers.ModelSerializer):
    volunteer_details = UserSerializer(source='volunteer', read_only=True)
    report_details = serializers.SerializerMethodField()
    current_location_display = serializers.SerializerMethodField()
    time_since_assigned = serializers.SerializerMethodField()
    
    class Meta:
        model = RescueVolunteerAssignment
        fields = '__all__'
        read_only_fields = [
            'volunteer', 'assigned_at', 'accepted_at', 'completed_at',
            'response_time_minutes', 'location_updates'
        ]
    
    def get_report_details(self, obj):
        """Get basic report information"""
        return {
            'id': obj.report.id,
            'animal_type': obj.report.animal.animal_type if obj.report.animal else 'Unknown',
            'location': obj.report.location,
            'urgency_level': getattr(obj.report, 'urgency_level', 'NORMAL'),
            'description': obj.report.description,
            'status': obj.report.status,
            'latitude': obj.report.latitude,
            'longitude': obj.report.longitude,
            'created_at': obj.report.created_at,
        }
    
    def get_current_location_display(self, obj):
        """Get current location as lat/lng tuple"""
        location = obj.get_current_location()
        if location:
            return {
                'latitude': location[0],
                'longitude': location[1]
            }
        return None
    
    def get_time_since_assigned(self, obj):
        """Calculate time since assignment in minutes"""
        from django.utils import timezone
        if obj.assigned_at:
            delta = timezone.now() - obj.assigned_at
            return int(delta.total_seconds() / 60)
        return 0


class LocationUpdateSerializer(serializers.Serializer):
    """Serializer for GPS location updates"""
    latitude = serializers.FloatField(min_value=-90, max_value=90)
    longitude = serializers.FloatField(min_value=-180, max_value=180)
    
    def validate_latitude(self, value):
        if not -90 <= value <= 90:
            raise serializers.ValidationError("Latitude must be between -90 and 90")
        return value
    
    def validate_longitude(self, value):
        if not -180 <= value <= 180:
            raise serializers.ValidationError("Longitude must be between -180 and 180")
        return value


class VolunteerTrainingProgressSerializer(serializers.ModelSerializer):
    volunteer_details = UserSerializer(source='volunteer.user', read_only=True)
    resource_details = serializers.SerializerMethodField()
    
    class Meta:
        model = VolunteerTrainingProgress
        fields = '__all__'
        read_only_fields = ['volunteer', 'started_date', 'completed_date']
    
    def get_resource_details(self, obj):
        """Get basic resource information"""
        return {
            'id': obj.resource.id,
            'title': obj.resource.title,
            'slug': obj.resource.slug,
            'resource_type': obj.resource.resource_type,
            'estimated_duration': getattr(obj.resource, 'estimated_duration', None),
        }


class VolunteerSkillCertificationSerializer(serializers.ModelSerializer):
    volunteer_details = UserSerializer(source='volunteer.user', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    training_resource_title = serializers.CharField(source='training_resource.title', read_only=True)
    
    class Meta:
        model = VolunteerSkillCertification
        fields = '__all__'
        read_only_fields = ['volunteer', 'certified_date', 'is_active']


class AvailableRescueSerializer(serializers.Serializer):
    """Serializer for available rescue opportunities"""
    report_id = serializers.IntegerField()
    animal_type = serializers.CharField()
    location = serializers.CharField()
    urgency = serializers.CharField()
    distance_km = serializers.FloatField()
    description = serializers.CharField()
    created_at = serializers.DateTimeField()
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    estimated_response_time = serializers.IntegerField(required=False)


class RescueAcceptanceSerializer(serializers.Serializer):
    """Serializer for accepting rescue assignments"""
    assignment_type = serializers.ChoiceField(
        choices=RescueVolunteerAssignment.ASSIGNMENT_TYPE_CHOICES,
        default='PRIMARY'
    )
    estimated_arrival = serializers.DateTimeField(required=False)
    volunteer_notes = serializers.CharField(max_length=500, required=False)


class RescueCompletionSerializer(serializers.Serializer):
    """Serializer for completing rescue assignments"""
    completion_notes = serializers.CharField(max_length=1000, required=False)
    animals_rescued = serializers.IntegerField(min_value=0, default=1)
    rescue_outcome = serializers.ChoiceField(choices=[
        ('SUCCESS', 'Successful Rescue'),
        ('PARTIAL', 'Partial Success'),
        ('UNSUCCESSFUL', 'Unsuccessful'),
        ('ANIMAL_GONE', 'Animal Not Found'),
        ('REFERRED', 'Referred to Authorities')
    ], default='SUCCESS')


class VolunteerStatsSerializer(serializers.Serializer):
    """Serializer for volunteer statistics"""
    total_volunteer_hours = serializers.FloatField()
    total_rescues_completed = serializers.IntegerField()
    average_response_time = serializers.FloatField()
    points_earned = serializers.IntegerField()
    certifications_count = serializers.IntegerField()
    current_assignments = serializers.IntegerField()
    volunteer_rank = serializers.CharField()
    achievements_count = serializers.IntegerField()


class NearbyVolunteerSerializer(serializers.Serializer):
    """Serializer for nearby volunteer information (for staff/admin use)"""
    volunteer_id = serializers.IntegerField()
    username = serializers.CharField()
    distance_km = serializers.FloatField()
    experience_level = serializers.CharField()
    rescue_experience_level = serializers.CharField()
    has_transportation = serializers.BooleanField()
    available_for_emergency = serializers.BooleanField()
    total_rescues = serializers.IntegerField()
    average_response_time = serializers.FloatField()
    phone_number = serializers.CharField()
    preferred_contact_method = serializers.CharField()
