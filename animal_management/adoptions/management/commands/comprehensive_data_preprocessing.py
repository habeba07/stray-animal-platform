# adoptions/management/commands/comprehensive_data_preprocessing.py
from django.core.management.base import BaseCommand
from django.db import transaction
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder
from sklearn.preprocessing import PolynomialFeatures
import matplotlib.pyplot as plt
import seaborn as sns
import pickle
import os
from django.conf import settings


class Command(BaseCommand):
    help = 'Comprehensive data preprocessing: Missing Values, Outliers, Transformation, Standardization, Normalization'

    def add_arguments(self, parser):
        parser.add_argument('--missing-values', action='store_true', help='Handle missing values')
        parser.add_argument('--outliers', action='store_true', help='Handle outliers')
        parser.add_argument('--transform', action='store_true', help='Data transformation')
        parser.add_argument('--standardize', action='store_true', help='Data standardization')
        parser.add_argument('--normalize', action='store_true', help='Data normalization')
        parser.add_argument('--all', action='store_true', help='Run all preprocessing steps')
        parser.add_argument('--visualize', action='store_true', help='Create visualizations')

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🔧 COMPREHENSIVE DATA PREPROCESSING'))
        self.stdout.write('Advanced data preprocessing for ML models...')
        self.stdout.write('=' * 60)

        # Initialize preprocessing components
        self.scaler = StandardScaler()
        self.normalizer = MinMaxScaler()
        self.label_encoders = {}
        self.preprocessing_stats = {}

        if options['all']:
            self.handle_missing_values()
            self.handle_outliers()
            self.data_transformation()
            self.data_standardization()
            self.data_normalization()
            if options['visualize']:
                self.create_visualizations()
        else:
            if options['missing_values']:
                self.handle_missing_values()
            if options['outliers']:
                self.handle_outliers()
            if options['transform']:
                self.data_transformation()
            if options['standardize']:
                self.data_standardization()
            if options['normalize']:
                self.data_normalization()
            if options['visualize']:
                self.create_visualizations()

        self.save_preprocessing_models()
        self.display_preprocessing_summary()

    def handle_missing_values(self):

        self.stdout.write('\n📊 STEP 1: Handling Missing Values')
        self.stdout.write('-' * 40)

        from animals.models import Animal
        from adoptions.models import AnimalBehaviorProfile

        animals = Animal.objects.all()
        missing_stats = {
            'weight_missing': 0,
            'age_missing': 0,
            'breed_missing': 0,
            'total_animals': len(animals)
        }

        updates_made = 0

        for animal in animals:
            updated = False

            # Handle missing weight with species-specific medians
            if not animal.weight or animal.weight <= 0:
                missing_stats['weight_missing'] += 1
                if animal.animal_type == 'DOG':
                    animal.weight = self.get_breed_median_weight(animal.breed, 'DOG', 25.0)
                elif animal.animal_type == 'CAT':
                    animal.weight = 8.5  # Cat median
                else:
                    animal.weight = 15.0  # Default
                updated = True

            # Handle missing age estimates
            if not animal.age_estimate or animal.age_estimate in ['Unknown', '']:
                missing_stats['age_missing'] += 1
                animal.age_estimate = '2 years'  # Default young adult
                updated = True

            # Handle missing breed information
            if not animal.breed or animal.breed in ['Unknown', '', 'Mixed']:
                missing_stats['breed_missing'] += 1
                if animal.animal_type == 'DOG':
                    animal.breed = 'Mixed Breed Dog'
                elif animal.animal_type == 'CAT':
                    animal.breed = 'Domestic Shorthair'
                else:
                    animal.breed = 'Mixed Breed'
                updated = True

            if updated:
                animal.save()
                updates_made += 1

        # Calculate missing value percentages
        for key in ['weight_missing', 'age_missing', 'breed_missing']:
            percentage = (missing_stats[key] / missing_stats['total_animals']) * 100
            self.stdout.write(f'  {key}: {missing_stats[key]} ({percentage:.1f}%)')

        self.stdout.write(f'✅ Updated {updates_made} animals with missing values')
        self.preprocessing_stats['missing_values'] = missing_stats

    def get_breed_median_weight(self, breed, animal_type, default):

        breed_weights = {
            'DOG': {
                'Labrador Retriever Mix': 30.0,
                'Pit Bull Mix': 35.0,
                'Chihuahua Mix': 8.0,
                'German Shepherd Mix': 40.0,
                'Beagle Mix': 25.0,
                'Border Collie Mix': 32.0
            },
            'CAT': {
                'Domestic Shorthair': 8.5,
                'Domestic Medium Hair': 10.0,
                'Maine Coon Mix': 12.0,
                'Siamese Mix': 7.5
            }
        }

        return breed_weights.get(animal_type, {}).get(breed, default)

    def handle_outliers(self):
        """4.3.2 Outliers - Domain-specific outlier treatment"""
        self.stdout.write('\n📈 STEP 2: Handling Outliers')
        self.stdout.write('-' * 40)

        from animals.models import Animal

        animals = Animal.objects.all()
        outlier_stats = {
            'weight_outliers': 0,
            'fee_outliers': 0,
            'total_processed': 0
        }

        updates_made = 0

        for animal in animals:
            updated = False
            original_weight = animal.weight
            original_fee = animal.adoption_fee

            # Handle weight outliers with species-specific ranges
            if animal.weight:
                if animal.animal_type == 'DOG':
                    if animal.weight < 1.0 or animal.weight > 100.0:
                        outlier_stats['weight_outliers'] += 1
                        animal.weight = max(1.0, min(animal.weight, 100.0))
                        updated = True
                elif animal.animal_type == 'CAT':
                    if animal.weight < 2.0 or animal.weight > 25.0:
                        outlier_stats['weight_outliers'] += 1
                        animal.weight = max(2.0, min(animal.weight, 25.0))
                        updated = True

            # Handle adoption fee outliers
            if animal.adoption_fee:
                if animal.adoption_fee < 0 or animal.adoption_fee > 500:
                    outlier_stats['fee_outliers'] += 1
                    animal.adoption_fee = max(0, min(animal.adoption_fee, 500))
                    updated = True

            if updated:
                animal.save()
                updates_made += 1
                self.stdout.write(
                    f'  🔧 {animal.name}: Weight {original_weight}→{animal.weight}, Fee {original_fee}→{animal.adoption_fee}')

            outlier_stats['total_processed'] += 1

        outlier_percentage = (outlier_stats['weight_outliers'] / outlier_stats['total_processed']) * 100
        self.stdout.write(
            f'✅ Found and fixed {outlier_stats["weight_outliers"]} weight outliers ({outlier_percentage:.1f}%)')
        self.stdout.write(f'✅ Found and fixed {outlier_stats["fee_outliers"]} fee outliers')
        self.preprocessing_stats['outliers'] = outlier_stats

    def data_transformation(self):

        self.stdout.write('\n🔄 STEP 3: Data Transformation')
        self.stdout.write('-' * 40)

        from animals.models import Animal
        from adoptions.models import AnimalBehaviorProfile

        # Prepare transformation data
        transformation_stats = {
            'animals_processed': 0,
            'behavioral_profiles': 0,
            'encoded_features': 0
        }

        # Define categorical mappings
        self.categorical_mappings = {
            'energy_level': {'LOW': 0, 'MEDIUM': 1, 'HIGH': 2, 'VERY_HIGH': 3},
            'training_level': {'NONE': 0, 'BASIC': 1, 'INTERMEDIATE': 2, 'ADVANCED': 3},
            'animal_type': {'CAT': 0, 'DOG': 1, 'OTHER': 2},
            'size': {'Small': 0, 'Medium': 1, 'Large': 2, 'Extra Large': 3}
        }

        # Create feature matrix for transformation
        feature_data = []
        animals = Animal.objects.filter(
            last_location_json__kaggle_data__isnull=False
        )[:100]

        for animal in animals:
            try:
                behavior_profile = getattr(animal, 'behavior_profile', None)
                if behavior_profile:
                    kaggle_data = animal.last_location_json.get('kaggle_data', {})

                    features = {
                        'animal_id': animal.id,
                        'animal_type_encoded': self.categorical_mappings['animal_type'].get(animal.animal_type, 0),
                        'size_encoded': self.categorical_mappings['size'].get(kaggle_data.get('size', 'Medium'), 1),
                        'weight_normalized': float(animal.weight) if animal.weight else 25.0,
                        'adoption_fee_normalized': float(animal.adoption_fee) if animal.adoption_fee else 100.0,
                        'energy_level_encoded': self.categorical_mappings['energy_level'].get(
                            behavior_profile.energy_level, 1),
                        'training_level_encoded': self.categorical_mappings['training_level'].get(
                            behavior_profile.training_level, 0),
                        'good_with_children_binary': 1 if behavior_profile.good_with_children else 0,
                        'good_with_dogs_binary': 1 if behavior_profile.good_with_dogs else 0,
                        'good_with_cats_binary': 1 if behavior_profile.good_with_cats else 0,
                        'special_needs_binary': 1 if behavior_profile.special_needs else 0,
                        'vaccinated_binary': 1 if animal.vaccinated else 0
                    }

                    feature_data.append(features)
                    transformation_stats['behavioral_profiles'] += 1

                transformation_stats['animals_processed'] += 1

            except Exception as e:
                self.stdout.write(f'  ⚠️ Error processing animal {animal.id}: {str(e)}')
                continue

        # Create DataFrame for further processing
        self.feature_df = pd.DataFrame(feature_data)

        if len(self.feature_df) > 0:
            transformation_stats['encoded_features'] = len(self.feature_df.columns) - 1  # Exclude animal_id
            self.stdout.write(
                f'✅ Transformed {len(self.feature_df)} animals with {transformation_stats["encoded_features"]} features')

            # Create polynomial features for interaction terms
            numerical_features = ['weight_normalized', 'adoption_fee_normalized', 'energy_level_encoded',
                                  'training_level_encoded']
            if len(self.feature_df) > 10:  # Only if sufficient data
                poly = PolynomialFeatures(degree=2, include_bias=False, interaction_only=True)
                poly_features = poly.fit_transform(self.feature_df[numerical_features])
                self.stdout.write(f'✅ Created {poly_features.shape[1]} polynomial interaction features')
                transformation_stats['polynomial_features'] = poly_features.shape[1]

        self.preprocessing_stats['transformation'] = transformation_stats

    def data_standardization(self):

        self.stdout.write('\n📏 STEP 4: Data Standardization')
        self.stdout.write('-' * 40)

        if hasattr(self, 'feature_df') and len(self.feature_df) > 0:
            # Identify numerical features for standardization
            numerical_features = [
                'weight_normalized', 'adoption_fee_normalized',
                'energy_level_encoded', 'training_level_encoded'
            ]

            # Apply StandardScaler
            numerical_data = self.feature_df[numerical_features]

            # Calculate original statistics
            original_stats = {
                'means': numerical_data.mean().to_dict(),
                'stds': numerical_data.std().to_dict(),
                'ranges': (numerical_data.max() - numerical_data.min()).to_dict()
            }

            # Apply standardization
            standardized_data = self.scaler.fit_transform(numerical_data)
            standardized_df = pd.DataFrame(standardized_data, columns=numerical_features)

            # Calculate standardized statistics
            standardized_stats = {
                'means': standardized_df.mean().to_dict(),
                'stds': standardized_df.std().to_dict(),
                'ranges': (standardized_df.max() - standardized_df.min()).to_dict()
            }

            self.stdout.write('📊 Standardization Results:')
            for feature in numerical_features:
                orig_mean = original_stats['means'][feature]
                orig_std = original_stats['stds'][feature]
                new_mean = standardized_stats['means'][feature]
                new_std = standardized_stats['stds'][feature]

                self.stdout.write(f'  {feature}:')
                self.stdout.write(f'    Original: μ={orig_mean:.2f}, σ={orig_std:.2f}')
                self.stdout.write(f'    Standardized: μ={new_mean:.2f}, σ={new_std:.2f}')

            # Store standardized data
            self.standardized_features = standardized_df

            standardization_stats = {
                'features_standardized': len(numerical_features),
                'original_stats': original_stats,
                'standardized_stats': standardized_stats
            }

            self.stdout.write(f'✅ Standardized {len(numerical_features)} numerical features')
            self.preprocessing_stats['standardization'] = standardization_stats
        else:
            self.stdout.write('❌ No feature data available for standardization')

    def data_normalization(self):

        self.stdout.write('\n📐 STEP 5: Data Normalization')
        self.stdout.write('-' * 40)

        from animals.models import Animal

        # Normalize adoption likelihood scores from Kaggle data
        animals_with_kaggle = Animal.objects.filter(
            last_location_json__kaggle_data__isnull=False
        )

        if animals_with_kaggle.exists():
            adoption_likelihoods = []
            animal_ids = []

            for animal in animals_with_kaggle:
                kaggle_data = animal.last_location_json.get('kaggle_data', {})
                likelihood = kaggle_data.get('adoption_likelihood')

                if likelihood is not None:
                    adoption_likelihoods.append(float(likelihood))
                    animal_ids.append(animal.id)

            if adoption_likelihoods:
                # Convert to numpy array for normalization
                likelihood_array = np.array(adoption_likelihoods).reshape(-1, 1)

                # Apply Min-Max normalization
                normalized_likelihoods = self.normalizer.fit_transform(likelihood_array)

                # Calculate statistics
                original_min, original_max = min(adoption_likelihoods), max(adoption_likelihoods)
                normalized_min, normalized_max = normalized_likelihoods.min(), normalized_likelihoods.max()

                self.stdout.write('📊 Normalization Results:')
                self.stdout.write(f'  Original range: [{original_min:.3f}, {original_max:.3f}]')
                self.stdout.write(f'  Normalized range: [{normalized_min:.3f}, {normalized_max:.3f}]')

                # Update normalized values in database
                updates_made = 0
                for i, animal_id in enumerate(animal_ids):
                    try:
                        animal = Animal.objects.get(id=animal_id)
                        kaggle_data = animal.last_location_json.get('kaggle_data', {})
                        kaggle_data['adoption_likelihood_normalized'] = float(normalized_likelihoods[i][0])
                        animal.last_location_json['kaggle_data'] = kaggle_data
                        animal.save()
                        updates_made += 1
                    except Exception as e:
                        continue

                normalization_stats = {
                    'features_normalized': 1,
                    'records_updated': updates_made,
                    'original_range': [original_min, original_max],
                    'normalized_range': [normalized_min, normalized_max]
                }

                self.stdout.write(f'✅ Normalized adoption likelihood for {updates_made} animals')
                self.preprocessing_stats['normalization'] = normalization_stats
            else:
                self.stdout.write('❌ No adoption likelihood data found for normalization')
        else:
            self.stdout.write('❌ No animals with Kaggle data found for normalization')

    def create_visualizations(self):
        """Create visualizations for preprocessing results"""
        self.stdout.write('\n📊 Creating Preprocessing Visualizations...')

        if hasattr(self, 'feature_df') and len(self.feature_df) > 0:
            # Create visualizations directory
            viz_dir = os.path.join(settings.BASE_DIR, 'preprocessing_visualizations')
            os.makedirs(viz_dir, exist_ok=True)

            # 1. Weight distribution by animal type
            plt.figure(figsize=(12, 6))
            plt.subplot(1, 2, 1)

            from animals.models import Animal
            dogs = Animal.objects.filter(animal_type='DOG', weight__isnull=False)
            cats = Animal.objects.filter(animal_type='CAT', weight__isnull=False)

            dog_weights = [float(d.weight) for d in dogs if d.weight]
            cat_weights = [float(c.weight) for c in cats if c.weight]

            if dog_weights:
                plt.hist(dog_weights, bins=20, alpha=0.7, label='Dogs', color='blue')
            if cat_weights:
                plt.hist(cat_weights, bins=15, alpha=0.7, label='Cats', color='orange')

            plt.title('Weight Distribution by Animal Type')
            plt.xlabel('Weight (lbs)')
            plt.ylabel('Frequency')
            plt.legend()

            # 2. Missing values summary
            plt.subplot(1, 2, 2)
            if 'missing_values' in self.preprocessing_stats:
                missing_stats = self.preprocessing_stats['missing_values']
                categories = ['Weight', 'Age', 'Breed']
                percentages = [
                    (missing_stats['weight_missing'] / missing_stats['total_animals']) * 100,
                    (missing_stats['age_missing'] / missing_stats['total_animals']) * 100,
                    (missing_stats['breed_missing'] / missing_stats['total_animals']) * 100
                ]

                plt.bar(categories, percentages, color=['red', 'yellow', 'green'])
                plt.title('Missing Values by Category')
                plt.ylabel('Percentage Missing (%)')
                plt.xticks(rotation=45)

            plt.tight_layout()
            viz_path = os.path.join(viz_dir, 'preprocessing_analysis.png')
            plt.savefig(viz_path, dpi=300, bbox_inches='tight')
            plt.close()

            self.stdout.write(f'✅ Visualizations saved to {viz_path}')

    def save_preprocessing_models(self):
        """Save preprocessing models for future use"""
        self.stdout.write('\n💾 Saving Preprocessing Models...')

        model_dir = os.path.join(settings.BASE_DIR, 'ml_models')
        os.makedirs(model_dir, exist_ok=True)

        preprocessing_models = {
            'scaler': self.scaler,
            'normalizer': self.normalizer,
            'categorical_mappings': getattr(self, 'categorical_mappings', {}),
            'preprocessing_stats': self.preprocessing_stats,
            'version': '1.0_comprehensive'
        }

        model_file = os.path.join(model_dir, 'preprocessing_models.pkl')
        with open(model_file, 'wb') as f:
            pickle.dump(preprocessing_models, f)

        self.stdout.write(f'✅ Preprocessing models saved to {model_file}')

    def display_preprocessing_summary(self):
        """Display comprehensive preprocessing summary"""
        self.stdout.write('\n' + '=' * 60)
        self.stdout.write(self.style.SUCCESS('📋 PREPROCESSING SUMMARY'))
        self.stdout.write('=' * 60)

        for step, stats in self.preprocessing_stats.items():
            self.stdout.write(f'\n🔧 {step.upper().replace("_", " ")}:')

            if step == 'missing_values':
                total = stats['total_animals']
                self.stdout.write(f'  Total animals processed: {total}')
                self.stdout.write(
                    f'  Weight missing: {stats["weight_missing"]} ({(stats["weight_missing"] / total) * 100:.1f}%)')
                self.stdout.write(
                    f'  Age missing: {stats["age_missing"]} ({(stats["age_missing"] / total) * 100:.1f}%)')
                self.stdout.write(
                    f'  Breed missing: {stats["breed_missing"]} ({(stats["breed_missing"] / total) * 100:.1f}%)')

            elif step == 'outliers':
                self.stdout.write(f'  Weight outliers fixed: {stats["weight_outliers"]}')
                self.stdout.write(f'  Fee outliers fixed: {stats["fee_outliers"]}')
                self.stdout.write(f'  Total processed: {stats["total_processed"]}')

            elif step == 'transformation':
                self.stdout.write(f'  Animals processed: {stats["animals_processed"]}')
                self.stdout.write(f'  Behavioral profiles: {stats["behavioral_profiles"]}')
                self.stdout.write(f'  Encoded features: {stats["encoded_features"]}')

            elif step == 'standardization':
                self.stdout.write(f'  Features standardized: {stats["features_standardized"]}')

            elif step == 'normalization':
                self.stdout.write(f'  Features normalized: {stats["features_normalized"]}')
                self.stdout.write(f'  Records updated: {stats["records_updated"]}')

        self.stdout.write('\n✅ All preprocessing steps completed successfully!')
        self.stdout.write('🚀 Your data is now ready for advanced ML model training!')