from django.core.management.base import BaseCommand
from community.models import Achievement

class Command(BaseCommand):
    help = 'Creates initial achievements'

    def handle(self, *args, **options):
        achievements = [
            {
                'name': 'First Report',
                'description': 'Report your first stray animal',
                'category': 'REPORTING',
                'icon': 'pets',
                'criteria': {'type': 'report_count', 'count': 1},
                'points_reward': 50
            },
            {
                'name': 'Reporter Hero',
                'description': 'Report 10 stray animals',
                'category': 'REPORTING',
                'icon': 'stars',
                'criteria': {'type': 'report_count', 'count': 10},
                'points_reward': 200
            },
            {
                'name': 'First Donation',
                'description': 'Make your first donation',
                'category': 'DONATION',
                'icon': 'volunteer_activism',
                'criteria': {'type': 'activity_count', 'activity_type': 'DONATION_MADE', 'count': 1},
                'points_reward': 100
            },
            {
                'name': 'Generous Soul',
                'description': 'Donate over $500 total',
                'category': 'DONATION',
                'icon': 'favorite',
                'criteria': {'type': 'donation_amount', 'amount': 500},
                'points_reward': 500
            },
            {
                'name': 'Points Master',
                'description': 'Earn 1000 points',
                'category': 'COMMUNITY',
                'icon': 'emoji_events',
                'criteria': {'type': 'points_earned', 'points': 1000},
                'points_reward': 250
            },
        ]
        
        for ach_data in achievements:
            achievement, created = Achievement.objects.get_or_create(
                name=ach_data['name'],
                defaults=ach_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created achievement: {achievement.name}'))
            else:
                self.stdout.write(f'Achievement already exists: {achievement.name}')