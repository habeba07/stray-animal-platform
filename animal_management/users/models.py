
from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid
from django.utils import timezone 

class User(AbstractUser):
    USER_TYPES = (
        ('SHELTER', 'Animal Shelter/Rescue Organization'),
        ('PUBLIC', 'General Public'),
        ('VOLUNTEER', 'Volunteer'),
        ('AUTHORITY', 'Local Authority'),
        ('STAFF', 'Shelter Staff'),
    )
    
    user_type = models.CharField(max_length=20, choices=USER_TYPES)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    points = models.IntegerField(default=0)  # For reward system
    
    # Additional fields based on user type
    organization_name = models.CharField(max_length=100, blank=True, null=True)
    skills = models.JSONField(blank=True, null=True)  # For volunteers
   
    is_email_verified = models.BooleanField(default=False)
    email_verification_token = models.CharField(max_length=100, blank=True, null=True)
    email_verification_sent_at = models.DateTimeField(blank=True, null=True)

    def save(self, *args, **kwargs):
        # Ensure email verification field is never null
        if self.is_email_verified is None:
           self.is_email_verified = False
        if self.email_verification_token is None:
            self.email_verification_token = ''
        super().save(*args, **kwargs)
  
    def __str__(self):
        return self.username

class TimeSheet(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    staff_member = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        limit_choices_to={'user_type__in': ['STAFF', 'SHELTER']},
        related_name='timesheets'
    )
    clock_in_time = models.DateTimeField()
    clock_out_time = models.DateTimeField(null=True, blank=True)
    total_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True, null=True, help_text="Optional notes for the shift")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-clock_in_time']
        
    def __str__(self):
        return f"{self.staff_member.username} - {self.clock_in_time.strftime('%Y-%m-%d %H:%M')}"
    
    def calculate_hours(self):
        """Calculate total hours worked"""
        if self.clock_out_time and self.clock_in_time:
            delta = self.clock_out_time - self.clock_in_time
            hours = delta.total_seconds() / 3600
            return round(hours, 2)
        return None
    
    def save(self, *args, **kwargs):
        # Auto-calculate total hours when clock_out_time is set
        if self.clock_out_time:
            self.total_hours = self.calculate_hours()
        super().save(*args, **kwargs)
    
    @property
    def is_clocked_in(self):
        """Check if staff member is currently clocked in (no clock out time)"""
        return self.clock_out_time is None
