from django.db import models
from django.conf import settings
from django.utils import timezone

# For GPS functionality - you may need to install GeoDjango
try:
    from django.contrib.gis.db import models as geo_models
    from django.contrib.gis.geos import Point
    HAS_GIS = True
except ImportError:
    # Fallback if GeoDjango is not available
    HAS_GIS = False
    print("Warning: GeoDjango not available. GPS features will be limited.")


class VolunteerProfile(models.Model):
    AVAILABILITY_CHOICES = (
        ('WEEKDAYS', 'Weekdays'),
        ('WEEKENDS', 'Weekends'),
        ('EVENINGS', 'Evenings'),
        ('FLEXIBLE', 'Flexible Schedule'),
    )
    
    EXPERIENCE_LEVELS = (
        ('BEGINNER', 'Beginner'),
        ('INTERMEDIATE', 'Intermediate'),
        ('EXPERIENCED', 'Experienced'),
        ('PROFESSIONAL', 'Professional'),
    )
    
    RESCUE_EXPERIENCE_LEVELS = (
        ('NONE', 'No Experience'),
        ('BEGINNER', 'Beginner'),
        ('INTERMEDIATE', 'Intermediate'),
        ('EXPERIENCED', 'Experienced'),
        ('EXPERT', 'Expert'),
    )
    
    CONTACT_METHOD_CHOICES = (
        ('SMS', 'Text Message'),
        ('CALL', 'Phone Call'),
        ('EMAIL', 'Email'),
        ('APP', 'App Notification')
    )
    
    # Existing fields
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='volunteer_profile')
    skills = models.JSONField(default=list)  # List of skills
    interests = models.JSONField(default=list)  # Areas of interest
    availability = models.CharField(max_length=20, choices=AVAILABILITY_CHOICES)
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_LEVELS)
    has_animal_handling = models.BooleanField(default=False)  # Experience handling animals
    has_transportation = models.BooleanField(default=False)  # Has own transportation
    preferred_animals = models.JSONField(default=list)  # Types of animals they prefer to work with
    bio = models.TextField(blank=True, null=True)
    emergency_contact = models.CharField(max_length=255, blank=True, null=True)
    total_hours = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # NEW: Rescue-specific fields
    max_rescue_distance_km = models.IntegerField(default=10, help_text="Maximum distance willing to travel for rescues")
    available_for_emergency = models.BooleanField(default=False, help_text="Available for urgent rescue calls")
    rescue_experience_level = models.CharField(max_length=20, choices=RESCUE_EXPERIENCE_LEVELS, default='NONE')
    
    # NEW: GPS and tracking consent
    gps_tracking_consent = models.BooleanField(default=False, help_text="Consent to GPS tracking during rescues")
    last_location_update = models.DateTimeField(null=True, blank=True)
    
    # NEW: Enhanced contact preferences
    emergency_contact_phone = models.CharField(max_length=20, blank=True, null=True)
    preferred_contact_method = models.CharField(max_length=20, choices=CONTACT_METHOD_CHOICES, default='APP')
    
    # NEW: Rescue statistics
    total_rescues_completed = models.IntegerField(default=0)
    average_response_time_minutes = models.FloatField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.username}'s Volunteer Profile"
    
    def is_available_for_rescue(self, urgency='NORMAL', distance_km=None):
        """Check if volunteer is available for rescue based on distance and urgency"""
        # Basic availability checks
        if not self.has_animal_handling:
            return False
        
        if not self.gps_tracking_consent:
            return False
        
        # Check emergency availability for urgent cases
        if urgency in ['HIGH', 'EMERGENCY'] and not self.available_for_emergency:
            return False
        
        # Check distance preference
        if distance_km and distance_km > self.max_rescue_distance_km:
            return False
        
        # Check if user is currently active
        if not self.user.is_active:
            return False
        
        return True
    
    def update_rescue_stats(self):
        """Update rescue statistics after completion"""
        completed_rescues = self.user.rescue_assignments.filter(status='COMPLETED')
        self.total_rescues_completed = completed_rescues.count()
        
        # Calculate average response time
        response_times = completed_rescues.exclude(response_time_minutes__isnull=True).values_list('response_time_minutes', flat=True)
        if response_times:
            self.average_response_time_minutes = sum(response_times) / len(response_times)
        
        self.save(update_fields=['total_rescues_completed', 'average_response_time_minutes'])


class VolunteerOpportunity(models.Model):
    STATUS_CHOICES = (
        ('OPEN', 'Open'),
        ('FILLED', 'Filled'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )
    
    CATEGORY_CHOICES = (
        ('ANIMAL_CARE', 'Animal Care'),
        ('ADOPTION_EVENT', 'Adoption Event'),
        ('FUNDRAISING', 'Fundraising'),
        ('TRANSPORT', 'Transportation'),
        ('ADMIN', 'Administrative'),
        ('MAINTENANCE', 'Facility Maintenance'),
        ('RESCUE_TRAINING', 'Rescue Training'),  # NEW
        ('EMERGENCY_RESPONSE', 'Emergency Response'),  # NEW
        ('OTHER', 'Other'),
    )
    
    title = models.CharField(max_length=100)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    location = models.CharField(max_length=255)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    skills_required = models.JSONField(default=list)
    min_volunteers = models.IntegerField(default=1)
    max_volunteers = models.IntegerField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_opportunities')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # NEW: Enhanced opportunity features
    requires_transportation = models.BooleanField(default=False, help_text="Requires volunteers to have transportation")
    minimum_experience = models.CharField(max_length=20, choices=VolunteerProfile.EXPERIENCE_LEVELS, default='BEGINNER')
    is_emergency = models.BooleanField(default=False, help_text="Emergency opportunity requiring immediate response")
    
    def __str__(self):
        return self.title
    
    @property
    def duration_hours(self):
        """Calculate duration in hours"""
        delta = self.end_time - self.start_time
        return delta.total_seconds() / 3600
    
    @property
    def is_upcoming(self):
        """Check if opportunity is in the future"""
        return self.start_time > timezone.now()
    
    def can_volunteer_participate(self, volunteer_profile):
        """Check if a volunteer meets the requirements for this opportunity"""
        # Check transportation requirement
        if self.requires_transportation and not volunteer_profile.has_transportation:
            return False
        
        # Check experience level
        experience_levels = ['BEGINNER', 'INTERMEDIATE', 'EXPERIENCED', 'PROFESSIONAL']
        min_level_index = experience_levels.index(self.minimum_experience)
        volunteer_level_index = experience_levels.index(volunteer_profile.experience_level)
        
        if volunteer_level_index < min_level_index:
            return False
        
        # Check skills match
        if self.skills_required:
            volunteer_skills = set(volunteer_profile.skills)
            required_skills = set(self.skills_required)
            if not required_skills.intersection(volunteer_skills):
                return False
        
        return True


class VolunteerAssignment(models.Model):
    STATUS_CHOICES = (
        ('ASSIGNED', 'Assigned'),
        ('CONFIRMED', 'Confirmed'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
        ('NO_SHOW', 'No Show'),
    )
    
    volunteer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='volunteer_assignments')
    opportunity = models.ForeignKey(VolunteerOpportunity, on_delete=models.CASCADE, related_name='assignments')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ASSIGNED')
    hours_logged = models.FloatField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    assigned_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ('volunteer', 'opportunity')
    
    def __str__(self):
        return f"{self.volunteer.username} - {self.opportunity.title}"
    
    def complete_assignment(self, hours=None):
        """Mark assignment as completed and log hours"""
        self.status = 'COMPLETED'
        self.completed_at = timezone.now()
        
        # Set hours logged
        if hours is None:
            # Calculate based on opportunity duration
            self.hours_logged = self.opportunity.duration_hours
        else:
            self.hours_logged = hours
        
        # Update volunteer's total hours
        profile, created = VolunteerProfile.objects.get_or_create(user=self.volunteer)
        profile.total_hours += self.hours_logged
        profile.save()
        
        self.save()
        
        # Award points via community system
        try:
            from community.services import award_points
            award_points(self.volunteer, 'VOLUNTEER_HOURS', self)
        except ImportError:
            pass  # Community system not available


# NEW: Rescue Volunteer Assignment Model
class RescueVolunteerAssignment(models.Model):
    """Links volunteers to specific animal rescue reports"""
    STATUS_CHOICES = (
        ('ASSIGNED', 'Assigned'),
        ('ACCEPTED', 'Accepted'),
        ('EN_ROUTE', 'En Route'),
        ('ON_SCENE', 'On Scene'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )
    
    ASSIGNMENT_TYPE_CHOICES = (
        ('PRIMARY', 'Primary Responder'),
        ('BACKUP', 'Backup Support'),
        ('TRANSPORT', 'Transportation'),
        ('MEDICAL', 'Medical Support')
    )
    
    volunteer = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='rescue_assignments'
    )
    report = models.ForeignKey(
        'reports.Report', 
        on_delete=models.CASCADE, 
        related_name='volunteer_assignments'
    )
    assignment_type = models.CharField(max_length=20, choices=ASSIGNMENT_TYPE_CHOICES, default='PRIMARY')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ASSIGNED')
    
    # Timestamps
    assigned_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    estimated_arrival = models.DateTimeField(null=True, blank=True)
    
    # GPS Tracking (conditional on GeoDjango availability)
    if HAS_GIS:
        current_location = geo_models.PointField(null=True, blank=True)
    else:
        current_location_lat = models.FloatField(null=True, blank=True)
        current_location_lng = models.FloatField(null=True, blank=True)
    
    location_updates = models.JSONField(default=list)  # Store GPS tracking history
    
    # Response metrics
    response_time_minutes = models.IntegerField(null=True, blank=True)
    travel_distance_km = models.FloatField(null=True, blank=True)
    
    # Notes
    volunteer_notes = models.TextField(blank=True, null=True)
    completion_notes = models.TextField(blank=True, null=True)
    
    class Meta:
        unique_together = ('volunteer', 'report')
        ordering = ['-assigned_at']
    
    def __str__(self):
        return f"{self.volunteer.username} - {self.report.animal_type} rescue"
    
    def calculate_response_time(self):
        """Calculate response time in minutes"""
        if self.accepted_at and self.assigned_at:
            delta = self.accepted_at - self.assigned_at
            self.response_time_minutes = int(delta.total_seconds() / 60)
            self.save(update_fields=['response_time_minutes'])
            return self.response_time_minutes
        return None
    
    def update_location(self, latitude, longitude):
        """Update current location and add to tracking history"""
        try:
            if HAS_GIS:
                self.current_location = Point(longitude, latitude)
            else:
                self.current_location_lat = latitude
                self.current_location_lng = longitude
            
            location_update = {
                'latitude': latitude,
                'longitude': longitude,
                'timestamp': timezone.now().isoformat(),
                'status': self.status
            }
            
            # Ensure location_updates is a list
            if not isinstance(self.location_updates, list):
                self.location_updates = []
            
            self.location_updates.append(location_update)
            
            if HAS_GIS:
                self.save(update_fields=['current_location', 'location_updates'])
            else:
                self.save(update_fields=['current_location_lat', 'current_location_lng', 'location_updates'])
            
        except Exception as e:
            print(f"Error updating location: {e}")
    
    def mark_completed(self, completion_notes=None):
        """Mark rescue as completed and award points"""
        self.status = 'COMPLETED'
        self.completed_at = timezone.now()
        if completion_notes:
            self.completion_notes = completion_notes
        self.save()
        
        # Update volunteer profile stats
        try:
            volunteer_profile = self.volunteer.volunteer_profile
            volunteer_profile.update_rescue_stats()
        except VolunteerProfile.DoesNotExist:
            pass
        
        # Award points for completion
        try:
            from community.services import award_points
            award_points(self.volunteer, 'RESCUE_COMPLETED', self)
        except ImportError:
            pass  # Community system not available
    
    def get_current_location(self):
        """Get current location as tuple (lat, lng)"""
        if HAS_GIS and self.current_location:
            return (self.current_location.y, self.current_location.x)
        elif not HAS_GIS and self.current_location_lat and self.current_location_lng:
            return (self.current_location_lat, self.current_location_lng)
        return None


# NEW: Simplified Training Progress (without Resource dependency)
class VolunteerTrainingProgress(models.Model):
    """Track volunteer training completion and certifications"""
    volunteer = models.ForeignKey(VolunteerProfile, on_delete=models.CASCADE, related_name='training_progress')
    
    # Store training info directly instead of linking to Resource model
    training_title = models.CharField(max_length=200)
    training_slug = models.CharField(max_length=100, blank=True, null=True)  # For linking to frontend
    training_type = models.CharField(max_length=50, choices=[
        ('QUIZ', 'Quiz'),
        ('CHECKLIST', 'Checklist'),
        ('VIDEO', 'Video'),
        ('DOCUMENT', 'Document'),
        ('OTHER', 'Other')
    ], default='QUIZ')
    
    started_date = models.DateTimeField(auto_now_add=True)
    completed_date = models.DateTimeField(null=True, blank=True)
    score = models.IntegerField(null=True, blank=True)  # For quizzes
    progress_percentage = models.IntegerField(default=0)
    
    class Meta:
        unique_together = ('volunteer', 'training_slug')
    
    def __str__(self):
        return f"{self.volunteer.user.username} - {self.training_title}"
    
    def mark_completed(self, score=None):
        """Mark training as completed and award certification if eligible"""
        self.completed_date = timezone.now()
        self.progress_percentage = 100
        if score:
            self.score = score
        self.save()
        
        # Award certification if score is high enough
        if score and score >= 80:
            VolunteerSkillCertification.objects.get_or_create(
                volunteer=self.volunteer,
                skill_name=self.training_title,
                defaults={
                    'score_achieved': score
                }
            )
            
            # Award points for training completion
            try:
                from community.services import award_points
                award_points(self.volunteer.user, 'TRAINING_COMPLETED', self)
            except ImportError:
                pass


# NEW: Simplified Skill Certification (without Resource dependency)
class VolunteerSkillCertification(models.Model):
    """Track volunteer skill certifications"""
    volunteer = models.ForeignKey(VolunteerProfile, on_delete=models.CASCADE, related_name='certifications')
    skill_name = models.CharField(max_length=100)
    certified_date = models.DateTimeField(auto_now_add=True)
    expires_date = models.DateTimeField(null=True, blank=True)
    score_achieved = models.IntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    # Optional: Store reference to training resource by slug/URL instead of foreign key
    training_reference = models.CharField(max_length=200, blank=True, null=True)
    
    class Meta:
        unique_together = ('volunteer', 'skill_name')
        ordering = ['-certified_date']
    
    def __str__(self):
        return f"{self.volunteer.user.username} - {self.skill_name} Certified"
    
    def is_expired(self):
        """Check if certification has expired"""
        if self.expires_date:
            return timezone.now() > self.expires_date
        return False
    
    def renew_certification(self, new_expiry_date=None):
        """Renew the certification"""
        self.certified_date = timezone.now()
        self.is_active = True
        if new_expiry_date:
            self.expires_date = new_expiry_date
        self.save()
