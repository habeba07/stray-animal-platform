# adoptions/management/commands/generate_histograms.py - FIXED VERSION
from django.core.management.base import BaseCommand
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from animals.models import Animal
from adoptions.models import AnimalBehaviorProfile, AdoptionApplication
import json
import os
from django.conf import settings

class Command(BaseCommand):
    help = 'Generate histograms for FYP report using real database data'
    
    def add_arguments(self, parser):
        parser.add_argument('--output-dir', type=str, default='histograms', 
                          help='Directory to save histogram images')
        parser.add_argument('--show-plots', action='store_true', 
                          help='Display plots instead of saving them')
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('📊 GENERATING HISTOGRAMS FOR FYP REPORT'))
        self.stdout.write('=' * 60)

        
        # Create output directory
        self.output_dir = options['output_dir']
        self.show_plots = options['show_plots']
        
        if not self.show_plots:
            os.makedirs(self.output_dir, exist_ok=True)
            self.stdout.write(f'📁 Saving histograms to: {self.output_dir}/')
        
        # Set matplotlib style
        plt.style.use('default')
        plt.rcParams['figure.figsize'] = (12, 8)
        plt.rcParams['font.size'] = 11
        
        # Generate all histograms
        self.generate_species_distribution()
        self.generate_weight_distribution()
        self.generate_missing_values_analysis()
        self.generate_adoption_fee_distribution()
        self.generate_kaggle_data_analysis()
        self.generate_length_of_stay_distribution()
        
        self.stdout.write('\n✅ All histograms generated successfully!')
        if not self.show_plots:
            self.stdout.write(f'📁 Check the {self.output_dir}/ directory for image files')
    
    def save_or_show(self, filename):
        """Save plot to file or display it"""
        if self.show_plots:
            plt.show()
        else:
            filepath = os.path.join(self.output_dir, filename)
            plt.savefig(filepath, dpi=300, bbox_inches='tight')
            self.stdout.write(f'  💾 Saved: {filename}')
        plt.close()
    
    def generate_species_distribution(self):
        """Generate species distribution histogram"""
        self.stdout.write('\n📊 Generating Species Distribution...')
        
        # Query database for species data
        animals = Animal.objects.all()
        species_counts = {}
        
        for animal in animals:
            species = animal.animal_type if animal.animal_type else 'Unknown'
            species_counts[species] = species_counts.get(species, 0) + 1
        
        if not species_counts:
            self.stdout.write('  ⚠️  No animal data found!')
            return
        
        # Create histogram
        species = list(species_counts.keys())
        counts = list(species_counts.values())
        total = sum(counts)
        percentages = [(count/total)*100 for count in counts]
        
        plt.figure(figsize=(10, 6))
        colors = ['blue', 'orange', 'green', 'red'][:len(species)]
        bars = plt.bar(species, percentages, color=colors, alpha=0.7, edgecolor='black')
        
        plt.title('Species Distribution in Stray Animal Management Platform', 
                 fontsize=14, fontweight='bold')
        plt.xlabel('Animal Species')
        plt.ylabel('Percentage (%)')
        
        # Add percentage labels on bars
        for bar, pct in zip(bars, percentages):
            plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5, 
                     f'{pct:.1f}%', ha='center', fontweight='bold')
        
        plt.grid(axis='y', alpha=0.3)
        plt.tight_layout()
        
        self.save_or_show('species_distribution.png')
    
    def generate_weight_distribution(self):
        """Generate weight distribution by species"""
        self.stdout.write('\n📊 Generating Weight Distribution...')
        
        # Query animals with weight data
        animals = Animal.objects.filter(weight__isnull=False)
        
        dog_weights = []
        cat_weights = []
        
        for animal in animals:
            if animal.weight:
                if animal.animal_type == 'DOG':
                    dog_weights.append(float(animal.weight))
                elif animal.animal_type == 'CAT':
                    cat_weights.append(float(animal.weight))
        
        if not dog_weights and not cat_weights:
            self.stdout.write('  ⚠️  No weight data found!')
            return
        
        # Create combined histogram
        plt.figure(figsize=(14, 8))
        
        if dog_weights and cat_weights:
            plt.subplot(2, 2, 1)
            plt.hist(dog_weights, bins=20, color='blue', alpha=0.6, edgecolor='navy')
            plt.title(f'Dog Weight Distribution (n={len(dog_weights)})')
            plt.xlabel('Weight (lbs)')
            plt.ylabel('Frequency')
            plt.grid(axis='y', alpha=0.3)
            
            plt.subplot(2, 2, 2)
            plt.hist(cat_weights, bins=20, color='orange', alpha=0.6, edgecolor='red')
            plt.title(f'Cat Weight Distribution (n={len(cat_weights)})')
            plt.xlabel('Weight (lbs)')
            plt.ylabel('Frequency')
            plt.grid(axis='y', alpha=0.3)
            
            plt.subplot(2, 2, (3, 4))
            plt.hist(dog_weights, bins=20, alpha=0.6, label=f'Dogs (n={len(dog_weights)})', 
                    color='blue', edgecolor='navy')
            plt.hist(cat_weights, bins=20, alpha=0.6, label=f'Cats (n={len(cat_weights)})', 
                    color='orange', edgecolor='red')
            plt.title('Combined Weight Distribution by Species')
            plt.xlabel('Weight (lbs)')
            plt.ylabel('Frequency')
            plt.legend()
            plt.grid(axis='y', alpha=0.3)
        else:
            # Single species data
            weights = dog_weights if dog_weights else cat_weights
            species_name = 'Dogs' if dog_weights else 'Cats'
            color = 'blue' if dog_weights else 'orange'
            
            plt.hist(weights, bins=20, color=color, alpha=0.6, edgecolor='black')
            plt.title(f'{species_name} Weight Distribution (n={len(weights)})')
            plt.xlabel('Weight (lbs)')
            plt.ylabel('Frequency')
            plt.grid(axis='y', alpha=0.3)
        
        plt.tight_layout()
        self.save_or_show('weight_distribution.png')
    
    def generate_missing_values_analysis(self):
        """Generate missing values analysis"""
        self.stdout.write('\n📊 Generating Missing Values Analysis...')
        
        # Analyze missing values
        total_animals = Animal.objects.count()
        
        missing_data = {
            'Weight': Animal.objects.filter(weight__isnull=True).count(),
            'Age': Animal.objects.filter(age_estimate__isnull=True).count(),
            'Breed': Animal.objects.filter(breed__isnull=True).count(),
            'Color': Animal.objects.filter(color__isnull=True).count(),
            'Vaccination': Animal.objects.filter(vaccinated__isnull=True).count()
        }
        
        # Calculate percentages
        categories = list(missing_data.keys())
        missing_counts = list(missing_data.values())
        missing_percentages = [(count/total_animals)*100 for count in missing_counts]
        
        # Color coding based on severity
        colors = ['red' if x > 20 else 'orange' if x > 10 else 'yellow' if x > 5 else 'green' 
                 for x in missing_percentages]
        
        plt.figure(figsize=(12, 7))
        bars = plt.bar(categories, missing_percentages, color=colors, alpha=0.8, edgecolor='black')
        
        plt.title('Missing Value Distribution Across Dataset Variables', 
                 fontsize=14, fontweight='bold')
        plt.xlabel('Variable Category')
        plt.ylabel('Missing Value Percentage (%)')
        
        # Add percentage labels and count
        for bar, pct, count in zip(bars, missing_percentages, missing_counts):
            plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5, 
                     f'{pct:.1f}%\n({count})', ha='center', fontweight='bold')
        
        # Add threshold lines
        plt.axhline(y=20, color='red', linestyle='--', alpha=0.7, label='20% Threshold')
        plt.axhline(y=10, color='orange', linestyle='--', alpha=0.7, label='10% Threshold')
        plt.axhline(y=5, color='yellow', linestyle='--', alpha=0.7, label='5% Threshold')
        
        plt.legend()
        plt.grid(axis='y', alpha=0.3)
        plt.tight_layout()
        
        self.save_or_show('missing_values_analysis.png')
    
    def generate_adoption_fee_distribution(self):
        """Generate adoption fee distribution"""
        self.stdout.write('\n📊 Generating Adoption Fee Distribution...')
        
        # Query animals with adoption fee data
        animals = Animal.objects.filter(adoption_fee__isnull=False)
        fees = [float(animal.adoption_fee) for animal in animals if animal.adoption_fee]
        
        if not fees:
            self.stdout.write('  ⚠️  No adoption fee data found!')
            return
        
        # Create histogram
        plt.figure(figsize=(12, 7))
        plt.hist(fees, bins=30, color='gold', alpha=0.7, edgecolor='orange')
        
        plt.title('Adoption Fee Distribution - Platform Database', 
                 fontsize=14, fontweight='bold')
        plt.xlabel('Adoption Fee ($)')
        plt.ylabel('Frequency')
        
        # Add statistics
        mean_fee = np.mean(fees)
        median_fee = np.median(fees)
        plt.axvline(mean_fee, color='red', linestyle='--', linewidth=2, 
                   label=f'Mean: ${mean_fee:.2f}')
        plt.axvline(median_fee, color='blue', linestyle='--', linewidth=2, 
                   label=f'Median: ${median_fee:.2f}')
        
        plt.legend()
        plt.grid(axis='y', alpha=0.3)
        plt.tight_layout()
        
        self.save_or_show('adoption_fee_distribution.png')
    
    def generate_kaggle_data_analysis(self):
        """Generate Kaggle dataset analysis if available"""
        self.stdout.write('\n📊 Generating Kaggle Data Analysis...')
        
        # Query animals with Kaggle data
        animals_with_kaggle = Animal.objects.filter(
            last_location_json__kaggle_data__isnull=False
        )
        
        if not animals_with_kaggle.exists():
            self.stdout.write('  ⚠️  No Kaggle data found!')
            return
        
        # Adoption likelihood distribution
        likelihood_scores = []
        size_counts = {}
        health_counts = {}
        
        for animal in animals_with_kaggle:
            kaggle_data = animal.last_location_json.get('kaggle_data', {})
            
            # Collect adoption likelihood
            likelihood = kaggle_data.get('adoption_likelihood')
            if likelihood is not None:
                try:
                    likelihood_scores.append(float(likelihood))
                except (ValueError, TypeError):
                    pass
            
            # Collect size data
            size = kaggle_data.get('size', 'Unknown')
            size_counts[size] = size_counts.get(size, 0) + 1
            
            # Collect health data
            health = kaggle_data.get('health_condition', 'Unknown')
            health_counts[health] = health_counts.get(health, 0) + 1
        
        # Create subplots for Kaggle analysis
        plt.figure(figsize=(15, 10))
        
        # Adoption likelihood histogram
        if likelihood_scores:
            plt.subplot(2, 2, 1)
            plt.hist(likelihood_scores, bins=20, color='purple', alpha=0.7, edgecolor='indigo')
            plt.title('Adoption Likelihood Distribution')
            plt.xlabel('Likelihood Score (0-1)')
            plt.ylabel('Frequency')
            
            mean_score = np.mean(likelihood_scores)
            plt.axvline(mean_score, color='red', linestyle='--', 
                       label=f'Mean: {mean_score:.3f}')
            plt.legend()
        
        # Size distribution
        if size_counts:
            plt.subplot(2, 2, 2)
            sizes = list(size_counts.keys())
            counts = list(size_counts.values())
            total = sum(counts)
            percentages = [(count/total)*100 for count in counts]
            
            colors = ['lightblue', 'lightgreen', 'orange', 'red'][:len(sizes)]
            plt.bar(sizes, percentages, color=colors, alpha=0.8, edgecolor='black')
            plt.title('Size Category Distribution')
            plt.xlabel('Size Category')
            plt.ylabel('Percentage (%)')
            plt.xticks(rotation=45)
        
        # Health distribution
        if health_counts:
            plt.subplot(2, 2, (3, 4))
            conditions = list(health_counts.keys())
            counts = list(health_counts.values())
            total = sum(counts)
            percentages = [(count/total)*100 for count in counts]
            
            plt.bar(conditions, percentages, color='lightcoral', alpha=0.8, edgecolor='red')
            plt.title('Health Condition Distribution')
            plt.xlabel('Health Condition')
            plt.ylabel('Percentage (%)')
            plt.xticks(rotation=45)
        
        plt.tight_layout()
        self.save_or_show('kaggle_data_analysis.png')

    # Add this method to your generate_histograms.py file

    def generate_length_of_stay_distribution(self):
        """Generate length of stay distribution"""
        self.stdout.write('\n📊 Generating Length of Stay Distribution...')
    
        # Query animals with Kaggle data for time in shelter
        animals_with_kaggle = Animal.objects.filter(
            last_location_json__kaggle_data__isnull=False
        )
    
        stay_days = []
        for animal in animals_with_kaggle:
            kaggle_data = animal.last_location_json.get('kaggle_data', {})
            days = kaggle_data.get('time_in_shelter_days')
            if days is not None:
                try:
                    stay_days.append(float(days))
                except (ValueError, TypeError):
                    continue
    
        if not stay_days:
            self.stdout.write('  ⚠️  No length of stay data found!')
            return
    
        # Create histogram
        plt.figure(figsize=(12, 7))
        plt.hist(stay_days, bins=40, color='lightgreen', alpha=0.7, edgecolor='green')
    
        plt.title('Length of Stay Distribution - Shelter Database Analysis', 
                 fontsize=14, fontweight='bold')
        plt.xlabel('Days in Shelter')
        plt.ylabel('Frequency')
    
        # Add statistics
        mean_stay = np.mean(stay_days)
        median_stay = np.median(stay_days)
        plt.axvline(mean_stay, color='red', linestyle='--', linewidth=2, 
                   label=f'Mean: {mean_stay:.1f} days')
        plt.axvline(median_stay, color='orange', linestyle='--', linewidth=2, 
                   label=f'Median: {median_stay:.1f} days')
    
        plt.legend()
        plt.grid(axis='y', alpha=0.3)
        plt.tight_layout()
    
        self.save_or_show('length_of_stay_distribution.png')

