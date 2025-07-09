# Create this file: volunteers/management/commands/create_rescue_achievements.py

from django.core.management.base import BaseCommand
from community.models import Achievement


class Command(BaseCommand):
    help = 'Create rescue-related achievements'

    def handle(self, *args, **options):
        rescue_achievements = [
            {
                'name': 'First Responder',
                'description': 'Complete your first animal rescue',
                'category': 'RESCUE',
                'icon': 'emergency_rescue',
                'criteria': {'type': 'rescue_count', 'count': 1},
                'points_reward': 50
            },
            {
                'name': 'Rescue Hero',
                'description': 'Complete 10 animal rescues',
                'category': 'RESCUE',
                'icon': 'volunteer_activism',
                'criteria': {'type': 'rescue_count', 'count': 10},
                'points_reward': 200
            },
            {
                'name': 'Lightning Response',
                'description': 'Maintain average response time under 15 minutes',
                'category': 'RESCUE',
                'icon': 'flash_on',
                'criteria': {'type': 'rescue_response_time', 'max_minutes': 15},
                'points_reward': 150
            },
            {
                'name': 'Emergency Expert',
                'description': 'Complete 5 emergency rescues',
                'category': 'RESCUE',
                'icon': 'local_hospital',
                'criteria': {'type': 'emergency_rescues', 'count': 5},
                'points_reward': 300
            },
            {
                'name': 'Certified Rescuer',
                'description': 'Earn your first rescue certification',
                'category': 'TRAINING',
                'icon': 'verified',
                'criteria': {'type': 'certification_count', 'count': 1},
                'points_reward': 100
            },
            {
                'name': 'Training Graduate',
                'description': 'Complete 3 training modules',
                'category': 'TRAINING',
                'icon': 'school',
                'criteria': {'type': 'training_completion', 'count': 3},
                'points_reward': 75
            },
            {
                'name': 'Rescue Master',
                'description': 'Complete 25 rescues with excellent rating',
                'category': 'RESCUE',
                'icon': 'stars',
                'criteria': {'type': 'rescue_count', 'count': 25},
                'points_reward': 500
            },
            {
                'name': 'Community Guardian',
                'description': 'Earn 1000 points from rescue activities',
                'category': 'RESCUE',
                'icon': 'shield',
                'criteria': {'type': 'points_earned', 'points': 1000},
                'points_reward': 100
            },
            {
                'name': 'Quick Learner',
                'description': 'Complete a training module with 90%+ score',
                'category': 'TRAINING',
                'icon': 'psychology',
                'criteria': {'type': 'training_completion', 'count': 1, 'min_score': 90},
                'points_reward': 50
            },
            {
                'name': 'Dedication Award',
                'description': 'Complete rescues for 30 consecutive days',
                'category': 'RESCUE',
                'icon': 'event_available',
                'criteria': {'type': 'rescue_streak', 'days': 30},
                'points_reward': 400
            }
        ]

        created_count = 0
        for achievement_data in rescue_achievements:
            achievement, created = Achievement.objects.get_or_create(
                name=achievement_data['name'],
                defaults=achievement_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created achievement: {achievement.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Achievement already exists: {achievement.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} new achievements')
        )
