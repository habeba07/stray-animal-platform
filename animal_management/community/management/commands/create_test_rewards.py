from django.core.management.base import BaseCommand
from community.models import Reward

class Command(BaseCommand):
    help = 'Create test rewards for testing redemption functionality'

    def handle(self, *args, **options):
        # Clear existing rewards for clean test
        Reward.objects.all().delete()
        
        # Create test rewards at different point levels
        rewards = [
            {
                'name': 'PAW Rescue Sticker Pack',
                'description': 'Adorable sticker pack featuring rescued animals. Perfect for decorating your laptop or notebook!',
                'reward_type': 'PHYSICAL',
                'points_required': 25,
                'quantity_available': 50,
                'is_active': True
            },
            {
                'name': 'Digital Certificate of Appreciation',
                'description': 'Personalized digital certificate recognizing your contribution to animal welfare.',
                'reward_type': 'RECOGNITION',
                'points_required': 30,
                'quantity_available': -1,  # Unlimited
                'is_active': True
            },
            {
                'name': 'Pet Store Discount Coupon',
                'description': '15% off coupon for participating pet stores. Valid for 6 months.',
                'reward_type': 'DISCOUNT',
                'points_required': 50,
                'quantity_available': 20,
                'is_active': True
            },
            {
                'name': 'PAW Rescue T-Shirt',
                'description': 'High-quality cotton t-shirt with PAW Rescue logo. Available in multiple sizes.',
                'reward_type': 'PHYSICAL',
                'points_required': 65,
                'quantity_available': 15,
                'is_active': True
            },
            {
                'name': 'VIP Shelter Tour',
                'description': 'Behind-the-scenes tour of our animal shelter facilities with a veterinarian guide.',
                'reward_type': 'SERVICE',
                'points_required': 75,
                'quantity_available': 10,
                'is_active': True
            },
            {
                'name': 'Animal Care Workshop',
                'description': 'Half-day workshop on animal care basics, including first aid and nutrition.',
                'reward_type': 'SERVICE',
                'points_required': 100,
                'quantity_available': 8,
                'is_active': True
            },
            {
                'name': 'Golden Volunteer Badge',
                'description': 'Special recognition badge for dedicated volunteers. Unlocks exclusive forum access.',
                'reward_type': 'PRIVILEGE',
                'points_required': 150,
                'quantity_available': 5,
                'is_active': True
            }
        ]
        
        created_count = 0
        for reward_data in rewards:
            reward, created = Reward.objects.get_or_create(
                name=reward_data['name'],
                defaults=reward_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created reward: {reward.name} ({reward.points_required} points)')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Reward already exists: {reward.name}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'\nSuccessfully created {created_count} test rewards!')
        )
        self.stdout.write('Test scenarios:')
        self.stdout.write('• Below user points (25, 30, 50): Should be redeemable')
        self.stdout.write('• Equal to user points (65): Should be redeemable')  
        self.stdout.write('• Above user points (75, 100, 150): Should show "not enough points"')