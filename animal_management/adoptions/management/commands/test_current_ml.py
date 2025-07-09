# adoptions/management/commands/test_current_ml.py
from django.core.management.base import BaseCommand
from adoptions.ml_matching import MLAdoptionMatcher
from animals.models import Animal
from adoptions.models import AdoptionApplication
import time

class Command(BaseCommand):
    help = 'Simple test of your current ML system'
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🧪 TESTING YOUR CURRENT ML SYSTEM'))
        self.stdout.write('=' * 50)
        
        # Test 1: Check if ML system loads
        self.stdout.write('\n1️⃣ Testing ML System Loading...')
        try:
            matcher = MLAdoptionMatcher()
            self.stdout.write('   ✅ ML system loaded successfully')
        except Exception as e:
            self.stdout.write(f'   ❌ Failed to load ML system: {str(e)}')
            return
        
        # Test 2: Check available models
        self.stdout.write('\n2️⃣ Checking Available Models...')
        compatibility_model = matcher.compatibility_model is not None
        likelihood_model = matcher.adoption_likelihood_model is not None
        
        self.stdout.write(f'   📊 Compatibility Model: {"✅ Available" if compatibility_model else "❌ Not trained"}')
        self.stdout.write(f'   📊 Adoption Likelihood Model: {"✅ Available" if likelihood_model else "❌ Not trained"}')
        
        # Test 3: Check data availability
        self.stdout.write('\n3️⃣ Checking Data Availability...')
        total_animals = Animal.objects.count()
        animals_with_kaggle = Animal.objects.filter(last_location_json__kaggle_data__isnull=False).count()
        successful_adoptions = AdoptionApplication.objects.filter(status='APPROVED').count()
        
        self.stdout.write(f'   📈 Total Animals: {total_animals}')
        self.stdout.write(f'   📊 Animals with Kaggle Data: {animals_with_kaggle}')
        self.stdout.write(f'   ✅ Successful Adoptions: {successful_adoptions}')
        
        # Test 4: Try a prediction
        self.stdout.write('\n4️⃣ Testing Predictions...')
        test_animal = Animal.objects.first()
        
        if test_animal:
            try:
                start_time = time.time()
                result = matcher.predict_adoption_likelihood(test_animal)
                end_time = time.time()
                
                self.stdout.write(f'   ✅ Prediction successful!')
                self.stdout.write(f'   📊 Adoption Likelihood: {result["adoption_likelihood"]:.3f}')
                self.stdout.write(f'   ⏱️ Prediction Time: {(end_time - start_time):.3f} seconds')
                
            except Exception as e:
                self.stdout.write(f'   ❌ Prediction failed: {str(e)}')
        else:
            self.stdout.write('   ⚠️ No animals available for testing')
        
        # Test 5: Overall Assessment
        self.stdout.write('\n🎯 OVERALL ASSESSMENT:')
        self.stdout.write('-' * 25)
        
        issues = []
        if not compatibility_model:
            issues.append("Compatibility model needs training")
        if not likelihood_model:
            issues.append("Adoption likelihood model needs training")
        if total_animals < 10:
            issues.append("Need more animal data")
        if animals_with_kaggle < 5:
            issues.append("Need more Kaggle dataset integration")
        if successful_adoptions < 5:
            issues.append("Need more adoption data for training")
        
        if not issues:
            self.stdout.write('🎉 Your ML system is working great!')
            self.stdout.write('✅ Ready for advanced enhancements!')
        else:
            self.stdout.write('⚠️ Found some issues to fix:')
            for issue in issues:
                self.stdout.write(f'   • {issue}')
        
        self.stdout.write('\n' + '=' * 50)
        self.stdout.write('Next step: Run this test and show me the results!')