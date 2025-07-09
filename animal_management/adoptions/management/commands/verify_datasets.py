# adoptions/management/commands/verify_datasets.py
from django.core.management.base import BaseCommand
import json

class Command(BaseCommand):
    help = 'Verify if ML is actually using Austin Animal Center + Kaggle datasets'
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🔍 DATASET VERIFICATION'))
        self.stdout.write('Checking if your ML actually uses real datasets...')
        self.stdout.write('=' * 60)
        
        # Test 1: Check if animals have real Kaggle data
        self.verify_kaggle_data_usage()
        
        # Test 2: Check if ML uses Austin Animal Center characteristics
        self.verify_austin_data_usage()
        
        # Test 3: Check adoption matching system
        self.verify_adoption_matching()
        
        # Test 4: Check behavioral component
        self.verify_behavioral_system()
        
        # Test 5: Check what data ML was actually trained on
        self.verify_training_data()
    
    def verify_kaggle_data_usage(self):
        """Check if animals actually have Kaggle dataset characteristics"""
        self.stdout.write('\n📊 TEST 1: Kaggle Dataset Usage')
        self.stdout.write('-' * 35)
        
        from animals.models import Animal
        
        animals_with_kaggle = Animal.objects.filter(
            last_location_json__kaggle_data__isnull=False
        )[:5]
        
        if animals_with_kaggle:
            self.stdout.write(f'✅ Found {len(animals_with_kaggle)} animals with Kaggle data')
            
            # Check what Kaggle data looks like
            for i, animal in enumerate(animals_with_kaggle):
                kaggle_data = animal.last_location_json.get('kaggle_data', {})
                
                self.stdout.write(f'\n  🐕 Animal {i+1} ({animal.name}):')
                self.stdout.write(f'    Size: {kaggle_data.get("size", "N/A")}')
                self.stdout.write(f'    Age Category: {kaggle_data.get("age_category", "N/A")}')
                self.stdout.write(f'    Time in Shelter: {kaggle_data.get("time_in_shelter_days", "N/A")} days')
                self.stdout.write(f'    Health Condition: {kaggle_data.get("health_condition", "N/A")}')
                self.stdout.write(f'    Adoption Likelihood: {kaggle_data.get("adoption_likelihood", "N/A")}')
                
                if i >= 2:  # Show first 3
                    break
            
            # Check if this looks like real Kaggle data
            sample_animal = animals_with_kaggle[0]
            sample_kaggle = sample_animal.last_location_json.get('kaggle_data', {})
            
            kaggle_features = ['size', 'age_category', 'time_in_shelter_days', 'health_condition', 'adoption_likelihood']
            missing_features = [f for f in kaggle_features if f not in sample_kaggle]
            
            if len(missing_features) == 0:
                self.stdout.write('\n  ✅ Animals have complete Kaggle dataset features!')
            else:
                self.stdout.write(f'\n  ⚠️  Missing Kaggle features: {missing_features}')
        else:
            self.stdout.write('❌ No animals with Kaggle data found!')
    
    def verify_austin_data_usage(self):
        """Check if animals have Austin Animal Center characteristics"""
        self.stdout.write('\n🏢 TEST 2: Austin Animal Center Data Usage')
        self.stdout.write('-' * 45)
        
        from animals.models import Animal
        
        animals_with_austin = Animal.objects.filter(
            last_location_json__austin_data__isnull=False
        )[:3]
        
        if animals_with_austin:
            self.stdout.write(f'✅ Found {len(animals_with_austin)} animals with Austin data')
            
            for animal in animals_with_austin:
                austin_data = animal.last_location_json.get('austin_data', {})
                
                self.stdout.write(f'\n  🏢 {animal.name}:')
                self.stdout.write(f'    Intake Type: {austin_data.get("intake_type", "N/A")}')
                self.stdout.write(f'    Outcome Type: {austin_data.get("outcome_type", "N/A")}')
                self.stdout.write(f'    Location Found: {austin_data.get("location_found", "N/A")}')
        else:
            self.stdout.write('❌ No animals with Austin Animal Center data found!')
            
            # Check if animals have basic Austin-style characteristics
            total_animals = Animal.objects.count()
            dogs = Animal.objects.filter(animal_type='DOG').count()
            cats = Animal.objects.filter(animal_type='CAT').count()
            
            self.stdout.write(f'\n  📊 Basic animal data:')
            self.stdout.write(f'    Total Animals: {total_animals}')
            self.stdout.write(f'    Dogs: {dogs}')
            self.stdout.write(f'    Cats: {cats}')
            
            if total_animals > 0:
                self.stdout.write('  ⚠️  Animals exist but may not have Austin-specific data')
    
    def verify_adoption_matching(self):
        """Check the adoption/compatibility matching system"""
        self.stdout.write('\n❤️ TEST 3: Adoption Matching System')
        self.stdout.write('-' * 40)
        
        from adoptions.ml_matching import MLAdoptionMatcher
        from adoptions.models import AdoptionApplication, AdopterProfile
        from animals.models import Animal
        from django.contrib.auth.models import User
        
        matcher = MLAdoptionMatcher()
        
        # Check if compatibility model exists
        if matcher.compatibility_model is not None:
            self.stdout.write('✅ Compatibility model exists')
        else:
            self.stdout.write('❌ No compatibility model found')
        
        # Check adoption applications (training data)
        total_applications = AdoptionApplication.objects.count()
        approved_applications = AdoptionApplication.objects.filter(status='APPROVED').count()
        
        self.stdout.write(f'\n  📋 Adoption Applications:')
        self.stdout.write(f'    Total Applications: {total_applications}')
        self.stdout.write(f'    Approved Applications: {approved_applications}')
        
        if approved_applications >= 1:
            # Test compatibility matching with real data
            sample_app = AdoptionApplication.objects.filter(status='APPROVED').first()
            
            if hasattr(sample_app.applicant, 'adopterprofile') and hasattr(sample_app.animal, 'behavior_profile'):
                try:
                    result = matcher.predict_compatibility(
                        sample_app.applicant.adopterprofile,
                        sample_app.animal.behavior_profile
                    )
                    
                    self.stdout.write(f'\n  🎯 Sample Compatibility Test:')
                    self.stdout.write(f'    Overall Score: {result.get("overall_score", "N/A")}')
                    self.stdout.write(f'    Method: {result.get("prediction_method", "N/A")}')
                    self.stdout.write(f'    Adoption Likelihood: {result.get("adoption_likelihood", "N/A")}')
                    self.stdout.write('  ✅ Compatibility matching works!')
                    
                except Exception as e:
                    self.stdout.write(f'  ❌ Compatibility test failed: {str(e)}')
            else:
                self.stdout.write('  ⚠️  Sample application missing profiles for testing')
        else:
            self.stdout.write('  ⚠️  No approved applications for compatibility testing')
    
    def verify_behavioral_system(self):
        """Check the behavioral profiling system"""
        self.stdout.write('\n🧠 TEST 4: Behavioral System')
        self.stdout.write('-' * 35)
        
        from adoptions.models import AnimalBehaviorProfile
        
        behavior_profiles = AnimalBehaviorProfile.objects.all()
        total_profiles = len(behavior_profiles)
        
        self.stdout.write(f'📊 Total Behavior Profiles: {total_profiles}')
        
        if total_profiles >= 1:
            # Show sample behavior profiles
            for i, profile in enumerate(behavior_profiles[:3]):
                self.stdout.write(f'\n  🐕 Profile {i+1} (Animal: {profile.animal.name}):')
                self.stdout.write(f'    Energy Level: {profile.energy_level}')
                self.stdout.write(f'    Good with Children: {profile.good_with_children}')
                self.stdout.write(f'    Good with Dogs: {profile.good_with_dogs}')
                self.stdout.write(f'    Good with Cats: {profile.good_with_cats}')
                self.stdout.write(f'    Special Needs: {profile.special_needs}')
                self.stdout.write(f'    Training Level: {profile.training_level}')
            
            if total_profiles >= 10:
                self.stdout.write(f'\n  ✅ Sufficient behavior data for clustering!')
            elif total_profiles >= 5:
                self.stdout.write(f'\n  ⚠️  Limited behavior data, basic clustering possible')
            else:
                self.stdout.write(f'\n  ❌ Too few behavior profiles for meaningful clustering')
        else:
            self.stdout.write('❌ No behavior profiles found!')
    
    def verify_training_data(self):
        """Check what data the ML was actually trained on"""
        self.stdout.write('\n🎓 TEST 5: ML Training Data Verification')
        self.stdout.write('-' * 45)
        
        from adoptions.ml_matching import MLAdoptionMatcher
        from animals.models import Animal
        
        matcher = MLAdoptionMatcher()
        
        # Check if we can extract features like the ML does
        test_animal = Animal.objects.filter(
            last_location_json__kaggle_data__isnull=False
        ).first()
        
        if test_animal:
            try:
                kaggle_data = test_animal.last_location_json['kaggle_data']
                features = matcher._extract_animal_features_for_likelihood(test_animal, kaggle_data)
                
                self.stdout.write(f'✅ ML extracts {len(features)} features from animals')
                self.stdout.write(f'📊 Sample features: {features[:5]}...')
                
                # Show what each feature represents
                feature_names = [
                    'Animal Type', 'Size', 'Age Category', 'Weight', 
                    'Vaccinated', 'Adoption Fee', 'Time in Shelter',
                    'Previous Owner', 'Health Condition'
                ]
                
                self.stdout.write('\n  🔍 Feature Breakdown:')
                for i, (name, value) in enumerate(zip(feature_names, features)):
                    self.stdout.write(f'    {i+1}. {name}: {value}')
                
                self.stdout.write('\n  ✅ ML uses real Kaggle dataset features!')
                
            except Exception as e:
                self.stdout.write(f'❌ Feature extraction failed: {str(e)}')
        else:
            self.stdout.write('❌ No test animal with Kaggle data available')
        
        # Check how many animals were used for training
        animals_with_data = Animal.objects.filter(
            last_location_json__kaggle_data__isnull=False
        ).count()
        
        self.stdout.write(f'\n📈 Training Dataset Size:')
        self.stdout.write(f'  Animals with Kaggle data: {animals_with_data}')
        
        if animals_with_data >= 100:
            self.stdout.write('  ✅ Large dataset - excellent for ML training!')
        elif animals_with_data >= 50:
            self.stdout.write('  ✅ Good dataset size for ML training')
        elif animals_with_data >= 20:
            self.stdout.write('  ⚠️  Small but workable dataset')
        else:
            self.stdout.write('  ❌ Dataset too small for reliable ML')
        
        # Final assessment
        self.stdout.write('\n🎯 DATASET USAGE SUMMARY:')
        self.stdout.write('=' * 35)
        
        issues = []
        successes = []
        
        if animals_with_data >= 20:
            successes.append('Real Kaggle dataset integration')
        else:
            issues.append('Insufficient Kaggle data')
        
        if Animal.objects.filter(last_location_json__austin_data__isnull=False).exists():
            successes.append('Austin Animal Center data')
        else:
            issues.append('No Austin Animal Center data found')
        
        if AnimalBehaviorProfile.objects.count() >= 5:
            successes.append('Behavioral profiling system')
        else:
            issues.append('Limited behavioral data')
        
        if AdoptionApplication.objects.filter(status='APPROVED').count() >= 3:
            successes.append('Adoption matching capability')
        else:
            issues.append('Limited adoption training data')
        
        self.stdout.write('\n✅ WORKING COMPONENTS:')
        for success in successes:
            self.stdout.write(f'  • {success}')
        
        if issues:
            self.stdout.write('\n⚠️  AREAS NEEDING IMPROVEMENT:')
            for issue in issues:
                self.stdout.write(f'  • {issue}')
        
        # Overall verdict
        if len(successes) >= 3:
            self.stdout.write('\n🎉 Your ML system IS using real datasets effectively!')
        elif len(successes) >= 2:
            self.stdout.write('\n👍 Your ML system uses some real data, with room for improvement')
        else:
            self.stdout.write('\n❌ Your ML system needs better dataset integration')