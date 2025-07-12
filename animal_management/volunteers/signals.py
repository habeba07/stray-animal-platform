# volunteers/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from resources.models import LearningProgress
from .models import VolunteerProfile, VolunteerTrainingProgress

# Training module slug to certification name mapping
TRAINING_MAPPING = {
    'animal-rescue-fundamentals': 'Animal Rescue Fundamentals',
    'emergency-first-aid-animals': 'Emergency First Aid for Animals', 
    'large-animal-rescue-operations': 'Large Animal Rescue Operations',
    'animal-behavior-psychology': 'Animal Behavior and Psychology',
    'emergency-scene-management': 'Emergency Scene Management'
}

@receiver(post_save, sender=LearningProgress)
def create_volunteer_training_progress(sender, instance, created, **kwargs):
    """
    When a LearningProgress is marked as PASSED, create corresponding 
    VolunteerTrainingProgress record for the volunteer
    """
    # Only trigger for PASSED status with good score
    if instance.status == 'PASSED' and instance.best_score and instance.best_score >= 80:
        
        # Get the resource slug for mapping
        resource_slug = instance.module.resource.slug
        training_name = TRAINING_MAPPING.get(resource_slug)
        
        if training_name:
            try:
                # Get or create volunteer profile
                volunteer_profile, created = VolunteerProfile.objects.get_or_create(
                    user=instance.user
                )
                
                # Create or update training progress record
                training_progress, created = VolunteerTrainingProgress.objects.get_or_create(
                    volunteer=volunteer_profile,
                    training_slug=resource_slug,
                    defaults={
                        'training_title': training_name,
                        'training_type': 'QUIZ',
                        'score': instance.best_score,
                        'progress_percentage': 100
                    }
                )
                
                if not created and not training_progress.completed_date:
                    # Update existing incomplete record
                    training_progress.score = instance.best_score
                    training_progress.progress_percentage = 100
                    training_progress.save()
                
                # Mark as completed (this triggers certification creation)
                if not training_progress.completed_date:
                    training_progress.mark_completed(score=instance.best_score)
                
                print(f"✅ Created training record: {training_name} for {instance.user.username}")
                
            except Exception as e:
                print(f"❌ Error creating volunteer training progress: {e}")