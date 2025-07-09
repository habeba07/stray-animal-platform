import pandas as pd
from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Point
from animals.models import Animal
from users.models import User
import os
from datetime import datetime
import re

class Command(BaseCommand):
    help = 'Load animal data from CSV files into the database'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--dataset',
            type=str,
            choices=['austin_intakes', 'austin_outcomes', 'kaggle_pets', 'all'],
            default='all',
            help='Which dataset to load'
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=1000,
            help='Limit number of records to load (for testing)'
        )
    
    def handle(self, *args, **options):
        dataset = options['dataset']
        limit = options['limit']
        
        self.stdout.write(f"Loading dataset: {dataset}")
        self.stdout.write(f"Limit: {limit} records")
        
        if dataset in ['austin_intakes', 'all']:
            self.load_austin_intakes(limit)
        
        if dataset in ['kaggle_pets', 'all']:
            self.load_kaggle_pets(limit)
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully loaded datasets!')
        )
    
    def load_austin_intakes(self, limit):
        """Load Austin Animal Center intake data"""
        self.stdout.write("Loading Austin Animal Intakes...")
        
        df = pd.read_csv('data/austin_animal_intakes.csv', nrows=limit)
        
        loaded_count = 0
        skipped_count = 0
        
        for index, row in df.iterrows():
            try:
                # Check if animal already exists
                animal_id = str(row['Animal ID'])
                if Animal.objects.filter(name=animal_id).exists():
                    skipped_count += 1
                    continue
                
                # Map CSV data to Animal model fields
                animal_data = {
                    'name': row['Name'] if pd.notna(row['Name']) else f"Animal_{animal_id}",
                    'animal_type': self.map_animal_type(row['Animal Type']),
                    'breed': row['Breed'][:100] if pd.notna(row['Breed']) else 'Unknown',
                    'gender': self.map_gender(row['Sex upon Intake']),
                    'age_estimate': row['Age upon Intake'][:50] if pd.notna(row['Age upon Intake']) else 'Unknown',
                    'color': row['Color'][:100] if pd.notna(row['Color']) else 'Unknown',
                    'status': 'REPORTED',  # Default status for intakes
                    'intake_date': self.parse_datetime(row['DateTime']),
                }
                
                # Handle location data
                if pd.notna(row['Found Location']) and row['Found Location'] != '':
                    # Store location as JSON for now (can geocode later)
                    animal_data['last_location_json'] = {
                        'address': row['Found Location'],
                        'source': 'austin_intake'
                    }
                
                # Create the animal record
                animal = Animal.objects.create(**animal_data)
                loaded_count += 1
                
                if loaded_count % 100 == 0:
                    self.stdout.write(f"Loaded {loaded_count} Austin intake records...")
                    
            except Exception as e:
                self.stdout.write(f"Error processing row {index}: {str(e)}")
                skipped_count += 1
                continue
        
        self.stdout.write(f"Austin Intakes - Loaded: {loaded_count}, Skipped: {skipped_count}")
    
    def load_kaggle_pets(self, limit):
        """Load Kaggle pet adoption dataset"""
        self.stdout.write("Loading Kaggle Pet Adoption Data...")
        
        df = pd.read_csv('data/pet_adoption_dataset.csv', nrows=limit)
        
        loaded_count = 0
        skipped_count = 0
        
        for index, row in df.iterrows():
            try:
                # Check if pet already exists
                pet_id = str(row['PetID'])
                if Animal.objects.filter(name=f"Pet_{pet_id}").exists():
                    skipped_count += 1
                    continue
                
                # Map CSV data to Animal model fields
                animal_data = {
                    'name': f"Pet_{pet_id}",
                    'animal_type': self.map_animal_type(row['PetType']),
                    'breed': row['Breed'][:100] if pd.notna(row['Breed']) else 'Unknown',
                    'gender': 'UNKNOWN',  # Not provided in this dataset
                    'age_estimate': f"{row['AgeMonths']} months" if pd.notna(row['AgeMonths']) else 'Unknown',
                    'weight': float(row['WeightKg']) if pd.notna(row['WeightKg']) else None,
                    'color': row['Color'][:100] if pd.notna(row['Color']) else 'Unknown',
                    'status': 'AVAILABLE' if row['AdoptionLikelihood'] == 1 else 'IN_SHELTER',
                    'vaccinated': bool(row['Vaccinated']) if pd.notna(row['Vaccinated']) else False,
                    'adoption_fee': float(row['AdoptionFee']) if pd.notna(row['AdoptionFee']) else None,
                }
                
                # Store ML-relevant data in last_location_json for later use
                animal_data['last_location_json'] = {
                    'kaggle_data': {
                        'pet_id': int(row['PetID']),
                        'size': row['Size'],
                        'time_in_shelter_days': int(row['TimeInShelterDays']),
                        'adoption_likelihood': int(row['AdoptionLikelihood']),
                        'previous_owner': bool(row['PreviousOwner']),
                        'health_condition': int(row['HealthCondition'])
                    }
                }
                
                # Create the animal record
                animal = Animal.objects.create(**animal_data)
                loaded_count += 1
                
                if loaded_count % 100 == 0:
                    self.stdout.write(f"Loaded {loaded_count} Kaggle pet records...")
                    
            except Exception as e:
                self.stdout.write(f"Error processing row {index}: {str(e)}")
                skipped_count += 1
                continue
        
        self.stdout.write(f"Kaggle Pets - Loaded: {loaded_count}, Skipped: {skipped_count}")
    
    def map_animal_type(self, animal_type):
        """Map various animal types to model choices"""
        if pd.isna(animal_type):
            return 'OTHER'
        
        animal_type = str(animal_type).upper().strip()
        
        if 'DOG' in animal_type:
            return 'DOG'
        elif 'CAT' in animal_type:
            return 'CAT'
        else:
            return 'OTHER'
    
    def map_gender(self, sex_value):
        """Map sex values to gender choices"""
        if pd.isna(sex_value):
            return 'UNKNOWN'
        
        sex_str = str(sex_value).upper().strip()
        
        if 'MALE' in sex_str:
            return 'MALE'
        elif 'FEMALE' in sex_str:
            return 'FEMALE'
        else:
            return 'UNKNOWN'
    
    def parse_datetime(self, datetime_str):
        """Parse datetime string to Django datetime"""
        if pd.isna(datetime_str):
            return None
        
        try:
            # Try different datetime formats
            formats = [
                '%m/%d/%Y %I:%M:%S %p',  # 10/01/2013 07:51:00 AM
                '%Y-%m-%dT%H:%M:%S%z',   # 2013-12-02T00:00:00-05:00
                '%Y-%m-%d %H:%M:%S',     # 2013-12-02 00:00:00
            ]
            
            for fmt in formats:
                try:
                    return datetime.strptime(str(datetime_str), fmt)
                except ValueError:
                    continue
            
            # If no format works, return None
            return None
            
        except Exception:
            return None
