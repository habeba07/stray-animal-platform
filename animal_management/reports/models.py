# COMPLETE reports/models.py - Replace your entire file with this

from django.contrib.gis.db import models as gis_models
from django.db import models
from django.conf import settings
from django.utils import timezone
from animals.models import Animal


class Report(models.Model):
    # Keep your existing STATUS_CHOICES and ADD new ones
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('ASSIGNED', 'Assigned'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
        # NEW: Add rescue-specific statuses
        ('INVESTIGATING', 'Under Investigation'),
        ('RESCUE_IN_PROGRESS', 'Rescue In Progress'),
        ('RESCUED', 'Successfully Rescued'),
        ('RELOCATED', 'Animal Relocated'),
    )
    
    # NEW: Add urgency levels for rescue operations
    URGENCY_CHOICES = (
        ('LOW', 'Low Priority'),
        ('NORMAL', 'Normal'),
        ('HIGH', 'High Priority'),
        ('EMERGENCY', 'Emergency'),
    )
    
    # NEW: Add animal condition choices
    CONDITION_CHOICES = (
        ('HEALTHY', 'Appears Healthy'),
        ('INJURED', 'Injured'),
        ('SICK', 'Appears Sick'),
        ('AGGRESSIVE', 'Aggressive'),
        ('SCARED', 'Scared/Hiding'),
        ('PREGNANT', 'Pregnant'),
        ('WITH_BABIES', 'With Babies'),
        ('UNKNOWN', 'Unknown'),
    )

    # NEW: Animal size choices for volunteer safety
    SIZE_CHOICES = (
        ('SMALL', 'Small (under 25 lbs)'),
        ('MEDIUM', 'Medium (25-60 lbs)'), 
        ('LARGE', 'Large (60-100 lbs)'),
        ('EXTRA_LARGE', 'Extra Large (over 100 lbs)'),
        ('UNKNOWN', 'Size Unknown'),
    )

    # NEW: Behavior/aggression choices for volunteer safety  
    BEHAVIOR_CHOICES = (
        ('FRIENDLY', 'Friendly/Approachable'),
        ('NEUTRAL', 'Calm/Neutral'),
        ('SCARED', 'Scared/Timid'),
        ('DEFENSIVE', 'Defensive/Protective'),
        ('AGGRESSIVE', 'Aggressive/Dangerous'),
        ('UNKNOWN', 'Behavior Unknown'),
    )
    
    # Your existing fields (KEEP EXACTLY AS IS)
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='reports'
    )
    animal = models.ForeignKey(
        Animal, 
        on_delete=models.CASCADE, 
        related_name='reports', 
        null=True, 
        blank=True
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    # 🔧 NEW: Animal type field for emergency reports
    animal_type = models.CharField(
        max_length=20,
        choices=[
            ('DOG', 'Dog'),
            ('CAT', 'Cat'),
            ('BIRD', 'Bird'),
            ('RABBIT', 'Rabbit'),
            ('OTHER', 'Other'),
        ],
        null=True,
        blank=True,
        help_text="Animal type for emergency reports without linked Animal objects"
    )
    
    # Your existing location fields (KEEP EXACTLY AS IS)
    geo_location = gis_models.PointField(geography=True)
    location_json = models.JSONField(blank=True, null=True)
    location_details = models.TextField(blank=True, null=True)
    
    # Your existing report fields (KEEP EXACTLY AS IS)
    description = models.TextField()
    animal_condition = models.TextField(blank=True, null=True)  # We'll enhance this below
    photos = models.JSONField(default=list, blank=True)
    
    # Your existing rescue fields (KEEP EXACTLY AS IS)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='assigned_reports'
    )
    rescue_notes = models.TextField(blank=True, null=True)
    rescue_time = models.DateTimeField(blank=True, null=True)
    
    # Your existing timestamps (KEEP EXACTLY AS IS)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    tracking_id = models.CharField(
    	max_length=20, 
    	unique=True, 
    	null=True, 
    	blank=True,
    	help_text="User-friendly tracking ID for public report tracking"
    )
    
    # NEW FIELDS: Add these for rescue operations (safe additions)
    urgency_level = models.CharField(
        max_length=10, 
        choices=URGENCY_CHOICES, 
        default='NORMAL',
        help_text="Priority level for rescue operations"
    )
    
    # Enhanced animal condition (optional structured field)
    animal_condition_choice = models.CharField(
        max_length=20, 
        choices=CONDITION_CHOICES, 
        default='UNKNOWN',
        blank=True,
        null=True,
        help_text="Structured animal condition (supplements text field)"
    )

    animal_size = models.CharField(
        max_length=15, 
        choices=SIZE_CHOICES, 
        default='UNKNOWN',
        help_text="Animal size for volunteer safety assessment"
    )

    animal_behavior = models.CharField(
        max_length=15, 
        choices=BEHAVIOR_CHOICES, 
        default='UNKNOWN', 
        help_text="Animal behavior for volunteer safety assessment"
    )

    special_handling_notes = models.TextField(
        blank=True, 
        null=True,
        help_text="Special equipment or handling requirements"
    )
    
    # Additional rescue fields
    estimated_rescue_time = models.DateTimeField(null=True, blank=True)
    follow_up_required = models.BooleanField(default=False)
    follow_up_notes = models.TextField(blank=True, null=True)
    outcome = models.CharField(
        max_length=50, 
        blank=True, 
        null=True,
        help_text="Final outcome of the report"
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    # 🔧 NEW: Volunteer-specific fields for emergency reports
    reported_by_volunteer = models.BooleanField(default=False, help_text="Report created by volunteer")
    volunteer_report_type = models.CharField(
        max_length=20,
        choices=[
            ('NEW_EMERGENCY', 'New Emergency'),
            ('ESCALATION', 'Escalation'),
            ('BACKUP_NEEDED', 'Backup Needed'),
        ],
        null=True,
        blank=True
    )
    situation_type = models.CharField(
        max_length=30,
        choices=[
            ('ON_SCENE', 'On Scene'),
            ('SPOTTED_WHILE_TRAVELING', 'Spotted While Traveling'),
        ],
        null=True,
        blank=True
    )
    related_assignment_id = models.IntegerField(null=True, blank=True)
    immediate_danger = models.BooleanField(default=False)
    access_difficulties = models.TextField(blank=True, null=True)
    equipment_needed = models.TextField(blank=True, null=True)
    backup_requested = models.BooleanField(default=False)
    volunteer_can_respond = models.BooleanField(default=False)
    
    # Your existing property (KEEP EXACTLY AS IS)
    @property
    def location(self):
        """Return location data for the API"""
        if self.geo_location:
            return {
                'lat': self.geo_location.y,
                'lng': self.geo_location.x
            }
        return self.location_json
    
    # NEW: Add latitude/longitude properties for compatibility
    @property
    def latitude(self):
        """Get latitude from geo_location"""
        if self.geo_location:
            return self.geo_location.y
        elif self.location_json and 'lat' in self.location_json:
            return self.location_json['lat']
        return None
    
    @property
    def longitude(self):
        """Get longitude from geo_location"""
        if self.geo_location:
            return self.geo_location.x
        elif self.location_json and 'lng' in self.location_json:
            return self.location_json['lng']
        return None
    
    # NEW: Add rescue-related properties
    @property
    def is_urgent(self):
        """Check if report requires urgent attention"""
        return self.urgency_level in ['HIGH', 'EMERGENCY']
    
    @property
    def assigned_volunteers(self):
        """Get volunteers assigned to this rescue"""
        return self.volunteer_assignments.filter(
            status__in=['ASSIGNED', 'ACCEPTED', 'EN_ROUTE', 'ON_SCENE']
        )
    
    @property
    def time_since_reported(self):
        """Get time elapsed since report was created"""
        return timezone.now() - self.created_at
    
    @property
    def response_time_hours(self):
        """Calculate response time in hours (when first volunteer was assigned)"""
        first_assignment = self.volunteer_assignments.order_by('assigned_at').first()
        if first_assignment:
            delta = first_assignment.assigned_at - self.created_at
            return delta.total_seconds() / 3600
        return None

    def generate_tracking_id(self):
    	"""Generate a user-friendly tracking ID"""
    	if not self.tracking_id and self.id:
            year = self.created_at.year if self.created_at else timezone.now().year
            # Format: PWR-YYYY-NNNN (e.g., PWR-2025-0001)
            self.tracking_id = f"PWR-{year}-{self.id:04d}"
            self.save(update_fields=['tracking_id'])
    	return self.tracking_id
    
    # NEW: Add rescue-related methods
    def save(self, *args, **kwargs):
        is_new = self.pk is None

        if is_new and not self.animal_type:
            self.animal_type = self.detect_animal_type()
        
        # Set urgency based on condition if not explicitly set
        if is_new and self.urgency_level == 'NORMAL':
            self.urgency_level = self.calculate_urgency()
        
        super().save(*args, **kwargs)

        if is_new and not self.tracking_id:
            self.generate_tracking_id()
        
        # Auto-assign volunteers for new high-priority reports
        if is_new and self.urgency_level in ['HIGH', 'EMERGENCY']:
            self.auto_assign_volunteers()
    
    def calculate_urgency(self):
        """Calculate urgency level based on animal condition and description"""
        # Check structured condition field if available
        if self.animal_condition_choice:
            emergency_conditions = ['INJURED', 'SICK']
            if self.animal_condition_choice in emergency_conditions:
                return 'EMERGENCY'
            
            high_priority_conditions = ['AGGRESSIVE', 'PREGNANT', 'WITH_BABIES']
            if self.animal_condition_choice in high_priority_conditions:
                return 'HIGH'
        
        # Check text description for urgent keywords
        if self.description:
            description_lower = self.description.lower()
            urgent_keywords = ['injured', 'bleeding', 'hit by car', 'emergency', 'urgent', 'dying', 'trapped']
            if any(keyword in description_lower for keyword in urgent_keywords):
                return 'EMERGENCY'
            
            priority_keywords = ['aggressive', 'pregnant', 'babies', 'puppies', 'kittens', 'scared']
            if any(keyword in description_lower for keyword in priority_keywords):
                return 'HIGH'
        
        # Check text animal condition field
        if self.animal_condition:
            condition_lower = self.animal_condition.lower()
            if any(keyword in condition_lower for keyword in ['injured', 'sick', 'bleeding']):
                return 'EMERGENCY'
            if any(keyword in condition_lower for keyword in ['aggressive', 'pregnant']):
                return 'HIGH'
        
        return 'NORMAL'

    def detect_animal_type(self):
        """Auto-detect animal type from description and condition"""
        # Check description for animal keywords
        text_to_check = []
        if self.description:
            text_to_check.append(self.description.lower())
        if self.animal_condition:
            text_to_check.append(self.animal_condition.lower())
    
        combined_text = ' '.join(text_to_check)
    
        # Animal type detection
        if any(word in combined_text for word in ['dog', 'puppy', 'canine', 'pup']):
            return 'DOG'
        elif any(word in combined_text for word in ['cat', 'kitten', 'feline', 'kitty']):
            return 'CAT'
        elif any(word in combined_text for word in ['bird', 'chicken', 'duck', 'pigeon']):
            return 'BIRD'
        elif any(word in combined_text for word in ['rabbit', 'bunny']):
            return 'RABBIT'
    
        return 'OTHER'  # Default fallback

    
    
    def auto_assign_volunteers(self):
        """Automatically assign volunteers to high-priority reports"""
        try:
            from volunteers.services import RescueVolunteerService
            assignments = RescueVolunteerService.assign_volunteers_to_rescue(self)
            if assignments:
                self.status = 'ASSIGNED'
                self.save(update_fields=['status'])
        except ImportError:
            pass  # Volunteer service not available
    
    def get_distance_to(self, latitude, longitude):
        """Calculate distance to another location in kilometers"""
        if not self.latitude or not self.longitude:
            return None
            
        try:
            from geopy.distance import geodesic
            return geodesic((self.latitude, self.longitude), (latitude, longitude)).kilometers
        except ImportError:
            # Fallback to simple calculation
            import math
            lat_diff = math.radians(latitude - self.latitude)
            lng_diff = math.radians(longitude - self.longitude)
            a = (math.sin(lat_diff / 2) ** 2 + 
                 math.cos(math.radians(self.latitude)) * math.cos(math.radians(latitude)) * 
                 math.sin(lng_diff / 2) ** 2)
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
            return 6371 * c  # Earth's radius in km
    
    def update_status(self, new_status, notes=None):
        """Update report status with timestamp tracking"""
        old_status = self.status
        self.status = new_status
        
        if notes:
            if self.rescue_notes:
                self.rescue_notes += f"\n{timezone.now().strftime('%Y-%m-%d %H:%M')}: {notes}"
            else:
                self.rescue_notes = f"{timezone.now().strftime('%Y-%m-%d %H:%M')}: {notes}"
        
        # Set resolved timestamp for final statuses
        if new_status in ['RESCUED', 'COMPLETED', 'CANCELLED'] and not self.resolved_at:
            self.resolved_at = timezone.now()
        
        self.save()
        
        # Send status update notifications
        self.send_status_notification(old_status, new_status)
    
    def send_status_notification(self, old_status, new_status):
        """Send notification about status change"""
        try:
            from notifications.services import create_notification
            
            status_messages = {
                'INVESTIGATING': 'Your report is being investigated by our team.',
                'ASSIGNED': 'A volunteer has been assigned to help with your report!',
                'RESCUE_IN_PROGRESS': 'Rescue operation is currently in progress.',
                'RESCUED': 'Great news! The animal has been successfully rescued.',
                'RELOCATED': 'The animal has been safely relocated.',
                'COMPLETED': 'Your report has been resolved.',
                'CANCELLED': 'This report has been cancelled.'
            }
            
            message = status_messages.get(new_status, f'Report status updated to: {new_status}')
            
            create_notification(
                recipient=self.reporter,  # Use your field name 'reporter'
                notification_type='REPORT_UPDATE',
                title=f'Report #{self.id} Update',
                message=message,
                related_object=self
            )
            
        except ImportError:
            pass  # Notification service not available
    
    def __str__(self):
        return f"Report #{self.id} - {self.status}"

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'urgency_level']),
            models.Index(fields=['created_at']),
            models.Index(fields=['urgency_level']),
            models.Index(fields=['animal_type']),  # NEW: Add index for animal_type
        ]


# NEW: Additional models for enhanced rescue tracking
class ReportUpdate(models.Model):
    """Track updates and comments on reports"""
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name='updates')
    updated_by = models.ForeignKey(
    	settings.AUTH_USER_MODEL, 
    	on_delete=models.CASCADE,
    	null=True,  # ✅ Allow null for anonymous reports
    	blank=True
    )
    update_type = models.CharField(max_length=20, choices=[
        ('STATUS_CHANGE', 'Status Change'),
        ('COMMENT', 'Comment'),
        ('VOLUNTEER_ASSIGNED', 'Volunteer Assigned'),
        ('LOCATION_UPDATE', 'Location Update'),
        ('CONDITION_UPDATE', 'Condition Update'),
    ])
    message = models.TextField()
    old_value = models.CharField(max_length=100, blank=True, null=True)
    new_value = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Update for Report #{self.report.id} by {self.updated_by.username}"


# Signal to create automatic updates when reports change
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Report)
def create_report_update(sender, instance, created, **kwargs):
    """Automatically create update records when reports change"""
    if created:
        ReportUpdate.objects.create(
            report=instance,
            updated_by=instance.reporter,  # Use your field name 'reporter'
            update_type='STATUS_CHANGE',
            message=f'Report created with {instance.urgency_level} priority{"(Anonymous)" if not instance.reporter else ""}',
            new_value=instance.status
        )
