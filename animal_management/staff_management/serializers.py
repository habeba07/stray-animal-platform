from rest_framework import serializers
from .models import StaffSchedule, StaffTask, StaffPerformance
from django.contrib.auth import get_user_model

User = get_user_model()

class StaffScheduleSerializer(serializers.ModelSerializer):
    staff_username = serializers.CharField(source='staff.username', read_only=True)
    
    class Meta:
        model = StaffSchedule
        fields = ['id', 'staff', 'staff_username', 'duty_status', 'shift_start', 'shift_end', 'break_start', 'break_end']

class StaffTaskSerializer(serializers.ModelSerializer):
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = StaffTask
        fields = ['id', 'title', 'description', 'assigned_to', 'assigned_to_username', 
                 'created_by', 'created_by_username', 'priority', 'status', 
                 'due_date', 'completed_at', 'animal', 'is_overdue']
        read_only_fields = ['created_by']

class StaffPerformanceSerializer(serializers.ModelSerializer):
    staff_username = serializers.CharField(source='staff.username', read_only=True)
    
    class Meta:
        model = StaffPerformance
        fields = ['id', 'staff', 'staff_username', 'tasks_completed_today', 
                 'tasks_completed_week', 'task_completion_rate', 'current_workload', 
                 'stress_level', 'animals_cared_for', 'performance_score']