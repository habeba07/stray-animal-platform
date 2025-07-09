# volunteers/management/commands/create_volunteer_opportunities.py

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from volunteers.models import VolunteerOpportunity

User = get_user_model()

class Command(BaseCommand):
    help = 'Create sample volunteer opportunities for testing'

    def handle(self, *args, **options):
        # Get or create a staff user to create opportunities
        staff_user, created = User.objects.get_or_create(
            username='volunteer_coordinator',
            defaults={
                'email': 'coordinator@pawrescue.com',
                'user_type': 'STAFF',
                'first_name': 'Volunteer',
                'last_name': 'Coordinator'
            }
        )
        
        # Sample opportunities data
        opportunities_data = [
            {
                'title': 'Weekend Adoption Event',
                'description': 'Help showcase adoptable animals and assist potential adopters at our monthly adoption event.',
                'category': 'ADOPTION_EVENT',
                'location': 'Central Park Pavilion',
                'start_time': timezone.now() + timedelta(days=3, hours=9),
                'end_time': timezone.now() + timedelta(days=3, hours=16),
                'skills_required': ['Animal Handling', 'Customer Service'],
                'min_volunteers': 3,
                'max_volunteers': 8,
                'requires_transportation': False,
                'minimum_experience': 'BEGINNER',
                'is_emergency': False,
            },
            {
                'title': 'Facility Deep Clean',
                'description': 'Monthly deep cleaning of animal kennels, play areas, and common spaces.',
                'category': 'MAINTENANCE',
                'location': 'Main Shelter Facility',
                'start_time': timezone.now() + timedelta(days=5, hours=8),
                'end_time': timezone.now() + timedelta(days=5, hours=12),
                'skills_required': ['Cleaning'],
                'min_volunteers': 2,
                'max_volunteers': 6,
                'requires_transportation': False,
                'minimum_experience': 'BEGINNER',
                'is_emergency': False,
            },
            {
                'title': 'Animal Photography Session',
                'description': 'Professional photo session for adoptable animals to improve their adoption profiles.',
                'category': 'OTHER',
                'location': 'Photography Studio - Downtown',
                'start_time': timezone.now() + timedelta(days=7, hours=14),
                'end_time': timezone.now() + timedelta(days=7, hours=17),
                'skills_required': ['Photography'],
                'min_volunteers': 1,
                'max_volunteers': 3,
                'requires_transportation': True,
                'minimum_experience': 'INTERMEDIATE',
                'is_emergency': False,
            },
            {
                'title': 'Community Outreach Booth',
                'description': 'Staff information booth at local farmers market to promote animal adoption and services.',  
                'category': 'FUNDRAISING',
                'location': 'Saturday Farmers Market',
                'start_time': timezone.now() + timedelta(days=2, hours=7),
                'end_time': timezone.now() + timedelta(days=2, hours=13),
                'skills_required': ['Public Speaking', 'Customer Service'],
                'min_volunteers': 2,
                'max_volunteers': 4,
                'requires_transportation': False,
                'minimum_experience': 'BEGINNER',
                'is_emergency': False,
            },
            {
                'title': 'New Volunteer Orientation',
                'description': 'Training session for new volunteers covering animal handling, safety protocols, and emergency procedures.',
                'category': 'RESCUE_TRAINING',
                'location': 'Training Room - Shelter',
                'start_time': timezone.now() + timedelta(days=10, hours=18),
                'end_time': timezone.now() + timedelta(days=10, hours=20),
                'skills_required': ['Training'],
                'min_volunteers': 8,
                'max_volunteers': 15,
                'requires_transportation': False,
                'minimum_experience': 'BEGINNER',
                'is_emergency': False,
            },
            {
                'title': 'Emergency Transport Training',
                'description': 'Specialized training for volunteers who want to assist with emergency animal transportation.',
                'category': 'EMERGENCY_RESPONSE',
                'location': 'Shelter Parking Lot',
                'start_time': timezone.now() + timedelta(days=12, hours=10),
                'end_time': timezone.now() + timedelta(days=12, hours=14),
                'skills_required': ['Transportation', 'Animal Handling'],
                'min_volunteers': 3,
                'max_volunteers': 8,
                'requires_transportation': True,
                'minimum_experience': 'INTERMEDIATE',
                'is_emergency': False,
            },
            {
                'title': 'Administrative Support',
                'description': 'Help with data entry, filing, and organizing adoption paperwork.',
                'category': 'ADMIN',
                'location': 'Shelter Office',
                'start_time': timezone.now() + timedelta(days=1, hours=13),
                'end_time': timezone.now() + timedelta(days=1, hours=17),
                'skills_required': ['Administration'],
                'min_volunteers': 1,
                'max_volunteers': 3,
                'requires_transportation': False,
                'minimum_experience': 'BEGINNER',
                'is_emergency': False,
            },
        ]
        
        # Create opportunities
        created_count = 0
        for opp_data in opportunities_data:
            opportunity, created = VolunteerOpportunity.objects.get_or_create(
                title=opp_data['title'],
                start_time=opp_data['start_time'],
                defaults={
                    **opp_data,
                    'created_by': staff_user,
                    'status': 'OPEN'
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created opportunity: {opportunity.title}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Opportunity already exists: {opportunity.title}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} volunteer opportunities!')
        )
