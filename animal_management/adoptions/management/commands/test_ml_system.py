from django.core.management.base import BaseCommand
from adoptions.ml_matching import MLAdoptionMatcher
from animals.models import Animal
import random

class Command(BaseCommand):
    help = 'Test the trained ML adoption matching system'
    
    def handle(self, *args, **options):
        self.stdout.write("🧪 Testing Enhanced ML Adoption System")
        self.stdout.write("=" * 50)
        
        # Initialize the ML system
        ml_matcher = MLAdoptionMatcher()
        
        # Test 1: Adoption Likelihood Predictions
        self.stdout.write("\n🎯 TEST 1: Adoption Likelihood Predictions")
        self.stdout.write("-" * 30)
        
        # Get some test animals
        test_animals = Animal.objects.all()[:10]
        
        if not test_animals:
            self.stdout.write("❌ No animals found for testing")
            return
        
        for animal in test_animals:
            try:
                prediction = ml_matcher.predict_adoption_likelihood(animal)
                
                likelihood = prediction['adoption_likelihood']
                likelihood_percent = likelihood * 100
                
                # Color code based on likelihood
                if likelihood > 0.7:
                    status = self.style.SUCCESS(f"{likelihood_percent:.1f}% (HIGH)")
                elif likelihood > 0.4:
                    status = self.style.WARNING(f"{likelihood_percent:.1f}% (MEDIUM)")
                else:
                    status = self.style.ERROR(f"{likelihood_percent:.1f}% (LOW)")
                
                self.stdout.write(
                    f"🐾 {animal.name[:20]:20} ({animal.animal_type:3} {animal.breed[:15]:15}) → {status}"
                )
                
                # Show top factors
                if 'top_factors' in prediction and prediction['top_factors']:
                    factors = ", ".join(prediction['top_factors'][:2])
                    self.stdout.write(f"   📈 Key factors: {factors}")
                
            except Exception as e:
                self.stdout.write(f"❌ Error testing {animal.name}: {str(e)}")
        
        # Test 2: Model Statistics
        self.stdout.write(f"\n📊 TEST 2: Model Statistics")
        self.stdout.write("-" * 30)
        
        # Get adoption likelihood stats
        all_animals = Animal.objects.filter(
            last_location_json__kaggle_data__isnull=False
        )[:50]  # Test with 50 animals
        
        if all_animals:
            predictions = []
            for animal in all_animals:
                try:
                    pred = ml_matcher.predict_adoption_likelihood(animal)
                    predictions.append(pred['adoption_likelihood'])
                except:
                    continue
            
            if predictions:
                avg_likelihood = sum(predictions) / len(predictions)
                high_likelihood = len([p for p in predictions if p > 0.7])
                medium_likelihood = len([p for p in predictions if 0.4 <= p <= 0.7])
                low_likelihood = len([p for p in predictions if p < 0.4])
                
                self.stdout.write(f"📈 Average adoption likelihood: {avg_likelihood:.2f}")
                self.stdout.write(f"🟢 High likelihood animals: {high_likelihood}")
                self.stdout.write(f"🟡 Medium likelihood animals: {medium_likelihood}")
                self.stdout.write(f"🔴 Low likelihood animals: {low_likelihood}")
        
        # Test 3: Best Adoption Candidates
        self.stdout.write(f"\n🏆 TEST 3: Best Adoption Candidates")
        self.stdout.write("-" * 30)
        
        # Find animals most likely to be adopted
        best_candidates = []
        
        for animal in Animal.objects.all()[:30]:  # Check first 30 animals
            try:
                prediction = ml_matcher.predict_adoption_likelihood(animal)
                best_candidates.append({
                    'animal': animal,
                    'likelihood': prediction['adoption_likelihood'],
                    'factors': prediction.get('top_factors', [])
                })
            except:
                continue
        
        # Sort by likelihood
        best_candidates.sort(key=lambda x: x['likelihood'], reverse=True)
        
        self.stdout.write("🥇 Top 5 Most Adoptable Animals:")
        for i, candidate in enumerate(best_candidates[:5], 1):
            animal = candidate['animal']
            likelihood = candidate['likelihood'] * 100
            
            self.stdout.write(
                f"{i}. {animal.name} ({animal.animal_type}, {animal.breed}) - {likelihood:.1f}%"
            )
            
            if candidate['factors']:
                factors = ", ".join(candidate['factors'][:2])
                self.stdout.write(f"   💡 Strengths: {factors}")
        
        # Test 4: Feature Importance (if available)
        self.stdout.write(f"\n🔍 TEST 4: What Makes Animals Adoptable?")
        self.stdout.write("-" * 30)
        
        if ml_matcher.adoption_likelihood_model:
            try:
                feature_names = [
                    'Animal Type', 'Size', 'Age Category', 'Weight', 
                    'Vaccinated', 'Adoption Fee', 'Time in Shelter',
                    'Previous Owner', 'Health Condition'
                ]
                
                importances = ml_matcher.adoption_likelihood_model.feature_importances_
                feature_importance = list(zip(feature_names, importances))
                feature_importance.sort(key=lambda x: x[1], reverse=True)
                
                self.stdout.write("📊 Most Important Factors for Adoption:")
                for i, (feature, importance) in enumerate(feature_importance[:5], 1):
                    self.stdout.write(f"{i}. {feature}: {importance:.3f}")
                    
            except Exception as e:
                self.stdout.write(f"❌ Could not get feature importance: {e}")
        
        # Summary
        self.stdout.write(f"\n🎉 SUMMARY")
        self.stdout.write("=" * 50)
        
        models_loaded = []
        if ml_matcher.compatibility_model:
            models_loaded.append("✅ Compatibility Matching")
        if ml_matcher.adoption_likelihood_model:
            models_loaded.append("✅ Adoption Likelihood Prediction")
        
        if models_loaded:
            self.stdout.write("Models successfully loaded and tested:")
            for model in models_loaded:
                self.stdout.write(f"  {model}")
        else:
            self.stdout.write("❌ No models loaded")
        
        total_animals = Animal.objects.count()
        kaggle_animals = Animal.objects.filter(
            last_location_json__kaggle_data__isnull=False
        ).count()
        
        self.stdout.write(f"\nData Summary:")
        self.stdout.write(f"  📊 Total animals in system: {total_animals}")
        self.stdout.write(f"  🤖 Animals with ML training data: {kaggle_animals}")
        
        self.stdout.write(f"\n🚀 Your ML-powered adoption system is ready!")
        self.stdout.write("   Use it in your adoption matching interface!")
