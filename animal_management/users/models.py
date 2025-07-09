
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
