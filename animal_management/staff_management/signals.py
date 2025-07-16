from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import StaffSchedule, StaffPerformance

User = get_user_model()

@receiver(post_save, sender=User)
def create_staff_records(sender, instance, created, **kwargs):
    """
    Automatically create StaffSchedule and StaffPerformance records 
    when a staff user is created or when user_type is updated to staff role
    """
    if instance.user_type in ['STAFF', 'SHELTER', 'VOLUNTEER'] or instance.is_staff:
        # Create schedule record
        StaffSchedule.objects.get_or_create(
            staff=instance,
            defaults={'duty_status': 'OFF_DUTY'}
        )
        
        # Create performance record
        StaffPerformance.objects.get_or_create(
            staff=instance,
            defaults={
                'tasks_completed_today': 0,
                'current_workload': 50,
                'performance_score': 75.0,
                'stress_level': 2
            }
        )