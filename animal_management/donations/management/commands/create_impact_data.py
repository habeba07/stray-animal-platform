

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone as django_timezone
from decimal import Decimal
from datetime import datetime, timedelta
import random

from donations.models import (
    DonationCampaign, Donation, ImpactCategory, DonationImpact, 
    SuccessStory, ImpactMetrics, DonorImpactSummary
)
from animals.models import Animal
from users.models import User

User = get_user_model()

class Command(BaseCommand):
    help = 'Create sample impact data for the Visual Impact Dashboard'

    def handle(self, *args, **options):
        self.stdout.write('🎯 Creating sample impact data...')
        
        # Create impact categories
        self.create_impact_categories()
        
        # Create sample donations and impacts
        self.create_sample_donations()
        
        # Create success stories
        self.create_success_stories()
        
        # Update donor summaries
        self.update_donor_summaries()
        
        self.stdout.write(
            self.style.SUCCESS('✅ Sample impact data created successfully!')
        )

    def create_impact_categories(self):
        """Create impact categories"""
        categories = [
            {
                'name': 'Emergency Medical Treatment',
                'category_type': 'MEDICAL',
                'description': 'Life-saving medical care for injured and sick animals',
                'icon': '🏥',
                'color': '#e74c3c',
                'cost_per_unit': Decimal('150.00'),
                'unit_name': 'treatment'
            },
            {
                'name': 'Daily Food & Nutrition',
                'category_type': 'FOOD',
                'description': 'Nutritious meals and supplements for animals in care',
                'icon': '🍽️',
                'color': '#f39c12',
                'cost_per_unit': Decimal('25.00'),
                'unit_name': 'week of food'
            },
            {
                'name': 'Safe Shelter & Housing',
                'category_type': 'SHELTER',
                'description': 'Warm, safe housing and shelter facilities',
                'icon': '🏠',
                'color': '#3498db',
                'cost_per_unit': Decimal('75.00'),
                'unit_name': 'month of shelter'
            },
            {
                'name': 'Rescue Operations',
                'category_type': 'RESCUE',
                'description': 'Emergency rescue missions and transportation',
                'icon': '🚑',
                'color': '#9b59b6',
                'cost_per_unit': Decimal('100.00'),
                'unit_name': 'rescue mission'
            },
            {
                'name': 'Adoption Services',
                'category_type': 'ADOPTION',
                'description': 'Adoption processing, matching, and support services',
                'icon': '❤️',
                'color': '#e91e63',
                'cost_per_unit': Decimal('50.00'),
                'unit_name': 'adoption process'
            },
            {
                'name': 'Community Education',
                'category_type': 'EDUCATION',
                'description': 'Educational programs and community outreach',
                'icon': '📚',
                'color': '#4caf50',
                'cost_per_unit': Decimal('30.00'),
                'unit_name': 'workshop'
            }
        ]
        
        for cat_data in categories:
            category, created = ImpactCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults=cat_data
            )
            if created:
                self.stdout.write(f"  ✅ Created category: {category.name}")

    def create_sample_donations(self):
        """Create sample donations with impact tracking"""
        
        # Get or create sample users
        users = []
        sample_users = [
            {'username': 'generous_sarah', 'email': 'sarah@example.com', 'first_name': 'Sarah', 'last_name': 'Johnson'},
            {'username': 'animal_lover_mike', 'email': 'mike@example.com', 'first_name': 'Mike', 'last_name': 'Chen'},
            {'username': 'caring_emma', 'email': 'emma@example.com', 'first_name': 'Emma', 'last_name': 'Davis'},
            {'username': 'helper_james', 'email': 'james@example.com', 'first_name': 'James', 'last_name': 'Wilson'},
        ]
        
        for user_data in sample_users:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults=user_data
            )
            users.append(user)
        
        # Get impact categories
        categories = list(ImpactCategory.objects.all())
        
        # Create donations over the last 12 months
        donations_created = 0
        for i in range(50):  # Create 50 sample donations
            # Random date in last 12 months
            days_ago = random.randint(1, 365)
            donation_date = datetime.now() - timedelta(days=days_ago)
            
            # Random donation amount
            amount = Decimal(str(random.randint(25, 500)))
            
            # Create donation
            donation = Donation.objects.create(
                donor=random.choice(users),
                amount=amount,
                donor_name=f"{random.choice(users).first_name} {random.choice(users).last_name}",
                donor_email=f"donor{i}@example.com",
                message=f"Happy to help animals in need! Donation #{i+1}",
                is_anonymous=random.choice([True, False]),
                created_at=donation_date
            )
            
            # Allocate donation to impact categories
            self.allocate_donation_impact(donation, categories)
            donations_created += 1
        
        self.stdout.write(f"  ✅ Created {donations_created} sample donations with impact tracking")

    def allocate_donation_impact(self, donation, categories):
        """Allocate a donation to various impact categories"""
        remaining_amount = donation.amount
        
        # Randomly select 1-3 categories for this donation
        selected_categories = random.sample(categories, random.randint(1, min(3, len(categories))))
        
        for i, category in enumerate(selected_categories):
            if i == len(selected_categories) - 1:
                # Last category gets remaining amount
                allocated_amount = remaining_amount
            else:
                # Random allocation (20-60% of remaining)
                percentage = random.uniform(0.2, 0.6)
                allocated_amount = remaining_amount * Decimal(str(percentage))
                allocated_amount = allocated_amount.quantize(Decimal('0.01'))
            
            # Calculate units helped
            units_helped = int(allocated_amount / category.cost_per_unit)
            if units_helped > 0:
                DonationImpact.objects.create(
                    donation=donation,
                    impact_category=category,
                    amount_allocated=allocated_amount,
                    units_helped=units_helped,
                    description=f"Helped {units_helped} {category.unit_name}s through this donation",
                    date_achieved=donation.created_at
                )
            
            remaining_amount -= allocated_amount
            if remaining_amount <= 0:
                break


    def create_success_stories(self):
        """Create inspiring success stories"""
    
        # Get some animals to create stories for
        animals = Animal.objects.all()[:10]  # Use first 10 animals
    
        # Better animal photos for before/after stories
        animal_photos = {
            'before': [
                'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=300&fit=crop&crop=face',  # Sad dog
                'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop&crop=face',  # Street cat
                'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop&crop=face',   # Injured dog
                'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop&crop=face', # Stray cat
                'https://images.unsplash.com/photo-1583512603806-077998240c7a?w=400&h=300&fit=crop&crop=face'  # Rescue dog
            ],
            'after': [
                'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop&crop=face',  # Happy dog
                'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400&h=300&fit=crop&crop=face', # Content cat
                'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop&crop=face', # Healthy dog
                'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop&crop=face',   # Happy cat
                'https://images.unsplash.com/photo-1583512603806-077998240c7a?w=400&h=300&fit=crop&crop=face'  # Loved dog
            ]
        }
    
        stories_data = [
            {
                'title': 'From Street to Sweet Home: Buddy\'s Journey',
                'story_text': 'Buddy was found injured on the streets, scared and malnourished. Thanks to donations from amazing supporters, we were able to provide him with emergency medical care, nutritious food, and a warm shelter. After 3 months of love and care, Buddy found his forever family and is now living his best life!',
                'total_cost': Decimal('450.00'),
                'days_in_care': 90
            },
            {
                'title': 'Miracle Recovery: Luna\'s Second Chance',
                'story_text': 'Luna arrived at our shelter in critical condition after being hit by a car. The veterinary bills were enormous, but thanks to the generosity of our donors, we could afford the life-saving surgery she needed. Today, Luna is healthy, happy, and playing in her new backyard!',
                'total_cost': Decimal('850.00'),
                'days_in_care': 120
            },
            {
                'title': 'Tiny Fighter: Max\'s Triumphant Tale',
                'story_text': 'Max was just a puppy when he was abandoned, weak and sick. Our medical team worked around the clock, funded by donations, to nurse him back to health. Now Max is a energetic, loving companion who brings joy to his adoptive family every day.',
                'total_cost': Decimal('320.00'),
                'days_in_care': 60
            },
            {
                'title': 'Senior Love: Bella\'s Happy Ending',
                'story_text': 'Bella, a 8-year-old dog, was surrendered when her family could no longer care for her. Many thought she was too old to find a home, but after receiving medical care and lots of love, she found a family who cherishes her golden years.',
                'total_cost': Decimal('275.00'),
                'days_in_care': 45
            },
            {
                'title': 'Feral to Family: Shadow\'s Transformation',
                'story_text': 'Shadow was a feral cat who had never known human kindness. Through patient care, medical treatment, and socialization funded by donations, Shadow learned to trust and love. He now purrs contentedly in his forever home.',
                'total_cost': Decimal('180.00'),
                'days_in_care': 150
            }
        ]
    
        stories_created = 0
        for i, story_data in enumerate(stories_data):
            if i < len(animals):
                animal = animals[i]
            
                # Random dates
                rescue_date = django_timezone.now() - timedelta(days=random.randint(30, 200))
                adoption_date = rescue_date + timedelta(days=story_data['days_in_care'])
            
                story = SuccessStory.objects.create(
                    title=story_data['title'],
                    animal=animal,
                    story_text=story_data['story_text'],
                    before_photo=animal_photos['before'][i % len(animal_photos['before'])],  # Use proper animal photos
                    after_photo=animal_photos['after'][i % len(animal_photos['after'])],    # Use proper animal photos
                    rescue_date=rescue_date,
                    adoption_date=adoption_date,
                    total_cost=story_data['total_cost'],
                    days_in_care=story_data['days_in_care'],
                    is_featured=i < 3  # First 3 are featured
                )
            
                # Link to random donations
                recent_donations = Donation.objects.order_by('-created_at')[:5]
                story.enabled_by_donations.set(random.sample(list(recent_donations), min(3, len(recent_donations))))
            
            stories_created += 1
    
        self.stdout.write(f"  ✅ Created {stories_created} success stories with proper animal photos")
        

    def update_donor_summaries(self):
        """Update donor impact summaries"""
        
        users_with_donations = User.objects.filter(donation__isnull=False).distinct()
        
        for user in users_with_donations:
            donations = user.donation_set.all()
            total_donated = sum(d.amount for d in donations)
            
            # Count animals helped through this donor's donations
            animals_helped = 0
            for donation in donations:
                for impact in donation.impacts.all():
                    animals_helped += impact.units_helped
            
            summary, created = DonorImpactSummary.objects.get_or_create(
                donor=user,
                defaults={
                    'total_donated': total_donated,
                    'animals_helped': animals_helped,
                    'donations_count': donations.count(),
                    'first_donation_date': donations.earliest('created_at').created_at,
                    'last_donation_date': donations.latest('created_at').created_at
                }
            )
            
            if not created:
                summary.total_donated = total_donated
                summary.animals_helped = animals_helped
                summary.donations_count = donations.count()
                summary.first_donation_date = donations.earliest('created_at').created_at
                summary.last_donation_date = donations.latest('created_at').created_at
            
            summary.update_donor_level()
        
        self.stdout.write(f"  ✅ Updated donor summaries for {users_with_donations.count()} users")
