from django.db import models
from django.conf import settings
from animals.models import Animal

class AdopterProfile(models.Model):
    # Living Situation
    HOUSING_TYPES = (
        ('HOUSE', 'House'),
        ('APARTMENT', 'Apartment'),
        ('CONDO', 'Condo'),
        ('OTHER', 'Other'),
    )
    
    YARD_SIZES = (
        ('NONE', 'No Yard'),
        ('SMALL', 'Small Yard'),
        ('MEDIUM', 'Medium Yard'),
        ('LARGE', 'Large Yard'),
    )
    
    # Lifestyle
    ACTIVITY_LEVELS = (
        ('SEDENTARY', 'Sedentary'),
        ('MODERATELY_ACTIVE', 'Moderately Active'),
        ('ACTIVE', 'Active'),
        ('VERY_ACTIVE', 'Very Active'),
    )
    
    # Experience
    PET_EXPERIENCE = (
        ('NONE', 'No Experience'),
        ('BEGINNER', 'Some Experience'),
        ('INTERMEDIATE', 'Moderate Experience'),
        ('EXPERT', 'Extensive Experience'),
    )
    
    # Link to user
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    # Living situation
    housing_type = models.CharField(max_length=20, choices=HOUSING_TYPES)
    has_yard = models.BooleanField(default=False)
    yard_size = models.CharField(max_length=20, choices=YARD_SIZES, blank=True, null=True)
    rent_permission = models.BooleanField(default=False, help_text="Do you have permission from landlord to keep pets?")
    
    # Household composition
    adults_in_home = models.PositiveIntegerField(default=1)
    children_in_home = models.PositiveIntegerField(default=0)
    children_ages = models.CharField(max_length=100, blank=True, null=True, help_text="Ages of children, separated by commas")
    
    # Pet experience
    pet_experience = models.CharField(max_length=20, choices=PET_EXPERIENCE)
    current_pets = models.TextField(blank=True, null=True, help_text="Description of current pets")
    previous_pets = models.TextField(blank=True, null=True, help_text="Description of previous pets")
    
    # Lifestyle
    activity_level = models.CharField(max_length=20, choices=ACTIVITY_LEVELS)
    work_schedule = models.CharField(max_length=100, help_text="Typical work schedule")
    hours_alone = models.PositiveIntegerField(help_text="Hours pet would be alone daily")
    
    # Preferences
    preferred_animal_type = models.CharField(max_length=10, choices=Animal.ANIMAL_TYPES, blank=True, null=True)
    preferred_age = models.CharField(max_length=50, blank=True, null=True)
    preferred_size = models.CharField(max_length=50, blank=True, null=True)
    preferred_gender = models.CharField(max_length=10, choices=Animal.GENDER_TYPES, blank=True, null=True)
    
    # Other considerations
    willing_to_train = models.BooleanField(default=True)
    special_needs_capable = models.BooleanField(default=False)
    budget_for_pet = models.CharField(max_length=100, help_text="Monthly budget for pet care")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Adopter Profile for {self.user.username}"


class AnimalBehaviorProfile(models.Model):
    # Energy levels
    ENERGY_LEVELS = (
        ('LOW', 'Low Energy'),
        ('MEDIUM', 'Medium Energy'),
        ('HIGH', 'High Energy'),
        ('VERY_HIGH', 'Very High Energy'),
    )
    
    # Temperament
    TEMPERAMENTS = (
        ('CALM', 'Calm'),
        ('PLAYFUL', 'Playful'),
        ('INDEPENDENT', 'Independent'),
        ('AFFECTIONATE', 'Affectionate'),
        ('PROTECTIVE', 'Protective'),
        ('SHY', 'Shy'),
        ('ANXIOUS', 'Anxious'),
    )
    
    # Training levels
    TRAINING_LEVELS = (
        ('NONE', 'No Training'),
        ('BASIC', 'Basic Commands'),
        ('INTERMEDIATE', 'Well Trained'),
        ('ADVANCED', 'Extensively Trained'),
    )
    
    animal = models.OneToOneField(Animal, on_delete=models.CASCADE, related_name='behavior_profile')
    
    # Behavior characteristics
    energy_level = models.CharField(max_length=20, choices=ENERGY_LEVELS)
    temperament = models.CharField(max_length=20, choices=TEMPERAMENTS)
    training_level = models.CharField(max_length=20, choices=TRAINING_LEVELS)
    
    # Social behavior
    good_with_children = models.BooleanField(default=False)
    good_with_dogs = models.BooleanField(default=False)
    good_with_cats = models.BooleanField(default=False)
    good_with_strangers = models.BooleanField(default=False)
    
    # Special considerations
    house_trained = models.BooleanField(default=False)
    leash_trained = models.BooleanField(default=False)
    special_needs = models.TextField(blank=True, null=True)
    medical_needs = models.TextField(blank=True, null=True)
    
    # Additional notes
    behavior_notes = models.TextField(blank=True, null=True)
    ideal_home = models.TextField(blank=True, null=True, help_text="Description of ideal home environment")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Behavior Profile for {self.animal.name or 'Unnamed'}"


class AdoptionApplication(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending Review'),
        ('UNDER_REVIEW', 'Under Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('WITHDRAWN', 'Withdrawn'),
    )
    
    applicant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='adoption_applications')
    animal = models.ForeignKey(Animal, on_delete=models.CASCADE, related_name='adoption_applications')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    compatibility_score = models.FloatField(blank=True, null=True)
    
    # Application details
    why_adopt = models.TextField(help_text="Why do you want to adopt this animal?")
    previous_adoption = models.BooleanField(default=False)
    previous_adoption_details = models.TextField(blank=True, null=True)
    
    # References
    veterinarian_info = models.TextField(blank=True, null=True)
    personal_reference = models.TextField(blank=True, null=True)
    
    # Agreement fields
    agree_home_visit = models.BooleanField(default=False)
    agree_follow_up = models.BooleanField(default=False)
    
    # Administrative fields
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_applications')
    review_notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Application by {self.applicant.username} for {self.animal.name or 'Unnamed'}"
    
    class Meta:
        ordering = ['-created_at']


class AdoptionMatch(models.Model):
    adopter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='adoption_matches')
    animal = models.ForeignKey(Animal, on_delete=models.CASCADE, related_name='adoption_matches')
    
    # Compatibility scores (0-100)
    overall_score = models.FloatField()
    lifestyle_score = models.FloatField()
    experience_score = models.FloatField()
    housing_score = models.FloatField()
    family_score = models.FloatField()
    
    # Match details
    match_reasons = models.JSONField(blank=True, null=True)
    potential_challenges = models.JSONField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Match: {self.adopter.username} - {self.animal.name or 'Unnamed'} ({self.overall_score}%)"
    
    class Meta:
        ordering = ['-overall_score']
        unique_together = ('adopter', 'animal')
