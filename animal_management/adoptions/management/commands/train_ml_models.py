# adoptions/management/commands/train_ml_models.py
from django.core.management.base import BaseCommand
from adoptions.ml_matching import MLAdoptionMatcher

class Command(BaseCommand):
    help = 'Train the ML adoption matching model'

    def handle(self, *args, **options):
        self.stdout.write('🤖 Starting ML model training...')
        
        # Initialize the ML matcher
        matcher = MLAdoptionMatcher()
        
        # Train the model
        success = matcher.train_model()
        
        if success:
            self.stdout.write(
                self.style.SUCCESS('✅ ML model training completed successfully!')
            )
        else:
            self.stdout.write(
                self.style.WARNING('⚠️ ML model training failed - not enough data or other issues')
            )
            self.stdout.write('💡 Tip: You need at least 5 successful adoptions to train the model')
        
        self.stdout.write('📖 Model will use rule-based matching as fallback')
