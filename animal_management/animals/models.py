# animals/models.py - ENHANCED VERSION
# ADD these new status types to the existing STATUS_TYPES tuple

from django.contrib.gis.db import models as gis_models
from django.db import models
from django.conf import settings

class Animal(models.Model):
    ANIMAL_TYPES = (
        ('DOG', 'Dog'),
        ('CAT', 'Cat'),
        ('OTHER', 'Other'),
    )
    
    GENDER_TYPES = (
        ('MALE', 'Male'),
        ('FEMALE', 'Female'),
        ('UNKNOWN', 'Unknown'),
    )
    
    # ENHANCED STATUS_TYPES - Added new statuses for SHELTER workflow
    STATUS_TYPES = (
        ('REPORTED', 'Reported'),
        ('RESCUED', 'Rescued'),
        ('IN_SHELTER', 'In Shelter'),
        ('UNDER_TREATMENT', 'Under Treatment'),
        ('QUARANTINE', 'In Quarantine'),  # NEW
        ('URGENT_MEDICAL', 'Urgent Medical Attention'),  # NEW
        ('READY_FOR_TRANSFER', 'Ready for Transfer'),  # NEW
        ('AVAILABLE', 'Available for Adoption'),
        ('ADOPTED', 'Adopted'),
        ('RETURNED', 'Returned to Owner'),
    )
    
    # PRIORITY LEVELS for medical/emergency cases
    PRIORITY_LEVELS = (
        ('LOW', 'Low Priority'),
        ('NORMAL', 'Normal'),
        ('HIGH', 'High Priority'),
        ('EMERGENCY', 'Emergency'),
    )
    
    # Basic information (EXISTING - keep as is)
    name = models.CharField(max_length=100, blank=True, null=True)
    animal_type = models.CharField(max_length=10, choices=ANIMAL_TYPES)
    breed = models.CharField(max_length=100, blank=True, null=True)
    gender = models.CharField(max_length=10, choices=GENDER_TYPES)
    age_estimate = models.CharField(max_length=50, blank=True, null=True)
    weight = models.FloatField(blank=True, null=True)
    color = models.CharField(max_length=100, blank=True, null=True)
    
    # Status and tracking (ENHANCED)
    status = models.CharField(max_length=20, choices=STATUS_TYPES, default='REPORTED')
    priority_level = models.CharField(max_length=10, choices=PRIORITY_LEVELS, default='NORMAL')  # NEW
    intake_date = models.DateTimeField(blank=True, null=True)
    
    # Location fields (EXISTING - keep as is)
    geo_location = gis_models.PointField(null=True, blank=True, geography=True)
    last_location_json = models.JSONField(blank=True, null=True)
    
    current_shelter = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='sheltered_animals'
    )
    
    # Health information (EXISTING - keep as is)
    vaccinated = models.BooleanField(default=False)
    neutered_spayed = models.BooleanField(default=False)
    microchipped = models.BooleanField(default=False)
    health_status = models.TextField(blank=True, null=True)
    
    # NEW FIELDS for SHELTER management
    estimated_medical_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    quarantine_end_date = models.DateField(null=True, blank=True)
    transfer_ready_date = models.DateField(null=True, blank=True)
    special_instructions = models.TextField(blank=True, null=True)
    
    # Adoption related (EXISTING - keep as is)
    behavior_notes = models.TextField(blank=True, null=True)
    special_needs = models.TextField(blank=True, null=True)
    adoption_fee = models.FloatField(blank=True, null=True)
    
    # Media (EXISTING - keep as is)
    photos = models.JSONField(blank=True, null=True)
    
    # Timestamps (EXISTING - keep as is)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # EXISTING property - keep as is
    @property
    def location(self):
        """Return location data for the API"""
        if self.geo_location:
            return {
                'lat': self.geo_location.y,
                'lng': self.geo_location.x
            }
        return self.last_location_json

    # NEW PROPERTIES for SHELTER operations
    @property
    def is_emergency(self):
        """Check if animal requires emergency attention"""
        return self.priority_level == 'EMERGENCY' or self.status == 'URGENT_MEDICAL'
    
    @property
    def days_in_shelter(self):
        """Calculate days since intake"""
        if self.intake_date:
            from django.utils import timezone
            return (timezone.now().date() - self.intake_date.date()).days
        return None
    
    @property
    def is_quarantine_complete(self):
        """Check if quarantine period is complete"""
        if self.status == 'QUARANTINE' and self.quarantine_end_date:
            from django.utils import timezone
            return timezone.now().date() >= self.quarantine_end_date
        return False

    def __str__(self):
        return f"{self.animal_type} - {self.name or 'Unnamed'}"

    class Meta:
        ordering = ['-priority_level', '-created_at']  # Emergency cases first
        indexes = [
            models.Index(fields=['status', 'priority_level']),
            models.Index(fields=['current_shelter', 'status']),
            models.Index(fields=['quarantine_end_date']),
        ]