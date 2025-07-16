from django.db import models
from django.conf import settings
from django.utils import timezone

class StaffSchedule(models.Model):
    DUTY_STATUS_CHOICES = (
        ('ON_DUTY', 'On Duty'),
        ('OFF_DUTY', 'Off Duty'),
        ('BREAK', 'On Break'),
    )
    
    staff = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='staff_schedule')
    duty_status = models.CharField(max_length=10, choices=DUTY_STATUS_CHOICES, default='OFF_DUTY')
    shift_start = models.DateTimeField(null=True, blank=True)
    shift_end = models.DateTimeField(null=True, blank=True)
    break_start = models.DateTimeField(null=True, blank=True)
    break_end = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.staff.username} - {self.duty_status}"

class StaffTask(models.Model):
    PRIORITY_CHOICES = (
        ('LOW', 'Low'),
        ('NORMAL', 'Normal'),
        ('HIGH', 'High'),
        ('EMERGENCY', 'Emergency'),
    )
    
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assigned_tasks')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_tasks')
    
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='NORMAL')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='PENDING')
    
    due_date = models.DateTimeField()
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Link to animals if task is animal-specific
    animal = models.ForeignKey('animals.Animal', on_delete=models.CASCADE, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.assigned_to.username}"
    
    @property
    def is_overdue(self):
        return self.status == 'PENDING' and self.due_date < timezone.now()

class StaffPerformance(models.Model):
    staff = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='performance')
    
    # Task-based metrics
    tasks_completed_today = models.IntegerField(default=0)
    tasks_completed_week = models.IntegerField(default=0)
    tasks_completed_month = models.IntegerField(default=0)
    
    # Quality metrics
    task_completion_rate = models.FloatField(default=0.0)  # Percentage
    average_task_time = models.FloatField(default=0.0)  # Hours
    
    # Workload and wellness
    current_workload = models.IntegerField(default=0)  # Percentage 0-100
    stress_level = models.IntegerField(default=1)  # 1-5 scale
    
    # Animal care metrics
    animals_cared_for = models.IntegerField(default=0)
    
    # Overall performance score
    performance_score = models.FloatField(default=75.0)  # Percentage
    
    last_updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.staff.username} - {self.performance_score}%"
    
    def update_performance_metrics(self):
        """Calculate and update performance metrics based on recent activity"""
        # Get tasks for calculations
        completed_tasks = StaffTask.objects.filter(
            assigned_to=self.staff,
            status='COMPLETED'
        )
        
        # Update completion rates, workload, etc.
        # This would contain the actual calculation logic
        pass