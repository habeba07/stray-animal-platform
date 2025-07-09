import pandas as pd
from django.core.management.base import BaseCommand
import os
from django.conf import settings

class Command(BaseCommand):
    help = 'Inspect the downloaded CSV files to understand their structure'
    
    def handle(self, *args, **options):
        data_path = "data"  # Relative path that Docker can see
        
        files = [
            'austin_animal_intakes.csv',
            'austin_animal_outcomes.csv', 
            'pet_adoption_dataset.csv'
        ]
        
        for filename in files:
            filepath = os.path.join(data_path, filename)
            if os.path.exists(filepath):
                self.stdout.write(f"\n{'='*50}")
                self.stdout.write(f"ANALYZING: {filename}")
                self.stdout.write(f"{'='*50}")
                
                try:
                    # Read just first few rows
                    df = pd.read_csv(filepath, nrows=5)
                    
                    self.stdout.write(f"Shape: {df.shape}")
                    self.stdout.write(f"Columns: {list(df.columns)}")
                    self.stdout.write(f"\nFirst few rows:")
                    self.stdout.write(str(df.head()))
                    
                    # Check for missing values
                    self.stdout.write(f"\nMissing values per column:")
                    self.stdout.write(str(df.isnull().sum()))
                    
                except Exception as e:
                    self.stdout.write(f"Error reading {filename}: {str(e)}")
            else:
                self.stdout.write(f"File not found: {filepath}")
        
        self.stdout.write(f"\n{'='*50}")
        self.stdout.write("INSPECTION COMPLETE")
        self.stdout.write(f"{'='*50}")
