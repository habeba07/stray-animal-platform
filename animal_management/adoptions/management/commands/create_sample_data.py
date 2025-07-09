# adoptions/management/commands/create_sample_data.py
# CORRECTED VERSION with proper Animal model fields

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.gis.geos import Point
from adoptions.models import AdopterProfile, AdoptionApplication, AnimalBehaviorProfile
from animals.models import Animal
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Create sample adoption data for ML training'

    def handle(self, *args, **options):
        self.stdout.write('📊 Creating sample adoption data...')
        
        # Create sample users if they don't exist
        sample_users = []
        for i in range(1, 6):
            user, created = User.objects.get_or_create(
                username=f'adopter{i}',
                defaults={
                    'email': f'adopter{i}@example.com',
                    'user_type': 'PUBLIC'
                }
            )
            if created:
                user.set_password('testpass123')
                user.save()
                self.stdout.write(f'✅ Created user: {user.username}')
            sample_users.append(user)
        
        # Create sample animals with behavior profiles (CORRECTED FIELDS)
        sample_animals = []
        animal_configs = [
            {
                'name': 'Buddy', 
                'animal_type': 'DOG',
                'breed': 'Golden Retriever Mix',
                'age_estimate': '2 years',
                'weight': 25.5,
                'color': 'Golden',
                'energy_level': 'HIGH',
                'training_level': 'BASIC',
                'good_with_children': True,
                'good_with_dogs': True,
                'special_needs': False
            },
            {
                'name': 'Whiskers', 
                'animal_type': 'CAT',
                'breed': 'Domestic Shorthair',
                'age_estimate': '3 years',
                'weight': 4.2,
                'color': 'Gray and White',
                'energy_level': 'MEDIUM',
                'training_level': 'NONE',
                'good_with_children': True,
                'good_with_cats': True,
                'special_needs': False
            },
            {
                'name': 'Max', 
                'animal_type': 'DOG',
                'breed': 'German Shepherd Mix',
                'age_estimate': '5 years',
                'weight': 30.0,
                'color': 'Black and Brown',
                'energy_level': 'LOW',
                'training_level': 'ADVANCED',
                'good_with_children': True,
                'good_with_dogs': False,
                'special_needs': True
            },
            {
                'name': 'Luna', 
                'animal_type': 'CAT',
                'breed': 'Persian Mix',
                'age_estimate': '1 year',
                'weight': 3.8,
                'color': 'White',
                'energy_level': 'HIGH',
                'training_level': 'BASIC',
                'good_with_children': False,
                'good_with_cats': False,
                'special_needs': False
            },
            {
                'name': 'Charlie', 
                'animal_type': 'DOG',
                'breed': 'Labrador Mix',
                'age_estimate': '4 years',
                'weight': 28.0,
                'color': 'Brown',
                'energy_level': 'MEDIUM',
                'training_level': 'INTERMEDIATE',
                'good_with_children': True,
                'good_with_dogs': True,
                'special_needs': False
            },
        ]
        
        for config in animal_configs:
            # Create animal with correct fields
            animal_defaults = {
                'animal_type': config['animal_type'],
                'breed': config['breed'],
                'gender': 'UNKNOWN',
                'age_estimate': config['age_estimate'],
                'weight': config['weight'],
                'color': config['color'],
                'status': 'ADOPTED',  # Mark as adopted for training data
                'geo_location': Point(-74.0060, 40.7128),  # NYC coordinates as default
                'last_location_json': {'lat': 40.7128, 'lng': -74.0060},
                'vaccinated': True,
                'neutered_spayed': True,
                'microchipped': True,
                'health_status': 'Healthy',
                'behavior_notes': f'Sample notes for {config["name"]}',
                'special_needs': 'None' if not config['special_needs'] else 'Requires special care',
                'adoption_fee': 150.00,
                'photos': []
            }
            
            animal, created = Animal.objects.get_or_create(
                name=config['name'],
                defaults=animal_defaults
            )
            
            if created:
                self.stdout.write(f'✅ Created animal: {animal.name}')
            else:
                self.stdout.write(f'ℹ️ Animal {animal.name} already exists')
                
            # Create behavior profile
            behavior_profile, profile_created = AnimalBehaviorProfile.objects.get_or_create(
                animal=animal,
                defaults={
                    'energy_level': config['energy_level'],
                    'training_level': config['training_level'],
                    'good_with_children': config['good_with_children'],
                    'good_with_dogs': config.get('good_with_dogs', False),
                    'good_with_cats': config.get('good_with_cats', False),
                    'good_with_strangers': True,
                    'special_needs': config['special_needs']
                }
            )
            
            if profile_created:
                self.stdout.write(f'✅ Created behavior profile for: {animal.name}')
            else:
                self.stdout.write(f'ℹ️ Behavior profile for {animal.name} already exists')
                
            sample_animals.append(animal)
        
        # Create adopter profiles (SAME AS BEFORE)
        adopter_configs = [
            {
                'activity_level': 'VERY_ACTIVE',
                'pet_experience': 'EXPERT',
                'housing_type': 'HOUSE',
                'has_yard': True,
                'children_in_home': 2,
                'special_needs_capable': False
            },
            {
                'activity_level': 'MODERATELY_ACTIVE',
                'pet_experience': 'INTERMEDIATE',
                'housing_type': 'APARTMENT',
                'has_yard': False,
                'children_in_home': 0,
                'special_needs_capable': True
            },
            {
                'activity_level': 'SEDENTARY',
                'pet_experience': 'BEGINNER',
                'housing_type': 'HOUSE',
                'has_yard': True,
                'children_in_home': 1,
                'special_needs_capable': False
            },
            {
                'activity_level': 'ACTIVE',
                'pet_experience': 'INTERMEDIATE',
                'housing_type': 'CONDO',
                'has_yard': False,
                'children_in_home': 0,
                'special_needs_capable': True
            },
            {
                'activity_level': 'MODERATELY_ACTIVE',
                'pet_experience': 'EXPERT',
                'housing_type': 'HOUSE',
                'has_yard': True,
                'children_in_home': 3,
                'special_needs_capable': False
            },
        ]
        
        # Create successful adoption application (FIXED: use user not adopter_profile)
        if i < len(sample_animals):
            application, created = AdoptionApplication.objects.get_or_create(
                applicant=user,  # FIXED: use 'user' instead of 'adopter_profile'
                animal=sample_animals[i],
                defaults={
                    'status': 'APPROVED',
                    'why_adopt': f'Perfect match for {sample_animals[i].name}',
                    'review_notes': 'Sample adoption for ML training'
                }
            )
                    
            if created:
                self.stdout.write(f'✅ Created adoption: {user.username} -> {sample_animals[i].name}')
            else:
                self.stdout.write(f'ℹ️ Adoption {user.username} -> {sample_animals[i].name} already exists')
                
                   
        # Count the data we created
        total_adoptions = AdoptionApplication.objects.filter(status='APPROVED').count()
        total_profiles = AdopterProfile.objects.count()
        total_animals = Animal.objects.count()
        
        self.stdout.write(
            self.style.SUCCESS(
                f'🎉 Sample data created successfully!\n'
                f'📊 Total successful adoptions: {total_adoptions}\n'
                f'👥 Total adopter profiles: {total_profiles}\n'
                f'🐕 Total animals: {total_animals}\n'
                f'💡 You can now train the ML model!'
            )
        )
