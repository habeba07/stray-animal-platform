# adoptions/apps.py
from django.apps import AppConfig

class AdoptionsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'adoptions'
    
    def ready(self):
        """Initialize ML models when Django starts"""
        try:
            # Auto-load ML models on startup
            from .ml_matching import MLAdoptionMatcher
            
            # Initialize the matcher (this will auto-load models)
            matcher = MLAdoptionMatcher()
            
            print("✅ ML models auto-loaded on startup")
            
        except Exception as e:
            print(f"⚠️ ML auto-loading failed: {e}")
